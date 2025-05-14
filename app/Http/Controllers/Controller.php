<?php

namespace App\Http\Controllers;

use Illuminate\Routing\Controller as BaseController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

abstract class Controller extends BaseController
{
    /**
     * Validate incoming data.
     *
     * @param  array  $data
     * @param  array  $rules
     * @return \Illuminate\Contracts\Validation\Validator
     */
    protected function validateData(array $data, array $rules)
    {
        return Validator::make($data, $rules);
    }

    /**
     * A generic response method to send responses in a consistent format.
     *
     * @param  mixed  $data
     * @param  int  $status
     * @return \Illuminate\Http\JsonResponse
     */
    protected function sendResponse($data, $status = 200)
    {
        return response()->json([
            'success' => true,
            'data' => $data
        ], $status);
    }

    /**
     * A generic method to send error responses.
     *
     * @param  string  $message
     * @param  int  $status
     * @return \Illuminate\Http\JsonResponse
     */
    protected function sendError($message, $status = 400)
    {
        return response()->json([
            'success' => false,
            'message' => $message
        ], $status);
    }
}
