<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\WatchListController;
use App\Http\Controllers\PartnershipController;
use App\Http\Controllers\NoteController;
use App\Http\Controllers\SpinnerGameController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('dashboard');
    }
    
    return Inertia::render('Landing', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Watch List Routes
    Route::prefix('api/watch-list')->group(function () {
        Route::get('/', [WatchListController::class, 'index'])->name('watch-list.index');
        Route::post('/', [WatchListController::class, 'store'])->name('watch-list.store');
        Route::get('/{watchList}', [WatchListController::class, 'show'])->name('watch-list.show');
        Route::put('/{watchList}', [WatchListController::class, 'update'])->name('watch-list.update');
        Route::delete('/{watchList}', [WatchListController::class, 'destroy'])->name('watch-list.destroy');
        Route::get('/partner/list', [WatchListController::class, 'partnerWatchList'])->name('watch-list.partner');
    });

    // Partnership Routes
    Route::prefix('api/partnerships')->group(function () {
        Route::get('/', [PartnershipController::class, 'index'])->name('partnerships.index');
        Route::post('/', [PartnershipController::class, 'store'])->name('partnerships.store');
        Route::patch('/{partnership}/accept', [PartnershipController::class, 'accept'])->name('partnerships.accept');
        Route::patch('/{partnership}/reject', [PartnershipController::class, 'reject'])->name('partnerships.reject');
        Route::delete('/{partnership}', [PartnershipController::class, 'destroy'])->name('partnerships.destroy');
    });

    // Notes Routes
    Route::prefix('api/notes')->group(function () {
        Route::get('/', [NoteController::class, 'index'])->name('notes.index');
        Route::post('/', [NoteController::class, 'store'])->name('notes.store');
        Route::get('/{note}', [NoteController::class, 'show'])->name('notes.show');
        Route::patch('/{note}/read', [NoteController::class, 'markAsRead'])->name('notes.mark-read');
        Route::delete('/{note}', [NoteController::class, 'destroy'])->name('notes.destroy');
        Route::get('/unread/count', [NoteController::class, 'unreadCount'])->name('notes.unread-count');
    });

    // Spinner Game Routes - Reordered to avoid conflicts
    Route::prefix('api/spinner')->group(function () {
        Route::get('/', [SpinnerGameController::class, 'index'])->name('spinner.index');
        Route::post('/spin', [SpinnerGameController::class, 'spin'])->name('spinner.spin');
        Route::get('/history', [SpinnerGameController::class, 'history'])->name('spinner.history');
        Route::get('/stats', [SpinnerGameController::class, 'stats'])->name('spinner.stats');
        Route::get('/{spinnerGame}', [SpinnerGameController::class, 'show'])->name('spinner.show');
    });
});

require __DIR__.'/auth.php';
