'use client';

import { useEffect, useState } from 'react';
import { createEmptyCard } from 'ts-fsrs';
import { v4 as uuidv4 } from 'uuid';
import api from '../../../../lib/api';

type User = {
    id: number;
    name: string;
};

export default function AddPage() {
    const [front, setFront] = useState('');
    const [back, setBack] = useState('');
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                await api.get('/sanctum/csrf-cookie');
                const response = await api.get('/api/user');
                setUser(response.data);
            } catch (err) {
                setError('ユーザー情報の取得に失敗しました');
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const handleAdd = async () => {
        if (!user) {
            setError('ユーザー情報が取得できていません');
            return;
        }

        try {
            setError(null);
            setSuccess(null);

            const fsrsCard = createEmptyCard(new Date());
            await api.post('/api/vocabulary', {
                front,
                back,
                user_id: user.id,
                fsrs_card: fsrsCard,
            });

            setFront('');
            setBack('');
            setSuccess('単語を登録しました');
        } catch (err) {
            setError('登録に失敗しました');
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-xl font-bold mb-4">単語登録</h1>
            {error && <div className="text-red-500 mb-2">{error}</div>}
            {success && <div className="text-green-500 mb-2">{success}</div>}
            <input
                className="border p-2 mr-2"
                value={front}
                onChange={(e) => setFront(e.target.value)}
                placeholder="English"
            />
            <input
                className="border p-2 mr-2"
                value={back}
                onChange={(e) => setBack(e.target.value)}
                placeholder="日本語訳"
            />
            <button onClick={handleAdd} className="bg-blue-500 text-white px-4 py-2">追加</button>
        </div>
    );
}
