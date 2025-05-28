<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SignupRequest extends FormRequest
{

   public function rules()
{
    return [
        'account_type'    => 'required|in:SHS,College,Employee',
        'first_name'     => 'required|string',
        'middle_name'    => 'nullable|string',
        'last_name'      => 'required|string',
        'email'          => 'required|email|unique:users,email',
        'password'       => 'required|string|min:8|confirmed',
        'student_number' => 'required_if:account_type,SHS,College|nullable|string|max:255',
        'course'         => 'required_if:account_type,SHS,College|nullable|string|max:255',
        'employee_id'    => 'required_if:account_type,Employee|nullable|string|max:255',
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
            'first_name.required' => 'First name is required.',
            'last_name.required' => 'Last name is required.',
            'email.required' => 'Email is required.',
            'email.email' => 'Email must be a valid email address.',
            'email.unique' => 'This email is already taken.',
            'password.required' => 'Password is required.',
            'password.min' => 'Password must be at least 8 characters.',
            'password.confirmed' => 'Passwords do not match.',
            'dob.required' => 'Date of birth is required.',
            'student_number.required_if' => 'Student number is required.',
            'course.required_if' => 'Course is required.',
            'employee_id.required_if' => 'Employee ID is required.',
            'account_type.required' => 'Account type is required.',
            'account_type.in' => 'Account type must be SHS, College, or Employee.',
        ];
    }

    public function authorize()
    {
        return true;
    }
}
