'use client';

import { useState } from 'react';
import api from '../../../lib/api';
import Link from 'next/link';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleRegister = async () => {
        try {
            await api.get('/sanctum/csrf-cookie');
            await api.post('/api/register', { name, email, password });
            setMessage('登録成功');
        } catch (error: any) {
            setMessage('登録失敗');
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow">
            <h1 className="text-2xl font-bold mb-4">新規登録</h1>
            <input
                type="text"
                placeholder="名前"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 mb-3 border rounded"
            />
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
                onClick={handleRegister}
                className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
            >
                登録する
            </button>
            <p className="text-sm mt-2 text-gray-600">
                すでにアカウントをお持ちですか？ <Link href="/login" className="text-blue-500 underline">ログイン</Link>
            </p>
            {message && <p className="mt-4 text-red-500">{message}</p>}
        </div>
    );
}
