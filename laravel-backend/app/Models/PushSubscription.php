<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PushSubscription extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'endpoint', 'public_key', 'auth_token', 'review_reminders', 'translation_feedback', 'weekly_progress', 'system_updates'];
}
