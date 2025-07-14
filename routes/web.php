<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\WatchListController;
use App\Http\Controllers\PartnershipController;
use App\Http\Controllers\NoteController;
use App\Http\Controllers\SpinnerGameController;
use App\Http\Controllers\RealtimeController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('dashboard');
    }
    
    return Inertia::render('Landing', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);
});

// Debug route to test database connection
Route::get('/debug', function () {
    try {
        \Illuminate\Support\Facades\DB::connection()->getPdo();
        return response()->json([
            'status' => 'success',
            'message' => 'Database connection successful',
            'session_driver' => config('session.driver'),
            'cache_driver' => config('cache.default'),
            'app_env' => config('app.env'),
            'app_debug' => config('app.debug'),
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Database connection failed',
            'error' => $e->getMessage(),
            'session_driver' => config('session.driver'),
            'cache_driver' => config('cache.default'),
            'app_env' => config('app.env'),
            'app_debug' => config('app.debug'),
        ], 500);
    }
});

// Debug route to check available routes
Route::get('/routes', function () {
    $routes = [];
    foreach (\Illuminate\Support\Facades\Route::getRoutes() as $route) {
        if (str_contains($route->getName(), 'partnerships') || str_contains($route->uri(), 'v1/')) {
            $routes[] = [
                'name' => $route->getName(),
                'uri' => $route->uri(),
                'methods' => $route->methods(),
                'middleware' => $route->middleware(),
            ];
        }
    }
    return response()->json($routes);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // API Routes (temporarily moved back to web.php for testing)
    Route::prefix('v1')->group(function () {
        // Combined dashboard data endpoint for better performance
        Route::get('/dashboard-data', function () {
            try {
                $user = Auth::user();
                
                // Load all data in parallel using collections
                $watchList = $user->watchList()->orderBy('created_at', 'desc')->get();
                $partnerships = $user->partnerships()->with('partner')->get();
                $partnerRequests = $user->partnerRequests()->with('user')->get();
                $acceptedPartnership = $user->acceptedPartnership()->with('partner')->first();
                $sentNotes = $user->sentNotes()->with('recipient')->orderBy('created_at', 'desc')->get();
                $receivedNotes = $user->receivedNotes()->with('sender')->orderBy('created_at', 'desc')->get();
                $spinnerGames = $user->spinnerGames()->with('partner')->orderBy('played_at', 'desc')->get();
                
                // Load partner's watch list if partnership exists
                $partnerWatchList = collect([]);
                if ($acceptedPartnership) {
                    $partnerWatchList = $acceptedPartnership->partner->watchList()->orderBy('created_at', 'desc')->get();
                }
                
                return response()->json([
                    'watch_list' => $watchList,
                    'partnerships' => [
                        'pending_requests' => $partnerRequests,
                        'accepted_partnership' => $acceptedPartnership,
                    ],
                    'notes' => [
                        'sent_notes' => $sentNotes,
                        'received_notes' => $receivedNotes,
                    ],
                    'spinner_games' => $spinnerGames,
                    'partner_watch_list' => $partnerWatchList,
                ]);
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Error in dashboard data: ' . $e->getMessage());
                return response()->json(['error' => 'Failed to load dashboard data'], 500);
            }
        })->name('dashboard.data');

        // Watch List Routes
        Route::prefix('watch-list')->group(function () {
            Route::get('/', [WatchListController::class, 'index'])->name('v1.watch-list.index');
            Route::post('/', [WatchListController::class, 'store'])->name('v1.watch-list.store');
            Route::get('/{watchList}', [WatchListController::class, 'show'])->name('v1.watch-list.show');
            Route::put('/{watchList}', [WatchListController::class, 'update'])->name('v1.watch-list.update');
            Route::delete('/{watchList}', [WatchListController::class, 'destroy'])->name('v1.watch-list.destroy');
            Route::get('/partner/list', [WatchListController::class, 'partnerWatchList'])->name('v1.watch-list.partner');
        });

        // Partnership Routes
        Route::prefix('partnerships')->group(function () {
            Route::get('/', [PartnershipController::class, 'index'])->name('v1.partnerships.index');
            Route::post('/', [PartnershipController::class, 'store'])->name('v1.partnerships.store');
            Route::patch('/{partnership}/accept', [PartnershipController::class, 'accept'])->name('v1.partnerships.accept');
            Route::patch('/{partnership}/reject', [PartnershipController::class, 'reject'])->name('v1.partnerships.reject');
            Route::delete('/{partnership}', [PartnershipController::class, 'destroy'])->name('v1.partnerships.destroy');
            
            // Test route to verify partnerships are working
            Route::get('/test', function () {
                return response()->json(['message' => 'Partnership routes are working!']);
            })->name('v1.partnerships.test');
        });

        // Notes Routes
        Route::prefix('notes')->group(function () {
            Route::get('/', [NoteController::class, 'index'])->name('v1.notes.index');
            Route::post('/', [NoteController::class, 'store'])->name('v1.notes.store');
            Route::get('/{note}', [NoteController::class, 'show'])->name('v1.notes.show');
            Route::patch('/{note}/read', [NoteController::class, 'markAsRead'])->name('v1.notes.mark-read');
            Route::delete('/{note}', [NoteController::class, 'destroy'])->name('v1.notes.destroy');
            Route::get('/unread/count', [NoteController::class, 'unreadCount'])->name('v1.notes.unread-count');
        });

        // Spinner Game Routes
        Route::prefix('spinner')->group(function () {
            Route::get('/', [SpinnerGameController::class, 'index'])->name('v1.spinner.index');
            Route::post('/spin', [SpinnerGameController::class, 'spin'])->name('v1.spinner.spin');
            Route::get('/history', [SpinnerGameController::class, 'history'])->name('v1.spinner.history');
            Route::get('/stats', [SpinnerGameController::class, 'stats'])->name('v1.spinner.stats');
            Route::get('/{spinnerGame}', [SpinnerGameController::class, 'show'])->name('v1.spinner.show');
        });

        // Real-time Updates Route
        Route::get('/realtime/stream', [RealtimeController::class, 'stream'])->name('v1.realtime.stream');
    });
});

// Test API route in web.php to see if it works
Route::get('/test-partnership', function () {
    return response()->json(['message' => 'Test partnership route works!']);
});

require __DIR__.'/auth.php';
