<?php

namespace App\Models;

use App\Models\Concerns\BelongsToRestaurantTenant;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use BelongsToRestaurantTenant;
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
