<?php

namespace App\Models;

use App\Models\Concerns\BelongsToRestaurantTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class NfcCard extends Model
{
    use BelongsToRestaurantTenant;
    protected $table = 'nfc_cards';

    protected $fillable = [
        'uid',
        'restaurant_id',
        'public_token',
        'qr_code_url',
        'is_active',
        'server_id',
        'assigned_at',
    ];

    public function server(): BelongsTo
    {
        return $this->belongsTo(Server::class);
    }

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function scopeUnallocated($query)
    {
        return $query->whereNull('restaurant_id');
    }
}
