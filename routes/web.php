<?php

use Illuminate\Container\Attributes\Auth;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
    
Route::get('/users', [Auth::class, 'index']);

});
