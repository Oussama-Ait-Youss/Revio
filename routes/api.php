<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ServerController;
use App\Http\Controllers\Api\NfcCardController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\NfcRequestController;
use App\Http\Controllers\Api\Admin\AdminNfcController;

Route::get('/review/{token}', [ReviewController::class, 'getServerByToken']);
Route::post('/review', [ReviewController::class, 'store']);

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Manager setup restaurant onboarding
    Route::post('/manager/setup-restaurant', [\App\Http\Controllers\Api\RestaurantController::class, 'setup']);

    // Manager NFC requests
    Route::get('/manager/nfc-requests', [NfcRequestController::class, 'index']);
    Route::post('/manager/nfc-requests', [NfcRequestController::class, 'store']);

    // Dashboard stats (scoped inside controller by role)
    Route::get('/dashboard/stats', [\App\Http\Controllers\Api\DashboardController::class, 'stats']);

    // Shared ADMIN and MANAGER routes
    Route::middleware('role:ADMIN,MANAGER')->group(function () {
        // Server management
        Route::get('/servers', [ServerController::class, 'index']);
        Route::get('/servers/{id}', [ServerController::class, 'show']);
        Route::post('/servers', [ServerController::class, 'store']);
        Route::put('/servers/{id}', [ServerController::class, 'update']);
        Route::delete('/servers/{id}', [ServerController::class, 'destroy']);

        // Reviews management
        Route::get('/reviews', [ReviewController::class, 'index']);

        // NFC card management
        Route::get('/nfc-cards', [NfcCardController::class, 'index']);
        Route::post('/nfc-cards', [NfcCardController::class, 'store']);
        Route::post('/nfc-cards/{id}/assign', [NfcCardController::class, 'assign']);
        Route::patch('/nfc-cards/{id}/toggle', [NfcCardController::class, 'toggle']);
        Route::delete('/nfc-cards/{id}', [NfcCardController::class, 'destroy']);
    });

    // ADMIN only routes
    Route::middleware('role:ADMIN')->group(function () {
        Route::get('/admin/restaurants', [\App\Http\Controllers\Api\RestaurantController::class, 'index']);
        Route::post('/admin/restaurants', [\App\Http\Controllers\Api\RestaurantController::class, 'store']);
        Route::post('/admin/managers', [\App\Http\Controllers\Api\RestaurantController::class, 'addManager']);

        // Admin NFC Logistics
        Route::post('/admin/nfc/manufacture', [AdminNfcController::class, 'manufacture']);
        Route::get('/admin/nfc/requests-queue', [AdminNfcController::class, 'requestsQueue']);
        Route::patch('/admin/nfc/requests/{id}/process', [AdminNfcController::class, 'process']);
    });

    // SERVER only routes
    Route::get('/my-reviews', [ServerController::class, 'myReviews'])->middleware('role:SERVER');
});

