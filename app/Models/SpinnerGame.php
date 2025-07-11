<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SpinnerGame extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'partner_id',
        'type',
        'selected_title',
        'options',
        'played_at',
    ];

    protected $casts = [
        'options' => 'array',
        'played_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function partner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'partner_id');
    }
} 