<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    protected $fillable = [
        'rating',
        'comment',
        'server_id',
        'restaurant_id',
    ];

    /**
     * Review belongs to a server
     */
    public function server()
    {
        return $this->belongsTo(Server::class);
    }
}