<?php

use App\Http\Controllers\WatchListController;
use App\Http\Controllers\PartnershipController;
use App\Http\Controllers\NoteController;
use App\Http\Controllers\SpinnerGameController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// API routes that require authentication
Route::middleware('auth')->group(function () {
    // Watch List Routes
    Route::prefix('watch-list')->group(function () {
        Route::get('/', [WatchListController::class, 'index'])->name('api.watch-list.index');
        Route::post('/', [WatchListController::class, 'store'])->name('api.watch-list.store');
        Route::get('/{watchList}', [WatchListController::class, 'show'])->name('api.watch-list.show');
        Route::put('/{watchList}', [WatchListController::class, 'update'])->name('api.watch-list.update');
        Route::delete('/{watchList}', [WatchListController::class, 'destroy'])->name('api.watch-list.destroy');
        Route::get('/partner/list', [WatchListController::class, 'partnerWatchList'])->name('api.watch-list.partner');
    });

    // Partnership Routes
    Route::prefix('partnerships')->group(function () {
        Route::get('/', [PartnershipController::class, 'index'])->name('api.partnerships.index');
        Route::post('/', [PartnershipController::class, 'store'])->name('api.partnerships.store');
        Route::patch('/{partnership}/accept', [PartnershipController::class, 'accept'])->name('api.partnerships.accept');
        Route::patch('/{partnership}/reject', [PartnershipController::class, 'reject'])->name('api.partnerships.reject');
        Route::delete('/{partnership}', [PartnershipController::class, 'destroy'])->name('api.partnerships.destroy');
        
        // Test route to verify partnerships are working
        Route::get('/test', function () {
            return response()->json(['message' => 'Partnership routes are working!']);
        })->name('api.partnerships.test');
    });

    // Notes Routes
    Route::prefix('notes')->group(function () {
        Route::get('/', [NoteController::class, 'index'])->name('api.notes.index');
        Route::post('/', [NoteController::class, 'store'])->name('api.notes.store');
        Route::get('/{note}', [NoteController::class, 'show'])->name('api.notes.show');
        Route::patch('/{note}/read', [NoteController::class, 'markAsRead'])->name('api.notes.mark-read');
        Route::delete('/{note}', [NoteController::class, 'destroy'])->name('api.notes.destroy');
        Route::get('/unread/count', [NoteController::class, 'unreadCount'])->name('api.notes.unread-count');
    });

    // Spinner Game Routes
    Route::prefix('spinner')->group(function () {
        Route::get('/', [SpinnerGameController::class, 'index'])->name('api.spinner.index');
        Route::post('/spin', [SpinnerGameController::class, 'spin'])->name('api.spinner.spin');
        Route::get('/history', [SpinnerGameController::class, 'history'])->name('api.spinner.history');
        Route::get('/stats', [SpinnerGameController::class, 'stats'])->name('api.spinner.stats');
        Route::get('/{spinnerGame}', [SpinnerGameController::class, 'show'])->name('api.spinner.show');
    });
}); 