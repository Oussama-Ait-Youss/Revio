<?php



namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens;

    protected $fillable = ['full_name', 'email', 'password', 'role', 'is_active'];

    // Role Constants
    const ROLE_ADMIN = 'ADMIN';
    const ROLE_SERVER = 'SERVER';

    public function server(): HasOne
    {
        return $this->hasOne(Server::class);
    }

    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN;
    }
}