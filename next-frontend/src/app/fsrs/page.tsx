'use client';

import { useEffect, useState } from 'react';
import {
    createEmptyCard,
    formatDate,
    fsrs,
    generatorParameters,
    Rating,
    Grades,
} from 'ts-fsrs';

type Result = {
    grade: string;
    card: Record<string, any>;
    log: Record<string, any>;
};

export default function FsrsTestPage() {
    const [results, setResults] = useState<Result[]>([]);

    useEffect(() => {
        const params = generatorParameters({ enable_fuzz: true });
        const f = fsrs(params);
        const card = createEmptyCard(new Date('2022-2-1 10:00:00'));
        const now = new Date('2022-2-2 10:00:00');

        const scheduling_cards = f.repeat(card, now);

        const formattedResults: Result[] = Grades.map((grade) => {
            const { log, card } = scheduling_cards[grade];

            return {
                grade: Rating[grade],
                card: {
                    ...card,
                    due: formatDate(card.due),
                    last_review: formatDate(card.last_review as Date),
                },
                log: {
                    ...log,
                    review: formatDate(log.review),
                },
            };
        });

        setResults(formattedResults);
    }, []);

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-bold mb-4">FSRS スケジューリング結果</h1>
            {results.map((result, idx) => (
                <div key={idx} className="mb-6 bg-white p-4 rounded shadow">
                    <h2 className="text-xl font-semibold mb-2">{result.grade}</h2>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <h3 className="font-bold">Card</h3>
                            <ul className="list-disc pl-4">
                                {Object.entries(result.card).map(([key, value]) => (
                                    <li key={key}>
                                        <strong>{key}:</strong> {String(value)}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-bold">Log</h3>
                            <ul className="list-disc pl-4">
                                {Object.entries(result.log).map(([key, value]) => (
                                    <li key={key}>
                                        <strong>{key}:</strong> {String(value)}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
