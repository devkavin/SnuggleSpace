<?php

namespace App\Events;

use App\Models\WatchList;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class WatchListItemAdded implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $watchListItem;
    public $user;
    public $partner;

    public function __construct(WatchList $watchListItem, User $user, ?User $partner = null)
    {
        $this->watchListItem = $watchListItem;
        $this->user = $user;
        $this->partner = $partner;
    }

    public function broadcastOn(): array
    {
        $channels = [
            new PrivateChannel('user.' . $this->user->id),
        ];

        if ($this->partner) {
            $channels[] = new PrivateChannel('user.' . $this->partner->id);
        }

        return $channels;
    }

    public function broadcastAs(): string
    {
        return 'watchlist.item.added';
    }

    public function broadcastWith(): array
    {
        return [
            'watch_list_item' => [
                'id' => $this->watchListItem->id,
                'title' => $this->watchListItem->title,
                'type' => $this->watchListItem->type,
                'status' => $this->watchListItem->status,
                'rating' => $this->watchListItem->rating,
                'created_at' => $this->watchListItem->created_at,
            ],
            'user' => [
                'id' => $this->user->id,
                'name' => $this->user->name,
            ],
        ];
    }
} 