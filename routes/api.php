<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\MedicalHistoryController;
use App\Http\Controllers\AppointmentController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Authentication routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);

// User management routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);
});

// Medical history routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/medical-history/{userId}', [MedicalHistoryController::class, 'show']);
    Route::post('/medical-history/{userId}', [MedicalHistoryController::class, 'store']);
    Route::put('/medical-history/{userId}', [MedicalHistoryController::class, 'update']);
});

// Appointment routes
Route::middleware('auth:sanctum')->group(function () {
    // Get all appointments (for staff)
    Route::get('/appointments', [AppointmentController::class, 'index']);
    
    // Get user's own appointments
    Route::get('/appointments/my', [AppointmentController::class, 'getUserAppointments']);
    
    // Get available time slots
    Route::get('/appointments/time-slots', [AppointmentController::class, 'getAvailableTimeSlots']);
    
    // Create new appointment
    Route::post('/appointments', [AppointmentController::class, 'store']);
    
    // Update appointment status (for staff)
    Route::put('/appointments/{id}/status', [AppointmentController::class, 'updateStatus']);
    
    // Cancel appointment (for users)
    Route::put('/appointments/{id}/cancel', [AppointmentController::class, 'cancel']);
    
    // Delete appointment (for admin only)
    Route::delete('/appointments/{id}', [AppointmentController::class, 'destroy']);
});
