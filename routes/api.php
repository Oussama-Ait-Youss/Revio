<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ServerController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
});

// server routes

Route::get('/servers', [ServerController::class, 'index']);
Route::get('/servers/{id}', [ServerController::class, 'show']);
Route::post('/servers', [ServerController::class, 'store']);
Route::put('/servers/{id}', [ServerController::class, 'update']);
Route::delete('/servers/{id}', [ServerController::class, 'destroy']);
