<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\MedicalRecordController;

Route::post('/signup', [AuthController::class, 'signup']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    // Authenticated User Routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'userInfo']);
    Route::get('/admin', [AuthController::class, 'admin']);
    Route::get('/users', [AuthController::class, 'getAllUsers']);
    Route::get('/users/filtered', [AuthController::class, 'filteredUsers']);
    Route::get('/users/{id}', [AuthController::class, 'getUser']);

    // Inventory & Deduction
    Route::apiResource('inventory', InventoryController::class);
    Route::post('/inventory/deduct', [InventoryController::class, 'deduct']);

    // Medical Records - Custom route for fetching by user ID (must come BEFORE apiResource)
    Route::get('/medical-records/user/{user_id}', [MedicalRecordController::class, 'getByUserId']);
    
    // Medical Records - Resource routes (DELETE will work now)
    Route::apiResource('medical-records', MedicalRecordController::class);

    // Medical Staff Filter
    Route::get('/users/medical-staff', [AuthController::class, 'getMedicalStaff']);
});