'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '../../../../lib/api';
import "remixicon/fonts/remixicon.css";

export default function BookDetailPage() {
    const searchParams = useSearchParams();
    const title = searchParams.get('title');
    const url = searchParams.get('url');
    const authors = searchParams.get('authors');
    const downloads = searchParams.get('downloads');
    const lang = searchParams.get('lang');

    const [pages, setPages] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (url) {
            setIsLoading(true);
            fetch(`/api/proxy?url=${encodeURIComponent(url)}`)
                .then((res) => res.text())
                .then((data) => {
                    const cleaned = data.replace(/\r/g, '');
                    paginateText(cleaned);
                    setIsLoading(false);
                })
                .catch(err => {
                    console.error("Error fetching book:", err);
                    setIsLoading(false);
                });
        }
    }, [url]);

    const paginateText = (raw: string) => {
        const paragraphs = raw.split(/\n{2,}/).filter(Boolean);
        const chunkSize = 5;
        const chunks: string[] = [];

        for (let i = 0; i < paragraphs.length; i += chunkSize) {
            chunks.push(paragraphs.slice(i, i + chunkSize).join('\n\n'));
        }

        setPages(chunks);
    };

    const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, pages.length - 1));
    const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 0));

    const uploadToLaravel = async () => {
        try {
            setIsSubmitting(true);
            await api.post('/api/books', {
                title,
                gutenberg_url: url,
                authors,
                downloads,
                lang,
                pages
            });
            setSuccessMessage('ライブラリに追加されました');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error("Error uploading book:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="pl-16 lg:pl-16 min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto p-6">
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    {/* Header Section */}
                    <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 p-6 text-white">
                        <h1 className="text-2xl font-bold">{title || 'ブックタイトル'}</h1>
                        <div className="mt-2 flex flex-wrap items-center gap-4 text-indigo-100">
                            {authors && (
                                <div className="flex items-center">
                                    <span className="ri-user-3-line mr-1"></span>
                                    <span>{authors}</span>
                                </div>
                            )}
                            {downloads && (
                                <div className="flex items-center">
                                    <span className="ri-download-line mr-1"></span>
                                    <span>{downloads} ダウンロード</span>
                                </div>
                            )}
                            {lang && (
                                <div className="flex items-center">
                                    <span className="ri-global-line mr-1"></span>
                                    <span>{lang}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-6">
                        {isLoading ? (
                            <div className="flex justify-center items-center h-[60vh]">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                            </div>
                        ) : pages.length > 0 ? (
                            <>
                                <div className="relative h-[60vh] overflow-auto border border-gray-200 rounded-lg p-6 text-lg leading-relaxed font-serif bg-white whitespace-pre-wrap shadow-sm">
                                    {pages[currentPage]}
                                </div>

                                <div className="flex justify-between items-center mt-6">
                                    <button
                                        onClick={prevPage}
                                        disabled={currentPage === 0}
                                        className={`flex items-center px-4 py-2 rounded-lg transition-all ${currentPage === 0
                                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                                : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                                            }`}
                                    >
                                        <span className="ri-arrow-left-line mr-1"></span>
                                        前のページ
                                    </button>

                                    <span className="text-gray-600 font-medium">
                                        {currentPage + 1} / {pages.length}
                                    </span>

                                    <button
                                        onClick={nextPage}
                                        disabled={currentPage >= pages.length - 1}
                                        className={`flex items-center px-4 py-2 rounded-lg transition-all ${currentPage >= pages.length - 1
                                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                                : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                                            }`}
                                    >
                                        次のページ
                                        <span className="ri-arrow-right-line ml-1"></span>
                                    </button>
                                </div>

                                <div className="flex justify-center mt-8">
                                    {successMessage ? (
                                        <div className="bg-green-100 text-green-700 px-6 py-3 rounded-lg flex items-center">
                                            <span className="ri-check-line mr-2"></span>
                                            {successMessage}
                                        </div>
                                    ) : (
                                        <button
                                            onClick={uploadToLaravel}
                                            disabled={isSubmitting}
                                            className={`flex items-center bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-all ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                                                }`}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                                                    処理中...
                                                </>
                                            ) : (
                                                <>
                                                    <span className="ri-add-line mr-2"></span>
                                                    ライブラリに追加
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-[60vh] text-gray-500">
                                <span className="ri-book-open-line text-5xl mb-4"></span>
                                <p>コンテンツが見つかりませんでした</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}