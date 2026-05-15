<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Server extends Model
{
    use SoftDeletes;

    protected $fillable = ['user_id', 'phone', 'total_reviews'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function nfcCard(): HasOne
    {
        return $this->hasOne(NFCCard::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }
}
