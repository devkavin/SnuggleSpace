<?php

namespace App\Http\Controllers;

use App\Models\Partnership;
use App\Models\User;
use App\Events\PartnershipRequestSent;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class PartnershipController extends Controller
{
    public function index(): JsonResponse
    {
        $user = Auth::user();
        
        $pendingRequests = $user->partnerRequests()->where('status', 'pending')->with('user')->get();
        $acceptedPartnership = $user->acceptedPartnership()->with('partner')->first();
        
        return response()->json([
            'pending_requests' => $pendingRequests,
            'accepted_partnership' => $acceptedPartnership,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'partner_email' => 'required|email|exists:users,email',
        ]);

        $user = Auth::user();
        $partner = User::where('email', $request->partner_email)->first();

        if ($user->id === $partner->id) {
            return response()->json(['message' => 'You cannot partner with yourself'], 400);
        }

        // Check if partnership already exists
        $existingPartnership = Partnership::where(function ($query) use ($user, $partner) {
            $query->where('user_id', $user->id)
                  ->where('partner_id', $partner->id);
        })->orWhere(function ($query) use ($user, $partner) {
            $query->where('user_id', $partner->id)
                  ->where('partner_id', $user->id);
        })->first();

        if ($existingPartnership) {
            return response()->json(['message' => 'Partnership request already exists'], 400);
        }

        $partnership = Partnership::create([
            'user_id' => $user->id,
            'partner_id' => $partner->id,
            'status' => 'pending',
        ]);

        // Broadcast the event for real-time updates
        event(new PartnershipRequestSent($partnership, $user, $partner));

        return response()->json($partnership, 201);
    }

    public function accept(Partnership $partnership): JsonResponse
    {
        if ($partnership->partner_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $partnership->update([
            'status' => 'accepted',
            'accepted_at' => now(),
        ]);

        // Create the reverse partnership record so both users can see each other
        Partnership::create([
            'user_id' => $partnership->partner_id, // The person who accepted
            'partner_id' => $partnership->user_id, // The person who sent the request
            'status' => 'accepted',
            'accepted_at' => now(),
        ]);

        return response()->json($partnership);
    }

    public function reject(Partnership $partnership): JsonResponse
    {
        if ($partnership->partner_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $partnership->update(['status' => 'rejected']);

        return response()->json(['message' => 'Partnership request rejected']);
    }

    public function destroy(Partnership $partnership): JsonResponse
    {
        if ($partnership->user_id !== Auth::id() && $partnership->partner_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $partnership->delete();

        return response()->json(['message' => 'Partnership ended']);
    }
} 