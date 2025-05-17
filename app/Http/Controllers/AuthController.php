<?php

namespace App\Http\Controllers;

use App\Http\Requests\SignupRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    /**
     * Handle user signup.
     */
    public function signup(SignupRequest $request): JsonResponse
    {
        $data = $request->validated();

        $user = User::create([
            'first_name' => $data['first_name'],
            'middle_name' => $data['middle_name'] ?? '',
            'last_name' => $data['last_name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'student_number' => $data['student_number'],
            'course' => $data['course'],
            'date_of_birth' => $data['dob'],
            'mobile' => $data['mobile'],
            'gender' => $data['gender'],
            'salutation' => $data['salutation'],
            'street' => $data['street'],
            'city' => $data['city'],
            'state' => $data['state'],
            'zipcode' => $data['zipcode'],
            'telephone' => $data['telephone'],
        ]);

        $token = $user->createToken('main')->plainTextToken;

        return response()->json([
            'status' => 'success',
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
                'message' => 'Invalid credentials',
            ], 401);
        }

        $user = Auth::user();
        $token = $user->createToken('main')->plainTextToken;

        return response()->json([
            'success' => true,
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'account_type' => $user->account_type, // Add the account type
            ],
        ]);
    }

    /**
     * Return authenticated user's info.
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
            'mobile' => $user->mobile,
            'telephone' => $user->telephone,
            'zipcode' => $user->zipcode,
            'state' => $user->state,
            'city' => $user->city,
            'street' => $user->street,
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'error' => 'Server error',
            'message' => $e->getMessage()
        ], 500);
    }
}




    /**
     * Logout user and delete current token.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }
}
