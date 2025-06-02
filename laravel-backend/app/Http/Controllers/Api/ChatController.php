<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ChatController extends Controller
{
    public function chat()
    {
        $text = "hello";

        $response = Http::withToken(env('OPENAI_API_KEY'))
            ->post('https://api.openai.com/v1/chat/completions', [
                'model' => 'gpt-4o',
                'messages' => [
                    ['role' => 'system', 'content' => 'あなたは親切なアシスタントです。'],
                    ['role' => 'user', 'content' => $text],
                ],
                'temperature' => 0.7,
            ]);

        $data = $response->json();

        return response()->json([
            'reply' => $data
        ]);
    }


    public function gradeTranslation(Request $request)
    {
        $request->validate([
            'book_text' => 'required|string',
            'translated_text' => 'required|string',
        ]);

        $bookText = $request->input('book_text');
        $translatedText = $request->input('translated_text');

        // GPTに送るプロンプト
        $prompt = <<<EOT
以下は英語の原文と日本語の翻訳です。この翻訳に100点満点でスコアをつけ、どこが良くてどこを改善すべきか、フィードバックと翻訳例も与えてください。

【原文】
{$bookText}

【翻訳】
{$translatedText}

出力形式は以下にしてください：

スコア: (数値のみ)
フィードバック: (日本語で簡潔に)
翻訳例: (極端に間違っている部分を強調のために、**で囲む)
EOT;

        // OpenAI APIへのリクエスト
        $response = Http::withToken(env('OPENAI_API_KEY'))->post('https://api.openai.com/v1/chat/completions', [
            'model' => 'gpt-4o',
            'messages' => [
                ['role' => 'system', 'content' => 'あなたは翻訳の専門家であり、丁寧なフィードバックを与えるAIです。'],
                ['role' => 'user', 'content' => $prompt],
            ],
            'temperature' => 0.3,
        ]);

        $data = $response->json();

        // 応答のパース
        $content = $data['choices'][0]['message']['content'] ?? '';
        $score = 0;
        $feedback = 'フィードバックを取得できませんでした。';
        $translationExample = '翻訳例を取得できませんでした。';

        if (preg_match('/スコア[:：]?\s*(\d+)/u', $content, $matches)) {
            $score = (int) $matches[1];
        }

        if (preg_match('/フィードバック[:：]?\s*(.+)/u', $content, $matches)) {
            $feedback = trim($matches[1]);
        }

        if (preg_match('/翻訳例[:：]?\s*(.+)/us', $content, $matches)) {
            $translationExample = trim($matches[1]);
        }

        return response()->json([
            'score' => $score,
            'feedback' => $feedback,
            'AItext' => $translationExample ?? '',
        ]);
    }


}
