<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    protected $fillable = [
        'rating',
        'comment',
        'server_id',
        'status',
    ];

    /**
     * Review belongs to a server
     */
    public function server()
    {
        return $this->belongsTo(Server::class);
    }
}