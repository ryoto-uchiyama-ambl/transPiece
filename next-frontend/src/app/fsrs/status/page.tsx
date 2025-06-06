'use client';

import { useEffect, useState } from 'react';
import { formatDate } from 'ts-fsrs';

export default function StatusPage() {
    const [cards, setCards] = useState<any[]>([]);

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('cards') || '[]');
        setCards(stored);
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-xl font-bold mb-4">カード一覧</h1>
            <table className="w-full table-auto border">
                <thead>
                    <tr>
                        <th className="border px-2">ユーザー</th>
                        <th className="border px-2">英語</th>
                        <th className="border px-2">日本語</th>
                        <th className="border px-2">次回復習日</th>
                    </tr>
                </thead>
                <tbody>
                    {cards.map((card) => (
                        <tr key={card.id}>
                            <td className="border px-2">{card.userId}</td>
                            <td className="border px-2">{card.front}</td>
                            <td className="border px-2">{card.back}</td>
                            <td className="border px-2">{formatDate(card.fsrsCard.due)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
