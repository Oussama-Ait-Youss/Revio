<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Concerns\BelongsToRestaurantTenant;

class Server extends Model
{
    use BelongsToRestaurantTenant, SoftDeletes;

    protected $fillable = ['user_id', 'restaurant_id', 'phone', 'total_reviews','google_review_url'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function nfcCard(): HasOne
    {
        return $this->hasOne(NfcCard::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function getTotalReviewsAttribute()
    {
        return isset($this->attributes['reviews_count']) 
            ? (int) $this->attributes['reviews_count'] 
            : $this->reviews()->count();
    }
}
