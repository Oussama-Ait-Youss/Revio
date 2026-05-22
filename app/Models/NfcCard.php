<?php

namespace App\Models;


use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class NFCCard extends Model
{
    protected $fillable = ['uid', 'public_token', 'qr_code_url', 'is_active', 'server_id', 'assigned_at'];

public function server(): BelongsTo
{
    return $this->belongsTo(Server::class);
}
}
