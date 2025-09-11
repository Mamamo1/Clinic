<?php

namespace App\Http\Controllers;

use App\Http\Requests\SignupRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    private $secretKey;

    public function __construct()
    {
        // Read from .env (not React env)
        $this->secretKey = env('AES_SECRET_KEY');
    }

    private function decryptAES($encrypted)
    {
        if (!$encrypted) return null;

        try {
            // Check if value looks like Base64
            $decoded = base64_decode($encrypted, true);
            if ($decoded === false) {
                // not base64 → probably plaintext stored before
                return $encrypted;
            }

            // Extract IV (first 16 bytes)
            $iv = substr($decoded, 0, 16);
            $ciphertext = substr($decoded, 16);

            $key = substr(hash('sha256', $this->secretKey, true), 0, 32);

            $decrypted = openssl_decrypt(
                $ciphertext,
                "AES-256-CBC",
                $key,
                OPENSSL_RAW_DATA,
                $iv
            );

            // If decryption fails, return original string (for backward compatibility)
            return $decrypted !== false ? $decrypted : $encrypted;
        } catch (\Exception $e) {
            // Log error and return original value for backward compatibility
            Log::error('AES Decryption failed', ['error' => $e->getMessage()]);
            return $encrypted;
        }
    }

    private function secureResponse($data, $status = 200): JsonResponse
    {
        return response()->json($data, $status)
            ->header('Access-Control-Allow-Origin', '*')
            ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
            ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept')
            ->header('Access-Control-Allow-Credentials', 'false')
            ->header('X-Content-Type-Options', 'nosniff')
            ->header('X-Frame-Options', 'DENY')
            ->header('X-XSS-Protection', '1; mode=block')
            ->header('Referrer-Policy', 'strict-origin-when-cross-origin');
    }

    private function checkRateLimit($key, $maxAttempts = 5, $decayMinutes = 15)
    {
        if (RateLimiter::tooManyAttempts($key, $maxAttempts)) {
            $seconds = RateLimiter::availableIn($key);
            throw ValidationException::withMessages([
                'email' => ["Too many login attempts. Please try again in {$seconds} seconds."],
            ]);
        }
    }

    public function handlePreflight(): JsonResponse
    {
        return response()->json(['message' => 'OK'], 200)
            ->header('Access-Control-Allow-Origin', '*')
            ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
            ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept')
            ->header('Access-Control-Allow-Credentials', 'false')
            ->header('Access-Control-Max-Age', '86400');
    }

    /**
     * Handle user signup.
     * 
     */
    public function signup(SignupRequest $request): JsonResponse
    {
        try {
            $data = $request->validated();

            if (User::where('email', $data['email'])->exists()) {
                return $this->secureResponse([
                    'success' => false,
                    'message' => 'Email already registered'
                ], 422);
            }

            $mobile = $this->decryptAES($data['mobile'] ?? null);
            $telephone = $this->decryptAES($data['telephone'] ?? null);
            $street = $this->decryptAES($data['street'] ?? null);
            $city = $this->decryptAES($data['city'] ?? null);
            $state = $this->decryptAES($data['state'] ?? null);

            $userData = [
                'first_name' => $data['first_name'],
                'middle_name' => $data['middle_name'] ?? '',
                'last_name' => $data['last_name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'account_type' => $data['account_type'],
                'date_of_birth' => $data['dob'],
                'gender' => $data['gender'],
                'mobile' => $mobile,
                'telephone' => $telephone,
                'street' => $street,
                'city' => $city,
                'state' => $state,
            ];

            if (in_array($data['account_type'], ['SHS', 'College'])) {
                $userData['student_number'] = $data['student_number'];
                $userData['course'] = $data['course'];
            } elseif ($data['account_type'] === 'Employee') {
                $userData['employee_id'] = $data['employee_id'];
            }

            $user = User::create($userData);
            $token = $user->createToken('auth-token', ['*'], now()->addDays(7))->plainTextToken;

            Log::info('User registered successfully', ['user_id' => $user->id, 'email' => $user->email]);

            return $this->secureResponse([
                'success' => true,
                'message' => 'Registration successful',
                'user' => [
                    'id' => $user->id,
                    'first_name' => $user->first_name,
                    'email' => $user->email,
                    'account_type' => $user->account_type,
                ],
                'token' => $token,
            ], 201);

        } catch (\Exception $e) {
            Log::error('Registration failed', ['error' => $e->getMessage()]);
            return $this->secureResponse([
                'success' => false,
                'message' => 'Registration failed'
            ], 500);
        }
    }

    /**
     * Handle user login.
     */
    public function login(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'email' => 'required|email|max:255',
                'password' => 'required|string|min:6|max:255',
                'campus' => 'sometimes|string|max:100'
            ]);

            $email = $request->email;
            $rateLimitKey = 'login:' . $request->ip() . ':' . $email;

            $this->checkRateLimit($rateLimitKey);

            if (!Auth::attempt($request->only('email', 'password'))) {
                RateLimiter::hit($rateLimitKey, 900); // 15 minutes
                
                Log::warning('Failed login attempt', [
                    'email' => $email,
                    'ip' => $request->ip(),
                    'user_agent' => $request->userAgent()
                ]);

                return $this->secureResponse([
                    'success' => false,
                    'message' => 'Invalid credentials'
                ], 401);
            }

            $user = Auth::user();

            $allowedTypes = ['SuperAdmin', 'Doctor', 'Nurse', 'Dentist', 'SHS', 'College', 'Employee'];
            if (!in_array($user->account_type, $allowedTypes)) {
                Log::warning('Unauthorized account type login attempt', [
                    'user_id' => $user->id,
                    'account_type' => $user->account_type
                ]);
                
                return $this->secureResponse([
                    'success' => false,
                    'message' => 'Account not authorized'
                ], 403);
            }

            RateLimiter::clear($rateLimitKey);

            $token = $user->createToken('auth-token', ['*'], now()->addDays(7))->plainTextToken;

            Log::info('User logged in successfully', [
                'user_id' => $user->id,
                'email' => $user->email,
                'ip' => $request->ip()
            ]);

            return $this->secureResponse([
                'success' => true,
                'message' => 'Login successful',
                'user' => [
                    'id' => $user->id,
                    'first_name' => $user->first_name,
                    'email' => $user->email,
                    'account_type' => $user->account_type,
                ],
                'token' => $token,
            ]);

        } catch (ValidationException $e) {
            return $this->secureResponse([
                'success' => false,
                'message' => $e->getMessage(),
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Login error', ['error' => $e->getMessage()]);
            return $this->secureResponse([
                'success' => false,
                'message' => 'Authentication failed'
            ], 500);
        }
    }

    /**
     * Return authenticated user's full info.
     */
    public function userInfo(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            if (!$user) {
                return $this->secureResponse(['error' => 'Unauthenticated'], 401);
            }

            return $this->secureResponse([
                'id' => $user->id,
                'first_name' => $user->first_name,
                'middle_name' => $user->middle_name,
                'last_name' => $user->last_name,
                'gender' => $user->gender,
                'dob' => $user->date_of_birth,
                'email' => $user->email,
                'student_number' => $user->student_number,
                'course' => $user->course,
                'employee_id' => $user->employee_id,

                // Decrypt before sending
                'mobile' => $this->decryptAES($user->mobile),
                'telephone' => $this->decryptAES($user->telephone),
                'state' => $this->decryptAES($user->state),
                'city' => $this->decryptAES($user->city),
                'street' => $this->decryptAES($user->street),

                'account_type' => $user->account_type,
            ]);
        } catch (\Throwable $e) {
            return $this->secureResponse(['error' => 'Server error: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Return all users (restricted to Super Admin and Admin_Nurse).
     */
    public function getAllUsers(): JsonResponse
    {
        try {
            $user = auth()->user();

            if (!$user) {
                return $this->secureResponse(['error' => 'Unauthorized'], 403);
            }

            $authorizedRoles = ['SuperAdmin', 'Doctor', 'Nurse', 'Dentist'];
            if (!in_array($user->account_type, $authorizedRoles)) {
                return $this->secureResponse(['error' => 'Unauthorized access'], 403);
            }

            return $this->secureResponse(['data' => User::all()]);
        } catch (\Throwable $e) {
            return $this->secureResponse(['error' => 'Server error: ' . $e->getMessage()], 500);
        }
    }

    public function filteredUsers(Request $request): JsonResponse
    {
        try {
            $user = auth()->user();

            if (!$user) {
                return $this->secureResponse(['error' => 'Unauthorized'], 403);
            }

            $query = User::query();

            // Exclude SuperAdmin always
            $query->where('account_type', '!=', 'SuperAdmin');

            // Apply filter based on 'accountType' or role category
            if ($request->has('filter') && $request->filter !== '') {
                if ($request->filter === 'Staff') {
                    $query->whereIn('account_type', ['Doctor', 'Nurse', 'Dentist']);
                } else {
                    $query->where('account_type', $request->filter);
                }
            }

            // Optional: Search functionality
            if ($request->has('search') && $request->search !== '') {
                $query->where(function ($q) use ($request) {
                    $q->where('first_name', 'like', '%' . $request->search . '%')
                      ->orWhere('last_name', 'like', '%' . $request->search . '%')
                      ->orWhere('email', 'like', '%' . $request->search . '%');
                });
            }

            // Return paginated results
            $users = $query->paginate(10);

            return $this->secureResponse(['data' => $users]);
        } catch (\Throwable $e) {
            return $this->secureResponse(['error' => 'Server error: ' . $e->getMessage()], 500);
        }
    }

    public function getUser($id)
    {
        $user = User::find($id);
        if (!$user) {
            return $this->secureResponse(['message' => 'User not found'], 404);
        }
        return $this->secureResponse(['data' => $user]);
    }

    public function getMedicalStaff()
    {
        $medicalStaff = User::whereIn('account_type', ['Doctor', 'Nurse'])
                            ->select('id', 'first_name', 'last_name', 'account_type')
                            ->get()
                            ->map(function ($user) {
                                $user->full_name = trim($user->first_name . ' ' . $user->last_name);
                                return $user;
                            });
        
        return $this->secureResponse([
            'data' => $medicalStaff
        ]);
    }

    public function admin(): JsonResponse
    {
        $user = auth()->user();
        if ($user->account_type !== 'SuperAdmin') {
            return $this->secureResponse(['error' => 'Unauthorized'], 403);
        }

        return $this->secureResponse(['message' => 'Welcome, Super Admin']);
    }

    public function updateAccountType(Request $request, $userId): JsonResponse
    {
        try {
            $user = auth()->user();
            
            if (!$user || $user->account_type !== 'SuperAdmin') {
                return $this->secureResponse([
                    'success' => false,
                    'message' => 'Unauthorized. Only SuperAdmin can change account types.'
                ], 403);
            }
            
            $request->validate([
                'account_type' => 'required|in:Doctor,Nurse,Dentist,SHS,College,Employee'
            ]);
            
            $targetUser = User::find($userId);
            if (!$targetUser) {
                return $this->secureResponse([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }
            
            if ($targetUser->account_type === 'SuperAdmin' && $user->id !== $targetUser->id) {
                return $this->secureResponse([
                    'success' => false,
                    'message' => 'Cannot modify other SuperAdmin accounts'
                ], 403);
            }
            
            $targetUser->account_type = $request->account_type;
            $targetUser->save();
            
            return $this->secureResponse([
                'success' => true,
                'message' => 'Account type updated successfully',
                'user' => $targetUser
            ]);
            
        } catch (\Throwable $e) {
            return $this->secureResponse([
                'success' => false,
                'message' => 'Server error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Logout user and delete current token.
     */
    public function logout(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            
            $request->user()->currentAccessToken()->delete();
            
            Log::info('User logged out', ['user_id' => $user->id]);
            
            return $this->secureResponse([
                'success' => true,
                'message' => 'Logged out successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Logout error', ['error' => $e->getMessage()]);
            return $this->secureResponse([
                'success' => false,
                'message' => 'Logout failed'
            ], 500);
        }
    }
}
