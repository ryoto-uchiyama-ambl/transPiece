'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import api from '../../../lib/api';


export default function UserPage() {
    //const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogout = async () => {
        setLoading(true);
        setError(null);

        try {
            await api.get('/sanctum/csrf-cookie');

            await api.post('/logout');
            //router.push('/');
        } catch (err: any) {
            setError(err.message || 'ログアウトに失敗しました');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <h1>ユーザーページ</h1>
            <p>ようこそ、ユーザーさん！</p>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <button onClick={handleLogout} disabled={loading}>
                {loading ? 'ログアウト中...' : 'ログアウト'}
            </button>
        </div>
    );
}
