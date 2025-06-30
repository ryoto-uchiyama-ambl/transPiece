<?php

namespace App\Jobs;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Foundation\Bus\Dispatchable;
use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;

class SystemUpdatesJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle()
    {
        // VAPID 認証情報の読み込み（config/webpush.php に設定しておく）
        $auth = [
            'VAPID' => [
                'subject' => config('webpush.vapid.subject'),
                'publicKey' => config('webpush.vapid.public_key'),
                'privateKey' => config('webpush.vapid.private_key'),
            ],
        ];

        $webPush = new WebPush($auth);

        // system_updates を許可しているユーザーの pushSubscription を取得
        $users = User::with(['pushSubscriptions' => function ($query) {
            $query->where('system_updates', true);
        }])->get();

        foreach ($users as $user) {
            foreach ($user->pushSubscriptions as $sub) {
                $subscription = Subscription::create([
                    'endpoint' => $sub->endpoint,
                    'publicKey' => $sub->public_key,
                    'authToken' => $sub->auth_token,
                    'contentEncoding' => 'aes128gcm',
                ]);

                $payload = json_encode([
                    'title' => 'システム更新のお知らせ',
                    'body'  => 'TransPieceは近日中にアップデートを実施します。',
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
