<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\MedicalRecordController;
use App\Http\Controllers\MedicalHistoryController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\AppointmentScheduleController;
use App\Http\Controllers\DentalHistoryController;
use App\Http\Controllers\DentalRecordController;

// ---------------------------
// Public Routes
// ---------------------------
Route::post('/signup', [AuthController::class, 'signup']);
Route::post('/login', [AuthController::class, 'login']);

// ---------------------------
// Protected Routes
// ---------------------------
Route::middleware('auth:sanctum')->group(function () {

    // Authentication
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'userInfo']);
    Route::get('/admin', [AuthController::class, 'admin']);

    // Users
    Route::get('/users', [AuthController::class, 'getAllUsers']);
    Route::get('/users/filtered', [AuthController::class, 'filteredUsers']);
    Route::get('/users/{id}', [AuthController::class, 'getUser']);
    Route::get('/users/medical-staff', [AuthController::class, 'getMedicalStaff']);

    // Inventory
    Route::apiResource('inventory', InventoryController::class);
    Route::post('/inventory/deduct', [InventoryController::class, 'deduct']);

    // Medical Records
    Route::get('/medical-records/user', [MedicalRecordController::class, 'getUserRecords']);
    Route::get('/medical-records/user/{user_id}', [MedicalRecordController::class, 'getByUserId']);
    Route::apiResource('medical-records', MedicalRecordController::class);
    Route::get('/illness-data', [MedicalRecordController::class, 'getIllnessData']);
    

    // Medical History
    Route::get('/medical-history/{userId}', [MedicalHistoryController::class, 'show']);
    Route::post('/medical-history/{userId}', [MedicalHistoryController::class, 'storeOrUpdate']);

    // Appointments
    Route::get('/appointments', [AppointmentController::class, 'index']);
    Route::get('/appointments/available-slots', [AppointmentController::class, 'getAvailableSlots']);
    Route::get('/appointments/my-appointments', [AppointmentController::class, 'getMyAppointments']);
    Route::post('/appointments', [AppointmentController::class, 'store']);
    Route::put('/appointments/{id}/status', [AppointmentController::class, 'updateStatus']);
    Route::post('/appointments/{id}/cancel', [AppointmentController::class, 'cancel']);
    Route::delete('/appointments/{id}', [AppointmentController::class, 'destroy']);

    // Schedule Management
    Route::get('/appointment-schedule', [AppointmentScheduleController::class, 'index']);
    Route::post('/appointment-schedule', [AppointmentScheduleController::class, 'store']);
    Route::post('/appointment-schedule/clear-cache', [AppointmentScheduleController::class, 'clearCache']);
    Route::post('/appointment-schedule/check-availability', [AppointmentScheduleController::class, 'checkAvailability']);
});

    // Dental History 
    Route::get('/dental-history/{userId}', [DentalHistoryController::class, 'show']);
    Route::post('/dental-history/{userId}', [DentalHistoryController::class, 'storeOrUpdate']);
    Route::get('/dental-history/{userId}/statistics', [DentalHistoryController::class, 'getStatistics']);

    // Dental Records 
    Route::get('/dental-records/user/{userId}', [DentalRecordController::class, 'index']);
    Route::post('/dental-records', [DentalRecordController::class, 'store']);
    Route::get('/dental-records/{id}', [DentalRecordController::class, 'show']);
    Route::put('/dental-records/{id}', [DentalRecordController::class, 'update']);
    Route::delete('/dental-records/{id}', [DentalRecordController::class, 'destroy']);
    Route::get('/dental-records/user/{userId}/statistics', [DentalRecordController::class, 'getStatistics']);

// Update User Account Type
Route::middleware('auth:sanctum')->put('/users/{userId}/account-type', [AuthController::class, 'updateAccountType']);