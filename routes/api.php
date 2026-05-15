<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\Manager\DashboardController;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
| These routes do not require a token.
*/

// NFC Scan: Used by customers to submit feedback
Route::post('/submit-review', [ReviewController::class, 'store']);

// Authentication: Login for Admins and Servers
Route::post('/login', [AuthController::class, 'login']);


/*
|--------------------------------------------------------------------------
| Protected Routes (Sanctum)
|--------------------------------------------------------------------------
| All routes inside this group require a valid Bearer Token.
*/

Route::middleware('auth:sanctum')->group(function () {

    // Logout
    Route::post('/logout', [AuthController::class, 'logout']);

    // Get current authenticated user details
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    /*
    |--------------------------------------------------------------------------
    | Manager/Admin Routes
    |--------------------------------------------------------------------------
    */
    Route::middleware('admin')->prefix('manager')->group(function () {
        // Dashboard statistics
        Route::get('/stats', [DashboardController::class, 'stats']);
        
        // Recent reviews list
        Route::get('/reviews', [DashboardController::class, 'recentReviews']);
    });

    /*
    |--------------------------------------------------------------------------
    | Server Personal Space Routes
    |--------------------------------------------------------------------------
    */
    Route::prefix('server')->group(function () {
        // We will add server-specific stats/history here later
        // Route::get('/my-stats', [ServerController::class, 'stats']);
    });

});