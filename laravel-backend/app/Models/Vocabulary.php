<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vocabulary extends Model
{
    use HasFactory;

    protected $fillable = [
    'user_id',
    'word',
    'translation',
    'book_id',
    'page_id',
    'language',
    ];

    public function schedule() {
        return $this->hasOne(VocabularySchedule::class);
    }
}
