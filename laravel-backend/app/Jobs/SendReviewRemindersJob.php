<?php
namespace App\Jobs;

use App\Models\User;
use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;
use Illuminate\Support\Facades\Log;

class SendReviewRemindersJob implements \Illuminate\Contracts\Queue\ShouldQueue
{
    public function handle()
    {
        $auth = [
            'VAPID' => [
                'subject' => 'mailto:admin@example.com',
                'publicKey' => env('VAPID_PUBLIC_KEY'),
                'privateKey' => env('VAPID_PRIVATE_KEY'),
            ],
        ];
        $webPush = new WebPush($auth);

        // 🔁 すべての対象ユーザーに通知（要件に応じて絞り込み）
        $users = User::with('pushSubscriptions')->get();

        foreach ($users as $user) {
            foreach ($user->pushSubscriptions as $sub) {
                $subscription = Subscription::create([
                    'endpoint' => $sub->endpoint,
                    'publicKey' => $sub->public_key,
                    'authToken' => $sub->auth_token,
                ]);

                $payload = json_encode([
                    'title' => '復習リマインダー',
                    'body' => '本日復習予定の単語があります。確認しましょう。',
                ]);

                $webPush->queueNotification($subscription, $payload);
            }
        }

        foreach ($webPush->flush() as $report) {
            if (!$report->isSuccess()) {
                Log::warning("Push failed: {$report->getReason()}");
            }
        }
    }
}
