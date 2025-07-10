<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\StreamedResponse;

class RealtimeController extends Controller
{
    public function stream(): StreamedResponse
    {
        $user = Auth::user();
        
        return response()->stream(function () use ($user) {
            // Set headers for SSE
            header('Content-Type: text/event-stream');
            header('Cache-Control: no-cache');
            header('Connection: keep-alive');
            header('X-Accel-Buffering: no'); // Disable nginx buffering
            
            // Send initial connection message
            echo "data: " . json_encode(['type' => 'connected', 'user_id' => $user->id]) . "\n\n";
            ob_flush();
            flush();
            
            $lastCheck = time();
            
            while (true) {
                // Check for new events every 2 seconds
                if (time() - $lastCheck >= 2) {
                    $this->checkForEvents($user);
                    $lastCheck = time();
                }
                
                // Check if client is still connected
                if (connection_aborted()) {
                    break;
                }
                
                usleep(500000); // Sleep for 0.5 seconds
            }
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'Connection' => 'keep-alive',
            'X-Accel-Buffering' => 'no',
        ]);
    }
    
    private function checkForEvents($user): void
    {
        // Check for new notes
        $unreadNotes = $user->receivedNotes()
            ->where('is_read', false)
            ->where('created_at', '>', now()->subMinutes(5))
            ->with('sender')
            ->get();
            
        if ($unreadNotes->isNotEmpty()) {
            foreach ($unreadNotes as $note) {
                echo "data: " . json_encode([
                    'type' => 'note.sent',
                    'note' => [
                        'id' => $note->id,
                        'message' => $note->message,
                        'color' => $note->color,
                        'created_at' => $note->created_at,
                    ],
                    'sender' => [
                        'id' => $note->sender->id,
                        'name' => $note->sender->name,
                    ],
                ]) . "\n\n";
                ob_flush();
                flush();
            }
        }
        
        // Check for new partnership requests
        $pendingRequests = $user->partnerRequests()
            ->where('status', 'pending')
            ->where('created_at', '>', now()->subMinutes(5))
            ->with('user')
            ->get();
            
        if ($pendingRequests->isNotEmpty()) {
            foreach ($pendingRequests as $request) {
                echo "data: " . json_encode([
                    'type' => 'partnership.request.sent',
                    'partnership' => [
                        'id' => $request->id,
                        'status' => $request->status,
                        'created_at' => $request->created_at,
                    ],
                    'sender' => [
                        'id' => $request->user->id,
                        'name' => $request->user->name,
                        'email' => $request->user->email,
                    ],
                ]) . "\n\n";
                ob_flush();
                flush();
            }
        }
        
        // Check for new watch list items from partner
        $partner = $user->partner;
        if ($partner) {
            $newItems = $partner->watchList()
                ->where('created_at', '>', now()->subMinutes(5))
                ->get();
                
            if ($newItems->isNotEmpty()) {
                foreach ($newItems as $item) {
                    echo "data: " . json_encode([
                        'type' => 'watchlist.item.added',
                        'watch_list_item' => [
                            'id' => $item->id,
                            'title' => $item->title,
                            'type' => $item->type,
                            'status' => $item->status,
                            'rating' => $item->rating,
                            'created_at' => $item->created_at,
                        ],
                        'user' => [
                            'id' => $partner->id,
                            'name' => $partner->name,
                        ],
                    ]) . "\n\n";
                    ob_flush();
                    flush();
                }
            }
        }
    }
} 