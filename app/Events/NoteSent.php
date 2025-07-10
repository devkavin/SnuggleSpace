<?php

namespace App\Events;

use App\Models\Note;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NoteSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $note;
    public $sender;
    public $recipient;

    public function __construct(Note $note, User $sender, User $recipient)
    {
        $this->note = $note;
        $this->sender = $sender;
        $this->recipient = $recipient;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->recipient->id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'note.sent';
    }

    public function broadcastWith(): array
    {
        return [
            'note' => [
                'id' => $this->note->id,
                'message' => $this->note->message,
                'color' => $this->note->color,
                'is_read' => $this->note->is_read,
                'created_at' => $this->note->created_at,
            ],
            'sender' => [
                'id' => $this->sender->id,
                'name' => $this->sender->name,
            ],
        ];
    }
} 