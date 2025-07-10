<?php

namespace App\Http\Controllers;

use App\Models\WatchList;
use App\Events\WatchListItemAdded;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class WatchListController extends Controller
{
    public function index(): JsonResponse
    {
        $user = Auth::user();
        $watchList = $user->watchList()->orderBy('created_at', 'desc')->get();
        
        return response()->json($watchList);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:movie,tv_series,anime',
            'status' => 'required|in:plan_to_watch,watching,completed,dropped',
            'rating' => 'nullable|integer|min:1|max:10',
            'genre' => 'nullable|string|max:255',
            'platform' => 'nullable|string|max:255',
            'image_url' => 'nullable|url',
        ]);

        $user = Auth::user();
        $watchList = $user->watchList()->create($request->all());

        // Get partner for real-time updates
        $partner = $user->partner;

        // Broadcast the event for real-time updates
        event(new WatchListItemAdded($watchList, $user, $partner));

        return response()->json($watchList, 201);
    }

    public function show(WatchList $watchList): JsonResponse
    {
        $this->authorize('view', $watchList);
        
        return response()->json($watchList);
    }

    public function update(Request $request, WatchList $watchList): JsonResponse
    {
        $this->authorize('update', $watchList);

        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'sometimes|required|in:movie,tv_series,anime',
            'status' => 'sometimes|required|in:plan_to_watch,watching,completed,dropped',
            'rating' => 'nullable|integer|min:1|max:10',
            'genre' => 'nullable|string|max:255',
            'platform' => 'nullable|string|max:255',
            'image_url' => 'nullable|url',
        ]);

        $watchList->update($request->all());

        return response()->json($watchList);
    }

    public function destroy(WatchList $watchList): JsonResponse
    {
        $this->authorize('delete', $watchList);

        $watchList->delete();

        return response()->json(null, 204);
    }

    public function partnerWatchList(): JsonResponse
    {
        $user = Auth::user();
        $partner = $user->partner;

        if (!$partner) {
            return response()->json(['message' => 'No partner found'], 404);
        }

        $watchList = $partner->watchList()->orderBy('created_at', 'desc')->get();

        return response()->json($watchList);
    }
} 