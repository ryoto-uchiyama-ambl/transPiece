<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class MailController extends Controller
{
    /**
     * メール再送信
     */
    public function resendVerificationEmail(Request $request)
    {
        $user = Auth()->user();

        if (!$user) {
            return response()->json(['message' => 'すでに認証済みです'], 400);
        }

        // メール再送信
        $user->sendEmailVerificationNotification();

        return response()->json(['message' => '確認メールを送信しました']);
    }
}
