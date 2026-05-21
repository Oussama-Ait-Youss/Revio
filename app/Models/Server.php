<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Server extends Model
{
    use HasFactory;



    protected $fillable = [
        'user_id',
        'phone',
        'total_reviews'
    ];


    public function user(){
        return $this->beglongsTo(User::class);
    }
    public function reviews()
{
    return $this->hasMany(Review::class);
}
}
