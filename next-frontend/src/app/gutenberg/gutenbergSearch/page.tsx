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

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleSelectBook = (book: any) => {
        const plainTextUrl = book.formats["text/plain; charset=us-ascii"] || book.formats["text/plain"];
        if (!plainTextUrl) return alert("この書籍にはテキストがありません。");
        router.push(
            `/gutenberg/gutenbergView?` +
            `title=${encodeURIComponent(book.title)}` +
            `&url=${encodeURIComponent(plainTextUrl)}` +
            `&authors=${encodeURIComponent(book.authors.map((a: any) => a.name).join(', '))}` +
            `&downloads=${book.download_count}` +
            `&lang=${encodeURIComponent(book.languages.join(', '))}`
        );
    };

    // 書籍のカバー画像URLを取得する関数
    const getBookCoverUrl = (book: any) => {
        // イメージがあれば使用、なければプレースホルダー
        return book.formats["image/jpeg"] || '/book-placeholder.png';
    };

    // スケルトンローダー
    const BookSkeleton = () => (
        <div className="flex gap-4 p-4 border-b border-gray-100 dark:border-gray-700 animate-pulse">
            <div className="bg-gray-200 dark:bg-gray-700 w-16 h-24 rounded"></div>
            <div className="flex-1">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* ヘッダーセクション */}
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">英語名著を検索</h1>
                    <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        Gutenbergプロジェクトの膨大な無料電子書籍から、お好きな英語の名著を見つけてください。
                    </p>
                </div>

                {/* 検索フォーム */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <span className="ri-search-line text-gray-400"></span>
                        </div>
                        <input
                            type="text"
                            placeholder="著者名、タイトル、キーワードで検索..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white transition"
                        />
                        <button
                            onClick={handleSearch}
                            className="absolute right-2 top-1.5 bg-indigo-600 text-white px-4 py-1.5 rounded-md hover:bg-indigo-700 transition"
                        >
                            検索
                        </button>
                    </div>
                </div>

                {/* 結果リスト */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                    {loading ? (
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                            {[...Array(5)].map((_, i) => (
                                <BookSkeleton key={i} />
                            ))}
                        </div>
                    ) : results.length > 0 ? (
                        <div>
                            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                                {results.map((book) => (
                                    <li
                                        key={book.id}
                                        className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition group"
                                        onClick={() => handleSelectBook(book)}
                                    >
                                        <div className="flex gap-4">
                                            <div className="relative min-w-16 h-24 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
                                                {book.formats["image/jpeg"] && (
                                                    <div
                                                        className="w-full h-full bg-center bg-cover"
                                                        style={{ backgroundImage: `url(${getBookCoverUrl(book)})` }}
                                                    />
                                                )}
                                                {!book.formats["image/jpeg"] && (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                                                        <span className="ri-book-2-line text-3xl"></span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1">
                                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition line-clamp-1">
                                                    {book.title}
                                                </h2>
                                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                                    {book.authors.map((a: { name: string }) => a.name).join(', ') || '著者不明'}
                                                </p>
                                                <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400">
                                                    <div className="flex items-center">
                                                        <span className="ri-translate-2 mr-1"></span>
                                                        <span>{book.languages.join(', ').toUpperCase()}</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <span className="ri-download-line mr-1"></span>
                                                        <span>{book.download_count.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="self-center text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="ri-arrow-right-line"></span>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            {/* ページネーション */}
                            <div className="flex justify-between items-center p-4 border-t border-gray-100 dark:border-gray-700">
                                <button
                                    disabled={!prevUrl}
                                    onClick={() => prevUrl && fetchBooks(prevUrl)}
                                    className={`flex items-center px-4 py-2 rounded-lg transition ${prevUrl
                                            ? 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                                            : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                        }`}
                                >
                                    <span className="ri-arrow-left-line mr-1"></span>
                                    前へ
                                </button>

                                <button
                                    disabled={!nextUrl}
                                    onClick={() => nextUrl && fetchBooks(nextUrl)}
                                    className={`flex items-center px-4 py-2 rounded-lg transition ${nextUrl
                                            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                            : 'bg-indigo-300 dark:bg-indigo-800/50 text-white cursor-not-allowed'
                                        }`}
                                >
                                    次へ
                                    <span className="ri-arrow-right-line ml-1"></span>
                                </button>
                            </div>
                        </div>
                    ) : query ? (
                        <div className="p-12 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
                                <span className="ri-search-line text-3xl text-gray-400 dark:text-gray-500"></span>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">検索結果が見つかりません</h3>
                            <p className="mt-2 text-gray-500 dark:text-gray-400">
                                別のキーワードや著者名で検索してみてください。
                            </p>
                        </div>
                    ) : (
                        <div className="p-12 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 mb-4">
                                <span className="ri-book-open-line text-3xl text-indigo-600 dark:text-indigo-400"></span>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">著名な英語書籍を探索</h3>
                            <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                                世界中の名著や古典を見つけて読むことができます。
                                著者名やタイトルで検索を始めましょう。
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}