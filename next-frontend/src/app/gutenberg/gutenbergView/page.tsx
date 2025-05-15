// Frontend (Next.js) - Add button and API call
'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '../../../../lib/api';


export default function BookDetailPage() {
    const searchParams = useSearchParams();
    const title = searchParams.get('title');
    const url = searchParams.get('url');

    const [pages, setPages] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(0);

    useEffect(() => {
        if (url) {
            fetch(`/api/proxy?url=${encodeURIComponent(url)}`)
                .then((res) => res.text())
                .then((data) => {
                    const cleaned = data.replace(/\r/g, '');
                    paginateText(cleaned);
                });
        }
    }, [url]);

    const paginateText = (raw: string) => {
        const paragraphs = raw.split(/\n{2,}/).filter(Boolean);
        const chunkSize = 10;
        const chunks: string[] = [];

        for (let i = 0; i < paragraphs.length; i += chunkSize) {
            chunks.push(paragraphs.slice(i, i + chunkSize).join('\n\n'));
        }

        setPages(chunks);
    };

    const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, pages.length - 1));
    const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 0));

    const uploadToLaravel = async () => {
        await api.get('/sanctum/csrf-cookie');
        await api.post('/api/addBook', { title, gutenberg_url: url, pages });
        // const response = await fetch('http://localhost:8000/api/addBook', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ title, gutenberg_url: url, pages })
        // });
        // const data = await response.json();
        // alert(data.message || '送信しました');
    };

    return (
        <div className="min-h-screen bg-[#fdf6e3] text-gray-900 p-6">
            <div className="max-w-4xl mx-auto bg-white shadow-md rounded-md p-6">
                <h1 className="text-2xl font-bold mb-4 text-center">{title}</h1>

                {pages.length > 0 ? (
                    <>
                        <div className="relative h-[60vh] overflow-auto border p-6 text-lg leading-relaxed font-serif bg-white whitespace-pre-wrap">
                            {pages[currentPage]}
                        </div>

                        <div className="flex justify-between items-center mt-6 text-sm text-gray-600">
                            <button onClick={prevPage} disabled={currentPage === 0} className={`px-4 py-2 rounded ${currentPage === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                                ← Prev
                            </button>
                            <span>Page {currentPage + 1} of {pages.length}</span>
                            <button onClick={nextPage} disabled={currentPage >= pages.length - 1} className={`px-4 py-2 rounded ${currentPage >= pages.length - 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                                Next →
                            </button>
                        </div>

                        <div className="flex justify-center mt-4">
                            <button onClick={uploadToLaravel} className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">追加</button>
                        </div>
                    </>
                ) : (
                    <p className="text-center text-gray-500">読み込み中...</p>
                )}
            </div>
        </div>
    );
}
