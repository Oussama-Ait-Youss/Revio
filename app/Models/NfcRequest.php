<?php

namespace App\Models;

use App\Models\Concerns\BelongsToRestaurantTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NfcRequest extends Model
{
    use BelongsToRestaurantTenant;
    protected $table = 'nfc_requests';

    protected $fillable = [
        'restaurant_id',
        'quantity',
        'status',
        'notes',
    ];

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }
}
