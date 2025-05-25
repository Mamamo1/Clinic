<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\InventoryController;

// Existing routes
Route::post('/signup', [AuthController::class, 'signup']);
Route::post('/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);
Route::middleware('auth:sanctum')->get('/user', [AuthController::class, 'userInfo']);
Route::middleware('auth:sanctum')->get('/admin', [AuthController::class, 'admin']);
Route::middleware('auth:sanctum')->get('/users', [AuthController::class, 'getAllUsers']);
Route::apiResource('inventory', InventoryController::class);


