<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\SendReviewRemindersJob;
use App\Jobs\WeeklyProgressJob;
use App\Jobs\SystemUpdatesJob;
use Illuminate\Http\Request;
use Log;


class SubscriptionController extends Controller
{
    public function show(Request $request)
    {
        $user = $request->user();
        return response()->json([
            'review_reminders' => $user->review_reminders,
            'translation_feedback' => $user->translation_feedback,
            'weekly_progress' => $user->weekly_progress,
            'system_updates' => $user->system_updates,
        ]);
    }

    public function update(Request $request)
    {
        Log::info('a');
        $user = Auth()->user();

        // $data = $request->validate([
        //     'review_reminders' => 'boolean',
        //     'translation_feedback' => 'boolean',
        //     'weekly_progress' => 'boolean',
        //     'system_updates' => 'boolean',
        // ]);

        Log::info($request);

        $subscription = $user->pushSubscriptions()->latest()->first();
        $subscription->update($request->only([
            'review_reminders',
            'translation_feedback',
            'weekly_progress',
            'system_updates',
        ]));
        //Log::info('User notification settings updated', ['user_id' => $user->id, 'settings' => $data]);

        return response()->json([
            'message' => '通知設定を更新しました',
            'settings' => $subscription->only(['review_reminders', 'translation_feedback', 'weekly_progress', 'system_updates']),
        ]);
    }

    public function pushSubscribe(Request $request)
    {
        // $request->validate([
        //     'endpoint' => 'required|string',
        //     'publicKey' => 'required|string',
        //     'authToken' => 'required|string',
        // ]);

        $user = $request->user();
        $user->pushSubscriptions()->updateOrCreate(
            ['endpoint' => $request->endpoint],
            ['public_key' => $request->keys['p256dh'], 'auth_token' => $request->keys['auth']]
        );

        return response()->json(['message' => 'Subscribed']);
    }



    // 本番時削除
    public function test()
    {
        SendReviewRemindersJob::dispatch();
        WeeklyProgressJob::dispatch();
        SystemUpdatesJob::dispatch();
    }
}
