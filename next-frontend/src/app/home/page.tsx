'use client';

import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';


interface Book {
    id: number;
    title: string;
    author: string;
    lang: string;
    downloads: number;
    gutenberg_url: string;
    is_favorite: boolean;
    current_page: number;
    total_page: number;
}

export default function HomePage() {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalBooks: 0, totalPages: 0, favorites: 0, recentlyAdded: '' });
    const [isFavorite, setIsFavorite] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                await api.get('/api/user');
            } catch (err: any) {
                if (err.response && err.response.status === 401) {
                    router.push('/login');
                }
            }
        };
        const fetchBooks = async () => {
            try {
                await api.get('/sanctum/csrf-cookie');
                const res = await api.get('/api/books');
                setBooks(res.data.books);
                setStats(res.data.stats);
            } catch (err: any) {
                if (err.response && err.response.status === 401) return;
                console.error('取得失敗:', err);
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
        fetchBooks();
    }, []);

    // カスタムスケルトンローダー
    const BookSkeleton = () => (
        <div className="bg-gray-800/10 rounded-xl p-5 animate-pulse">
            <div className="h-6 bg-gray-800/20 rounded-md w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-800/20 rounded-md w-1/2 mb-3"></div>
            <div className="h-3 bg-gray-800/20 rounded-md w-1/4 mb-2"></div>
            <div className="h-3 bg-gray-800/20 rounded-md w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-800/20 rounded-md w-1/4 mt-3"></div>
        </div>
    );

    //お気に入り切り替え
    const toggleFavorite = async (bookId: number) => {
        try {
            await api.get('/sanctum/csrf-cookie');
            const res = await api.post(`/api/books/${bookId}/favorite`);
            const updatedBooks = books.map(book =>
                book.id === bookId ? { ...book, is_favorite: res.data.favorite } : book
            );
            setBooks(updatedBooks);
            setStats(prevStats => ({
                ...prevStats,
                favorites: res.data.favorite ? prevStats.favorites + 1 : prevStats.favorites - 1
            }));
        } catch (error) {
            console.error('お気に入り切り替え失敗', error);
        }
    }

    const changeCurrentBook = async (bookId: number) => {
        try {
            await api.get('/sanctum/csrf-cookie');
            const res = await api.post(`api/books/${bookId}/changeCurrentBook`);
        } catch (error) {
            console.error('現在の本切り替え失敗', error);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto pl-10">
                {/* ヘッダーセクション */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                            あなたの本棚
                        </h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-300">
                            お気に入りの書籍を翻訳しましょう
                        </p>
                    </div>

                    <Link
                        href="/gutenberg/gutenbergSearch"
                        className="inline-flex px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition items-center space-x-2"
                    >
                        <span className="ri-add-line"></span>
                        <span>新しい本を追加</span>
                    </Link>
                </div>

                {/* 統計カード */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-blue-500/10 dark:bg-blue-400/10 rounded-lg">
                                <span className="ri-book-open-line text-xl text-blue-600 dark:text-blue-400"></span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">総書籍数</p>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{loading ? '...' : stats.totalBooks}</h3>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-blue-500/10 dark:bg-blue-400/10 rounded-lg">
                                <span className="ri-translate-2 text-xl text-blue-600 dark:text-blue-400"></span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">総翻訳数</p>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{loading ? '...' : stats.totalPages}</h3>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-purple-500/10 dark:bg-purple-400/10 rounded-lg">
                                <span className="ri-bookmark-line text-xl text-purple-600 dark:text-purple-400"></span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">お気に入り</p>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{loading ? '...' : stats.favorites}</h3>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-emerald-500/10 dark:bg-emerald-400/10 rounded-lg">
                                <span className="ri-time-line text-xl text-emerald-600 dark:text-emerald-400"></span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">最近の追加</p>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{loading ? '...' : stats.recentlyAdded}</h3>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 本のリスト */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
                        <span className="ri-apps-line mr-2"></span>
                        すべての書籍
                    </h2>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {[...Array(8)].map((_, index) => (
                                <BookSkeleton key={index} />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {books.map((book) => (
                                <div
                                    key={book.id}
                                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition group border border-gray-100 dark:border-gray-700"
                                >
                                    <div className="h-30 bg-gradient-to-r from-indigo-500 to-purple-600 relative p-5 flex items-end">
                                        <div className="absolute inset-0 bg-black/20"></div>
                                        <h2 className="text-xl font-bold text-white relative z-10 line-clamp-2">{book.title}</h2>
                                    </div>
                                    <div className="p-5">
                                        <p className="text-gray-700 dark:text-gray-300 font-medium mb-3">{book.author || '著者不明'}</p>
                                        <div className="flex items-center space-x-4 mb-4">
                                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                <span className="ri-translate-2 mr-1"></span>
                                                <span>{book.lang}</span>
                                            </div>
                                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                <span className="ri-download-line mr-1"></span>
                                                <span>{book.downloads.toLocaleString()}</span>
                                            </div>
                                        </div>
                                        {book.total_page > 0 && (
                                            <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full mb-4">
                                                <div
                                                    className="h-2 bg-indigo-500 rounded-full"
                                                    style={{ width: `${Math.floor((book.current_page || 0) / book.total_page * 100)}%` }}
                                                ></div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    進捗: {Math.floor((book.current_page || 0) / book.total_page * 100)}%
                                                </p>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center">
                                            <a
                                                href={`/book/${book.id}`}
                                                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium flex items-center text-sm transition"
                                            >
                                                翻訳を試みる
                                                <span className="ri-arrow-right-line ml-1 group-hover:translate-x-1 transition-transform"></span>
                                            </a>
                                            <button
                                                onClick={() => toggleFavorite(book.id)}
                                                className={`p-2 transition ${book.is_favorite
                                                    ? 'text-indigo-500 hover:text-indigo-700'
                                                    : 'text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                                                    }`}
                                            >
                                                <span className={book.is_favorite ? 'ri-bookmark-fill' : 'ri-bookmark-line'}></span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {books.length === 0 && !loading && (
                    <div className="text-center py-16">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                            <span className="ri-book-open-line text-3xl text-gray-400"></span>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">本がまだありません</h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
                            新しい本を追加して、あなたの読書コレクションを始めましょう。
                        </p>
                        <Link
                            href="/gutenberg/gutenbergSearch"
                            className="inline-flex px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition items-center space-x-2"
                        >
                            <span className="ri-add-line"></span>
                            <span>最初の本を追加</span>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}