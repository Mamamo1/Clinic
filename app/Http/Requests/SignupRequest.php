<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SignupRequest extends FormRequest
{
    public function rules()
{
    return [
        'first_name'     => 'required|string',
        'middle_name'    => 'nullable|string',
        'last_name'      => 'required|string',
        'email'          => 'required|email|unique:users,email',
        'password'       => 'required|string|min:8|confirmed',
        'student_number' => 'required|string|max:255',
        'course' => 'required|string|max:255',
        'dob'            => 'required|date',
        'mobile'         => 'required|string',
        'gender'         => 'required|string',
        'salutation'     => 'required|string',
        'street'         => 'nullable|string',
        'city'           => 'required|string',
        'state'          => 'required|string',
        'zipcode'        => 'nullable|string',
        'telephone'      => 'nullable|string',
    ];
}

    public function messages()
    {
        return [
            'firstName.required' => 'First name is required.',
            'lastName.required' => 'Last name is required.',
            'email.required' => 'Email is required.',
            'email.email' => 'Email must be a valid email address.',
            'email.unique' => 'This email is already taken.',
            'password.required' => 'Password is required.',
            'password.min' => 'Password must be at least 8 characters.',
            'password.confirmed' => 'Passwords do not match.',
            'dob.required' => 'Date of birth is required.',
            'student_number.required' => 'Student number is required.',
            'course.required' => 'Course is required.',

            // You can add more custom messages if you like
        ];
    }

    public function authorize()
    {
        return true; // Allow anyone to make this request (you can adjust this if needed)
    }
}
