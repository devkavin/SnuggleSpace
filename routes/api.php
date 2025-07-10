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
        Route::get('/', [WatchListController::class, 'index'])->name('watch-list.index');
        Route::post('/', [WatchListController::class, 'store'])->name('watch-list.store');
        Route::get('/{watchList}', [WatchListController::class, 'show'])->name('watch-list.show');
        Route::put('/{watchList}', [WatchListController::class, 'update'])->name('watch-list.update');
        Route::delete('/{watchList}', [WatchListController::class, 'destroy'])->name('watch-list.destroy');
        Route::get('/partner/list', [WatchListController::class, 'partnerWatchList'])->name('watch-list.partner');
    });

    // Partnership Routes
    Route::prefix('partnerships')->group(function () {
        Route::get('/', [PartnershipController::class, 'index'])->name('partnerships.index');
        Route::post('/', [PartnershipController::class, 'store'])->name('partnerships.store');
        Route::patch('/{partnership}/accept', [PartnershipController::class, 'accept'])->name('partnerships.accept');
        Route::patch('/{partnership}/reject', [PartnershipController::class, 'reject'])->name('partnerships.reject');
        Route::delete('/{partnership}', [PartnershipController::class, 'destroy'])->name('partnerships.destroy');
        
        // Test route to verify partnerships are working
        Route::get('/test', function () {
            return response()->json(['message' => 'Partnership routes are working!']);
        })->name('partnerships.test');
    });

    // Notes Routes
    Route::prefix('notes')->group(function () {
        Route::get('/', [NoteController::class, 'index'])->name('notes.index');
        Route::post('/', [NoteController::class, 'store'])->name('notes.store');
        Route::get('/{note}', [NoteController::class, 'show'])->name('notes.show');
        Route::patch('/{note}/read', [NoteController::class, 'markAsRead'])->name('notes.mark-read');
        Route::delete('/{note}', [NoteController::class, 'destroy'])->name('notes.destroy');
        Route::get('/unread/count', [NoteController::class, 'unreadCount'])->name('notes.unread-count');
    });

    // Spinner Game Routes
    Route::prefix('spinner')->group(function () {
        Route::get('/', [SpinnerGameController::class, 'index'])->name('spinner.index');
        Route::post('/spin', [SpinnerGameController::class, 'spin'])->name('spinner.spin');
        Route::get('/history', [SpinnerGameController::class, 'history'])->name('spinner.history');
        Route::get('/stats', [SpinnerGameController::class, 'stats'])->name('spinner.stats');
        Route::get('/{spinnerGame}', [SpinnerGameController::class, 'show'])->name('spinner.show');
    });
}); 