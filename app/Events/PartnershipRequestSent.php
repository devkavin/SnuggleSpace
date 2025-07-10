<?php

namespace App\Events;

use App\Models\Partnership;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PartnershipRequestSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $partnership;
    public $sender;
    public $recipient;

    public function __construct(Partnership $partnership, User $sender, User $recipient)
    {
        $this->partnership = $partnership;
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
        return 'partnership.request.sent';
    }

    public function broadcastWith(): array
    {
        return [
            'partnership' => [
                'id' => $this->partnership->id,
                'status' => $this->partnership->status,
                'created_at' => $this->partnership->created_at,
            ],
            'sender' => [
                'id' => $this->sender->id,
                'name' => $this->sender->name,
                'email' => $this->sender->email,
            ],
        ];
    }
} 