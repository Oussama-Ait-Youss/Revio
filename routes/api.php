<?php
use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ReviewController;

// Publicly accessible for NFC scans
Route::post('/submit-review', [ReviewController::class, 'store']);

// Public Routes
Route::post('/login', [AuthController::class, 'login']);

// Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // We'll add Dashboard & Server routes here later
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
});