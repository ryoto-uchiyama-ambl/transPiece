<?php

namespace App\Jobs;

use App\Models\User;
use App\Models\Translation;
use App\Models\VocabularySchedule;
use Illuminate\Bus\Queueable;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Foundation\Bus\Dispatchable;
use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;

class WeeklyProgressJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle()
    {
        $auth = [
            'VAPID' => [
                'subject' => config('webpush.vapid.subject'),
                'publicKey' => config('webpush.vapid.public_key'),
                'privateKey' => config('webpush.vapid.private_key'),
            ],
        ];

        $webPush = new WebPush($auth);
        $startOfWeek = Carbon::now()->subDays(7);

        // 通知ONのユーザーを取得
        $users = User::with(['pushSubscriptions' => function ($query) {
            $query->where('weekly_progress', true);
        }])->whereHas('pushSubscriptions', function ($query) {
            $query->where('weekly_progress', true);
        })->get();

        foreach ($users as $user) {
            // 翻訳数（直近7日間）
            $translationCount = Translation::where('user_id', $user->id)
            ->where('created_at', '>=', $startOfWeek)->count();

            // 単語完了数（直近7日間）
            $reviewCount = VocabularySchedule::where('user_id', $user->id)
            ->where('last_review', '>=', $startOfWeek)->count();

            foreach ($user->pushSubscriptions as $sub) {
                $subscription = Subscription::create([
                    'endpoint' => $sub->endpoint,
                    'publicKey' => $sub->public_key,
                    'authToken' => $sub->auth_token,
                    'contentEncoding' => 'aes128gcm'
                ]);

                $payload = json_encode([
                    'title' => '今週の学習まとめ',
                    'body' => "翻訳 {$translationCount} 件、復習 {$reviewCount} 単語を達成しました！素晴らしい進捗です✨",
                    'type' => 'weekly_progress',
                ]);

                $webPush->queueNotification($subscription, $payload);
            }
        }

        foreach ($webPush->flush() as $report) {
            if ($report->isSuccess()) {
                Log::info("✅ Push sent to {$report->getEndpoint()}");
            } else {
                Log::warning("❌ Push failed: {$report->getReason()}");
            }
        }
    }
}
