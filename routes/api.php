<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\MedicalRecordController;
use App\Http\Controllers\MedicalHistoryController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\AppointmentScheduleController;

// ---------------------------
// Public Auth Routes
// ---------------------------
Route::post('/signup', [AuthController::class, 'signup']);
Route::post('/login', [AuthController::class, 'login']);

// ---------------------------
// Protected Routes
// ---------------------------
Route::middleware('auth:sanctum')->group(function () {

    // ---------------------------
    // Authentication
    // ---------------------------
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'userInfo']);
    Route::get('/admin', [AuthController::class, 'admin']);

    // ---------------------------
    // Users
    // ---------------------------
    Route::get('/users', [AuthController::class, 'getAllUsers']);
    Route::get('/users/filtered', [AuthController::class, 'filteredUsers']);
    Route::get('/users/{id}', [AuthController::class, 'getUser']);
    Route::get('/users/medical-staff', [AuthController::class, 'getMedicalStaff']);

    // ---------------------------
    // Inventory
    // ---------------------------
    Route::apiResource('inventory', InventoryController::class);
    Route::post('/inventory/deduct', [InventoryController::class, 'deduct']);

    // ---------------------------
    // Medical Records
    // ---------------------------
    Route::get('/medical-records/user/{user_id}', [MedicalRecordController::class, 'getByUserId']);
    Route::apiResource('medical-records', MedicalRecordController::class);

    // ---------------------------
    // Medical History
    // ---------------------------
    Route::middleware('auth:sanctum')->group(function () {
    Route::get('/medical-history/{userId}', [MedicalHistoryController::class, 'show']);
    Route::post('/medical-history/{userId}', [MedicalHistoryController::class, 'storeOrUpdate']);

    //Appointments
    Route::get('/appointments', [AppointmentController::class, 'index']);
        Route::put('/appointments/{id}/status', [AppointmentController::class, 'updateStatus']);
        Route::delete('/appointments/{id}', [AppointmentController::class, 'destroy']);
    });

    // ---------------------------
    // Appointments
    // ---------------------------
    Route::get('/appointments/available-slots', [AppointmentController::class, 'getAvailableSlots']);
    Route::get('/appointments/my-appointments', [AppointmentController::class, 'getMyAppointments']);
    Route::post('/appointments', [AppointmentController::class, 'store']);
    Route::post('/appointments/{id}/cancel', [AppointmentController::class, 'cancel']);

    // Schedule Management
    Route::get('/appointment-schedule', [App\Http\Controllers\AppointmentScheduleController::class, 'index']);
    Route::post('/appointment-schedule', [App\Http\Controllers\AppointmentScheduleController::class, 'store']);
    Route::post('/appointment-schedule/clear-cache', [App\Http\Controllers\AppointmentScheduleController::class, 'clearCache']);
    Route::post('/appointment-schedule/check-availability', [App\Http\Controllers\AppointmentScheduleController::class, 'checkAvailability']);
});
