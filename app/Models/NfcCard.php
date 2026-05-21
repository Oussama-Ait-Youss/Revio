<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NfcCard extends Model
{
    protected $fillable = [
        'uid',
        'public_token',
        'qr_code_url',
        'is_active',
        'assigned_at',
        'server_id',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'assigned_at' => 'datetime',
    ];

    /**
     * NFC card belongs to a server (optional)
     */
    public function server()
    {
        return $this->belongsTo(Server::class);
    }
    public function reviews()
    {
        return $this->hasMany(Review::class);
    }
}