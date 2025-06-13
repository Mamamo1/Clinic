<?php

namespace App\Http\Controllers;

use App\Http\Requests\SignupRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\JsonResponse;

class AuthController extends Controller
{
    /**
     * Handle user signup.
     */
    public function signup(SignupRequest $request): JsonResponse
    {
        $data = $request->validated();

        $userData = [
            'first_name'     => $data['first_name'],
            'middle_name'    => $data['middle_name'] ?? '',
            'last_name'      => $data['last_name'],
            'email'          => $data['email'],
            'password'       => Hash::make($data['password']),
            'account_type'   => $data['account_type'],
            'date_of_birth'  => $data['dob'],
            'mobile'         => $data['mobile'],
            'gender'         => $data['gender'],
            'salutation'     => $data['salutation'],
            'street'         => $data['street'],
            'city'           => $data['city'],
            'state'          => $data['state'],
            'zipcode'        => $data['zipcode'],
            'telephone'      => $data['telephone'],
        ];
        if (in_array($data['account_type'], ['SHS', 'College'])) {
            $userData['student_number'] = $data['student_number'];
            $userData['course'] = $data['course'];
        } elseif ($data['account_type'] === 'Employee') {
            $userData['employee_id'] = $data['employee_id'];
        }

        $user = User::create($userData);
        $token = $user->createToken('main')->plainTextToken;

        return $this->sendResponse([
            'message' => 'Registration successful! You can now log in.',
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    /**
     * Handle user login.
     */
    public function login(Request $request): JsonResponse
{
    $request->validate([
        'email' => 'required|email',
        'password' => 'required',
    ]);

    if (!Auth::attempt($request->only('email', 'password'))) {
        return response()->json([
            'success' => false,
            'error' => 'Invalid credentials',
        ], 401);
    }

    $user = Auth::user();

    // Optional: Check if account_type is allowed (optional for security policies)
    $allowedTypes = ['SuperAdmin', 'Doctor', 'Nurse', 'Dentist', 'SHS', 'College', 'Employee'];

    if (!in_array($user->account_type, $allowedTypes)) {
        return response()->json([
            'success' => false,
            'error' => 'Unauthorized account type',
        ], 403);
    }

    $token = $user->createToken('main')->plainTextToken;

    return response()->json([
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
}

    /**
     * Return authenticated user's full info.
     */
   public function userInfo(Request $request): JsonResponse
{
    try {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        return response()->json([
            'id' => $user->id,
            'first_name' => $user->first_name,
            'middle_name' => $user->middle_name,
            'last_name' => $user->last_name,
            'salutation' => $user->salutation,
            'gender' => $user->gender,
            'date_of_birth' => $user->date_of_birth,
            'email' => $user->email,
            'student_number' => $user->student_number,
            'course' => $user->course,
            'employee_id' => $user->employee_id,
            'mobile' => $user->mobile,
            'telephone' => $user->telephone,
            'zipcode' => $user->zipcode,
            'state' => $user->state,
            'city' => $user->city,
            'street' => $user->street,
            'account_type' => $user->account_type,
        ]);
    } catch (\Throwable $e) {
        return response()->json(['error' => 'Server error: ' . $e->getMessage()], 500);
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
            return $this->sendError('Unauthorized', 403);
        }

        return $this->sendResponse(User::all());
    } catch (\Throwable $e) {
        return $this->sendError('Server error: ' . $e->getMessage(), 500);
    }
}


public function filteredUsers(Request $request): JsonResponse
{
    try {
        $user = auth()->user();

        if (!$user) {
            return $this->sendError('Unauthorized', 403);
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

        return $this->sendResponse($users);
    } catch (\Throwable $e) {
        return $this->sendError('Server error: ' . $e->getMessage(), 500);
    }
}


public function getUser($id)
{
    $user = User::find($id);
    if (!$user) {
        return response()->json(['message' => 'User not found'], 404);
    }
    return response()->json(['data' => $user]);
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
    
    return response()->json([
        'data' => $medicalStaff
    ]);
}

public function admin(): JsonResponse
{
    $user = auth()->user();
    if ($user->account_type !== 'SuperAdmin') {
        return $this->sendError('Unauthorized', 403);
    }

    return $this->sendResponse(['message' => 'Welcome, Super Admin']);
}


    /**
     * Logout user and delete current token.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return $this->sendResponse('Logged out successfully');
    }
}
