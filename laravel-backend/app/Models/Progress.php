<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Progress extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'book_id',
        'page_number',
        'is_favorite',
    ];

    public function book()
    {
        return $this->belongsTo(Book::class);
    }
}
