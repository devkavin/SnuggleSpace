<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // Watch List relationships
    public function watchList(): HasMany
    {
        return $this->hasMany(WatchList::class);
    }

    // Partnership relationships
    public function partnerships(): HasMany
    {
        return $this->hasMany(Partnership::class);
    }

    public function partnerRequests(): HasMany
    {
        return $this->hasMany(Partnership::class, 'partner_id');
    }

    public function acceptedPartnership(): HasOne
    {
        return $this->hasOne(Partnership::class)->where('status', 'accepted');
    }

    public function partner(): HasOneThrough
    {
        return $this->hasOneThrough(
            User::class,
            Partnership::class,
            'user_id',
            'id',
            'id',
            'partner_id'
        )->where('partnerships.status', 'accepted');
    }

    // Note relationships
    public function sentNotes(): HasMany
    {
        return $this->hasMany(Note::class, 'sender_id');
    }

    public function receivedNotes(): HasMany
    {
        return $this->hasMany(Note::class, 'recipient_id');
    }

    // Spinner Game relationships
    public function spinnerGames(): HasMany
    {
        return $this->hasMany(SpinnerGame::class);
    }

    public function partnerSpinnerGames(): HasMany
    {
        return $this->hasMany(SpinnerGame::class, 'partner_id');
    }
}
