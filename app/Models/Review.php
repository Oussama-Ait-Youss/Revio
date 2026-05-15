<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Review extends Model
{
    protected $fillable = [
        'service_rating', 'food_rating', 'cleanliness_rating', 
        'overall_rating', 'comment', 'is_anonymous', 'status', 'server_id'
    ];

    // Status Constants
    const STATUS_PENDING = 'PENDING';
    const STATUS_APPROVED = 'APPROVED';
    const STATUS_REJECTED = 'REJECTED';
    const STATUS_CRITICAL = 'CRITICAL';

    public function server(): BelongsTo
    {
        return $this->belongsTo(Server::class);
    }

    public function testimonial(): HasOne
    {
        return $this->hasOne(Testimonial::class);
    }

    // Scope for Dashboard Alerts
    public function scopeCritical($query)
    {
        return $query->where('status', self::STATUS_CRITICAL);
    }
}
