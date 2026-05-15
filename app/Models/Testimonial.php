<?php

namespace App\Models;


use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Testimonial extends Model
{
    public function review(): BelongsTo
{
    return $this->belongsTo(Review::class);
}

public function approvedBy(): BelongsTo
{
    return $this->belongsTo(User::class, 'approved_by');
}
}
