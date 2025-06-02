<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Translation extends Model
{
    protected $fillable = [
        'user_id',
        'page_id',
        'translated_text',
        'score',
        'AI_feedback',
        'AI_text',
    ];

    use HasFactory;

    public function page()
    {
        return $this->belongsTo(Page::class);
    }
}
