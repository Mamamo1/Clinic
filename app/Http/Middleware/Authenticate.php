<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Auth\Middleware\Authenticate as Middleware;

class Authenticate extends Middleware
{
    protected function redirectTo($request)
    {
        if (!$request->expectsJson()) {
            // Return JSON instead of redirecting to login page
            abort(response()->json([
                'message' => 'Unauthenticated.'
            ], 401));
        }
    }
}
