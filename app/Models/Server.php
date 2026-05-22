<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Server extends Model
{
    protected $fillable = ['user_id', 'phone', 'total_reviews'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function nfcCards()
    {
        return $this->hasMany(NfcCard::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }
}