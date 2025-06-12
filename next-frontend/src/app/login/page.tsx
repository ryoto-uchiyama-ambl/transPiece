'use client';

import { useState } from 'react';
import api from '../../../lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';


export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const router = useRouter();

    const handleLogin = async () => {
        try {
            await api.get('/sanctum/csrf-cookie');
            await api.post('/api/login', { email, password });
            router.push('/home');
        } catch (error: any) {
            setMessage('ログイン失敗');
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow">
            <h1 className="text-2xl font-bold mb-4">ログイン</h1>
            <input
                type="email"
                placeholder="メールアドレス"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 mb-3 border rounded"
            />
            <input
                type="password"
                placeholder="パスワード"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 mb-4 border rounded"
            />
            <button
                onClick={handleLogin}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
                ログイン
            </button>
            <p className="text-sm mt-2 text-gray-600">
                アカウントをお持ちでない方は <Link href="/register" className="text-blue-500 underline">新規登録</Link>
            </p>
            {message && <p className="mt-4 text-red-500">{message}</p>}
        </div>
    );
}
