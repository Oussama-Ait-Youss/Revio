<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ServerController;
use App\Http\Controllers\Api\NfcCardController;
use App\Http\Controllers\Api\ReviewController;

Route::get('/review/{token}', [ReviewController::class, 'getServerByToken']);
Route::post('/review', [ReviewController::class, 'store']);

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    // auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);


    
    // server management
    Route::middleware('is_admin')->group(function (){
        Route::get('/servers', [ServerController::class, 'index']);
        Route::get('/my-reviews', [ServerController::class, 'myReviews']);
        Route::get('/servers/{id}', [ServerController::class, 'show']);
        Route::post('/servers', [ServerController::class, 'store']);
        Route::put('/servers/{id}', [ServerController::class, 'update']);
        Route::delete('/servers/{id}', [ServerController::class, 'destroy']);
        });
        // nfc card management
         Route::get('/nfc-cards', [NfcCardController::class, 'index']);
        Route::post('/nfc-cards', [NfcCardController::class, 'store']);

        Route::post('/nfc-cards/{id}/assign', [NfcCardController::class, 'assign']);

        Route::patch('/nfc-cards/{id}/toggle', [NfcCardController::class, 'toggle']);

        Route::delete('/nfc-cards/{id}', [NfcCardController::class, 'destroy']);
});

