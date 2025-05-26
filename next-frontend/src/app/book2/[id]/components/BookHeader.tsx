'use client';

interface BookHeaderProps {
    currentPage: number;
    totalPages: number;
}

export default function BookHeader({ currentPage, totalPages }: BookHeaderProps) {
    return (
        <header className="mb-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">書籍翻訳プレビュー</h1>
                <div className="bg-white px-4 py-2 rounded-lg shadow text-sm text-gray-600 font-medium">
                    ページ {currentPage} / {totalPages}
                </div>
            </div>
        </header>
    );
}
