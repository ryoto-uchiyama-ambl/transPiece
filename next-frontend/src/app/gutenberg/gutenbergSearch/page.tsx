'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BookSearchPage() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [nextUrl, setNextUrl] = useState<string | null>(null);
    const [prevUrl, setPrevUrl] = useState<string | null>(null);
    const [currentUrl, setCurrentUrl] = useState<string | null>(null);
    const router = useRouter();

    const fetchBooks = async (url: string) => {
        setLoading(true);
        try {
            const res = await fetch(url);
            const data = await res.json();
            setResults(data.results);
            setNextUrl(data.next);
            setPrevUrl(data.previous);
            setCurrentUrl(url);
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        if (!query) return;
        const searchUrl = `https://gutendex.com/books/?search=${encodeURIComponent(query)}&languages=en`;
        fetchBooks(searchUrl);
    };

    const handleSelectBook = (book: any) => {
        console.log(book , "book");
        const plainTextUrl = book.formats["text/plain; charset=us-ascii"] || book.formats["text/plain"];
        if (!plainTextUrl) return alert("この書籍にはテキストがありません。");
        router.push(`/gutenberg/gutenbergView?title=${encodeURIComponent(book.title)}&url=${encodeURIComponent(plainTextUrl)}`);
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6">
                <h1 className="text-2xl font-bold mb-4 text-center">英語名著を検索</h1>

                <div className="flex mb-4">
                    <input
                        type="text"
                        placeholder="タイトルを入力"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="flex-1 p-2 border rounded-l"
                    />
                    <button
                        onClick={handleSearch}
                        className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700"
                    >
                        検索
                    </button>
                </div>

                {loading && <p className="text-center text-gray-500">読み込み中...</p>}

                <ul className="divide-y">
                    {results.map((book) => (
                        <li key={book.id} className="py-4 cursor-pointer hover:bg-gray-50" onClick={()=> handleSelectBook(book)}>
                            <h2 className="text-lg font-semibold">{book.title}</h2>
                            <p className="text-sm text-gray-600">
                                {book.authors.map((a) => a.name).join(', ') || 'Unknown author'}
                            </p>
                        </li>
                    ))}
                </ul>

                {/* ページネーションボタン */}
                <div className="flex justify-between mt-6">
                    <button
                        disabled={!prevUrl}
                        onClick={() => prevUrl && fetchBooks(prevUrl)}
                        className={`px-4 py-2 rounded ${prevUrl ? 'bg-gray-300 hover:bg-gray-400' : 'bg-gray-200 cursor-not-allowed'
                            }`}
                    >
                        前へ
                    </button>

                    <button
                        disabled={!nextUrl}
                        onClick={() => nextUrl && fetchBooks(nextUrl)}
                        className={`px-4 py-2 rounded ${nextUrl ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-300 cursor-not-allowed text-white'
                            }`}
                    >
                        次へ
                    </button>
                </div>
            </div>
        </div>
    );
}
