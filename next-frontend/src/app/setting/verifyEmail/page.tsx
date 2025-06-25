// pages/verify-email.tsx
'use client';

import { useState } from 'react'
import api from '../../../../lib/api'; // APIクライアントのインポート

export default function VerifyEmail() {
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const handleResendVerification = async () => {
        setLoading(true)
        setMessage(null)
        setError(null)

        try {
            const response = await api.post('/api/email/resend') // Laravel側に対応ルートが必要
            setMessage('確認メールを再送信しました。メールボックスをご確認ください。')
        } catch (err: any) {
            setError('メール再送信に失敗しました。もう一度お試しください。')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-8 w-full max-w-md space-y-6">
                <h1 className="text-xl font-bold text-gray-800 dark:text-white">メール認証</h1>
                <p className="text-gray-600 dark:text-gray-300">
                    メールアドレスの認証がまだ完了していません。登録したメールアドレス宛に送られたリンクをクリックしてください。
                </p>

                {message && <p className="text-green-600">{message}</p>}
                {error && <p className="text-red-600">{error}</p>}

                <button
                    onClick={handleResendVerification}
                    className={`w-full px-4 py-2 rounded-md text-white ${
                        loading ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'
                    } transition`}
                    disabled={loading}
                >
                    {loading ? '送信中...' : '確認メールを再送信'}
                </button>
            </div>
        </div>
    )
}
