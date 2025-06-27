<?php

namespace App\Http\Controllers;

use App\Models\SpinnerGame;
use App\Models\WatchList;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class SpinnerGameController extends Controller
{
    public function index(): JsonResponse
    {
        try {
            $user = Auth::user();
            $games = $user->spinnerGames()->with('partner')->orderBy('played_at', 'desc')->get();
            
            return response()->json($games);
        } catch (\Exception $e) {
            Log::error('Error in spinner index: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to load spinner games'], 500);
        }
    }

    public function spin(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'type' => 'required|in:movie,tv_series,anime',
            ]);

            $user = Auth::user();
            
            // Get the user's accepted partnership
            $partnership = $user->acceptedPartnership()->with('partner')->first();
            
            if (!$partnership || !$partnership->partner) {
                return response()->json([
                    'error' => 'No partner found. Please add a partner first.',
                    'code' => 'NO_PARTNER'
                ], 404);
            }

            $partner = $partnership->partner;

            // Get all items of the specified type from both users' watch lists
            $userItems = $user->watchList()
                ->where('type', $request->type)
                ->whereIn('status', ['plan_to_watch', 'watching'])
                ->pluck('title')
                ->filter()
                ->values()
                ->toArray();

            $partnerItems = $partner->watchList()
                ->where('type', $request->type)
                ->whereIn('status', ['plan_to_watch', 'watching'])
                ->pluck('title')
                ->filter()
                ->values()
                ->toArray();

            // Combine and deduplicate items
            $allItems = array_unique(array_merge($userItems, $partnerItems));
            $allItems = array_values(array_filter($allItems)); // Remove empty values

            if (empty($allItems)) {
                return response()->json([
                    'error' => "No {$request->type} items found in your combined watch lists.",
                    'code' => 'NO_ITEMS',
                    'user_items_count' => count($userItems),
                    'partner_items_count' => count($partnerItems)
                ], 404);
            }

            // Use cryptographically secure random selection
            $randomIndex = random_int(0, count($allItems) - 1);
            $selectedTitle = $allItems[$randomIndex];

            // Create spinner game record
            $spinnerGame = SpinnerGame::create([
                'user_id' => $user->id,
                'partner_id' => $partner->id,
                'type' => $request->type,
                'selected_title' => $selectedTitle,
                'options' => $allItems,
                'played_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'selected_title' => $selectedTitle,
                'all_options' => $allItems,
                'game_id' => $spinnerGame->id,
                'total_options' => count($allItems),
                'random_index' => $randomIndex,
                'user_items_count' => count($userItems),
                'partner_items_count' => count($partnerItems),
                'played_at' => $spinnerGame->played_at->toISOString()
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'error' => 'Invalid request data',
                'details' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error in spinner spin: ' . $e->getMessage(), [
                'user_id' => Auth::id(),
                'type' => $request->type ?? 'unknown',
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'error' => 'An unexpected error occurred while spinning.',
                'code' => 'SPIN_ERROR'
            ], 500);
        }
    }

    public function show(SpinnerGame $spinnerGame): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if ($spinnerGame->user_id !== $user->id && $spinnerGame->partner_id !== $user->id) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            return response()->json($spinnerGame);
        } catch (\Exception $e) {
            Log::error('Error in spinner show: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to load spinner game'], 500);
        }
    }

    public function history(): JsonResponse
    {
        try {
            $user = Auth::user();
            $partnership = $user->acceptedPartnership()->first();

            if (!$partnership) {
                return response()->json(['error' => 'No partner found'], 404);
            }

            $partner = $partnership->partner;

            $games = SpinnerGame::where(function ($query) use ($user, $partner) {
                $query->where('user_id', $user->id)
                      ->where('partner_id', $partner->id);
            })->orWhere(function ($query) use ($user, $partner) {
                $query->where('user_id', $partner->id)
                      ->where('partner_id', $user->id);
            })->with(['user', 'partner'])
              ->orderBy('played_at', 'desc')
              ->get();

            return response()->json($games);
        } catch (\Exception $e) {
            Log::error('Error in spinner history: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to load spinner history'], 500);
        }
    }

    public function stats(): JsonResponse
    {
        try {
            $user = Auth::user();
            $partnership = $user->acceptedPartnership()->first();

            if (!$partnership) {
                return response()->json(['error' => 'No partner found'], 404);
            }

            $partner = $partnership->partner;

            $query = SpinnerGame::where(function ($query) use ($user, $partner) {
                $query->where('user_id', $user->id)
                      ->where('partner_id', $partner->id);
            })->orWhere(function ($query) use ($user, $partner) {
                $query->where('user_id', $partner->id)
                      ->where('partner_id', $user->id);
            });

            $totalGames = $query->count();
            $moviesPlayed = (clone $query)->where('type', 'movie')->count();
            $tvSeriesPlayed = (clone $query)->where('type', 'tv_series')->count();
            $animePlayed = (clone $query)->where('type', 'anime')->count();

            return response()->json([
                'total_games' => $totalGames,
                'movies_played' => $moviesPlayed,
                'tv_series_played' => $tvSeriesPlayed,
                'anime_played' => $animePlayed,
            ]);
        } catch (\Exception $e) {
            Log::error('Error in spinner stats: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to load spinner stats'], 500);
        }
    }
} 