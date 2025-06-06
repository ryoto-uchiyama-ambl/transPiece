<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VocabularySchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'vocabulary_id',
        'user_id',
        'stability',
        'difficulty',
        'reps',
        'elapsed_days',
        'last_review',
        'due'
    ];

    public function vocabulary()
    {
        return $this->belongsTo(Vocabulary::class);
    }
}
