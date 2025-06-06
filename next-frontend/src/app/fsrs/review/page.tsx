'use client';

import { useEffect, useState } from 'react';
import { fsrs, generatorParameters, Rating } from 'ts-fsrs';
import api from '../../../../lib/api';

const f = fsrs(generatorParameters({ enable_fuzz: true }));

export default function ReviewPage() {
    const [cards, setCards] = useState<any[]>([]);
    const [currentCard, setCurrentCard] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCards = async () => {
            try {
                await api.get('/sanctum/csrf-cookie');
                const res = await api.get('/api/review-cards');
                setCards(res.data);
                setCurrentCard(res.data[0] || null);
            } catch (err) {
                setError('カードの取得に失敗しました');
            } finally {
                setLoading(false);
            }
        };
        fetchCards();
    }, []);

    const handleRate = async (grade: Rating) => {

        console.log('repeat前:' ,currentCard.fsrsCard.due);
        console.log('repeat前:' ,currentCard.fsrsCard.state);

        if (!currentCard) return;

        const now = new Date();

        console.log('currentCard:', currentCard.fsrsCard);
        console.log((currentCard.fsrsCard.due).toString());
        const date = new Date(currentCard.fsrsCard.due);
        console.log(date);
        currentCard.fsrsCard.due = date;
        const scheduling = f.repeat(currentCard.fsrsCard, now) as Record<Rating, { card: any; log: any }>;
        console.log(scheduling);
        const { card: updatedCard, log } = scheduling[grade];

        console.log('更新前 state:', currentCard.fsrsCard.state);
        console.log('更新後 state:', updatedCard.state);
        console.log('更新前 due:', currentCard.fsrsCard.due);
        console.log('更新後 due:', updatedCard.due);

        console.log('updatedCard:', updatedCard);



        // APIでスケジュール更新（例: /api/review/{id}）
        try {
            await api.post(`/api/review/${currentCard.id}`, {
                fsrsCard: updatedCard,
                log: log,
            });
        } catch (err) {
            console.error('更新失敗:', err);
        }

        const remaining = cards.slice(1);
        setCards(remaining);
        setCurrentCard(remaining[0] || null);
    };

    if (loading) return <div className="p-6">読み込み中...</div>;
    if (error) return <div className="p-6 text-red-500">{error}</div>;
    if (!currentCard) return <div className="p-6">復習カードはありません。</div>;

    return (
        <div className="p-6">
            <h2 className="text-xl font-bold mb-2">復習カード</h2>
            <p className="text-lg mb-4">{currentCard.front}（→ {currentCard.back}）</p>
            <div className="flex gap-4">
                {([Rating.Again, Rating.Hard, Rating.Good, Rating.Easy] as Rating[]).map((r) => (
                    <button
                        key={r}
                        className="bg-green-500 text-white px-4 py-2 rounded"
                        onClick={() => handleRate(r)}
                    >
                        {Rating[r]}
                    </button>
                ))}
            </div>
        </div>
    );
}
