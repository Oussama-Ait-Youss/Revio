<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Role extends Model
{
    protected $fillable = ['name'];

    public const ADMIN = 'ADMIN';
    public const MANAGER = 'MANAGER';
    public const SERVER = 'SERVER';

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}
