<?php

namespace App\Http\Controllers;

use App\Models\Note;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class NoteController extends Controller
{
    public function index(): JsonResponse
    {
        try {
            $user = Auth::user();
            
            $sentNotes = $user->sentNotes()->with('recipient')->orderBy('created_at', 'desc')->get();
            $receivedNotes = $user->receivedNotes()->with('sender')->orderBy('created_at', 'desc')->get();
            
            return response()->json([
                'sent_notes' => $sentNotes,
                'received_notes' => $receivedNotes,
            ]);
        } catch (\Exception $e) {
            Log::error('Error in notes index: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to load notes'], 500);
        }
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'message' => 'required|string|max:1000',
                'color' => 'nullable|string|max:7',
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

            $note = Note::create([
                'sender_id' => $user->id,
                'recipient_id' => $partner->id,
                'message' => trim($request->message),
                'color' => $request->color ?? '#ff6b9d',
            ]);

            // Load the recipient relationship for the response
            $note->load('recipient');

            return response()->json([
                'success' => true,
                'note' => $note
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'error' => 'Invalid note data',
                'details' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error creating note: ' . $e->getMessage(), [
                'user_id' => Auth::id(),
                'message_length' => strlen($request->message ?? ''),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'error' => 'Failed to send note. Please try again.',
                'code' => 'SEND_ERROR'
            ], 500);
        }
    }

    public function show(Note $note): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if ($note->sender_id !== $user->id && $note->recipient_id !== $user->id) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $note->load(['sender', 'recipient']);

            return response()->json($note);
        } catch (\Exception $e) {
            Log::error('Error showing note: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to load note'], 500);
        }
    }

    public function markAsRead(Note $note): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if ($note->recipient_id !== $user->id) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $note->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'note' => $note
            ]);
        } catch (\Exception $e) {
            Log::error('Error marking note as read: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to mark note as read'], 500);
        }
    }

    public function destroy(Note $note): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if ($note->sender_id !== $user->id) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $note->delete();

            return response()->json([
                'success' => true,
                'message' => 'Note deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting note: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to delete note'], 500);
        }
    }

    public function unreadCount(): JsonResponse
    {
        try {
            $user = Auth::user();
            $unreadCount = $user->receivedNotes()->where('is_read', false)->count();
            
            return response()->json([
                'unread_count' => $unreadCount
            ]);
        } catch (\Exception $e) {
            Log::error('Error getting unread count: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to get unread count'], 500);
        }
    }
} 