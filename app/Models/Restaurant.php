<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Restaurant extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'logo',
        'address',
        'phone',
        'status', // 'ACTIVE' or 'INACTIVE'
    ];

    /**
     * Get all users (Managers and Servers) belonging to this restaurant.
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /**
     * Get the specific Manager account for this restaurant.
     */
    public function manager(): HasOne
    {
        return $this->hasOne(User::class)->whereHas('role', function ($query) {
            $query->where('name', 'MANAGER');
        });
    }

    /**
     * Get all the server profiles assigned to this restaurant.
     */
    public function servers(): HasMany
    {
        return $this->hasMany(Server::class);
    }

    /**
     * 
     * Get all NFC cards inventory linked to this restaurant.
     */
    public function nfcCards(): HasMany
    {
        return $this->hasMany(NfcCard::class);
    }

    /**
     * Get all customer reviews targeting this restaurant's staff.
     */
    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }
}