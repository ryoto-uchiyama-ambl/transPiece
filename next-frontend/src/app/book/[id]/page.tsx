
'use client';

import { useEffect, useState, useRef } from 'react';
import api from '../../../../lib/api';
import { useParams } from 'next/navigation';

interface Translation {
    translatedText: string;
    score: number;
    AIfeedback: string;
}

interface PageData {
    page_number: number;
    content: string;
    translations: Translation[];
}

interface WordPopupProps {
    word: string;
    translation: string;
    position: { x: number; y: number };
    onClose: () => void;
}

// 単語翻訳用のポップアップコンポーネント
const WordPopup = ({ word, translation, position, onClose }: WordPopupProps) => {
    const popupRef = useRef<HTMLDivElement>(null);

    // クリック外側でポップアップを閉じる
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    const style = {
        top: `${position.y + 20}px`,
        left: `${position.x}px`,
    };

    return (
        <div
            ref={popupRef}
            className="fixed bg-white rounded-lg shadow-lg p-3 z-50 border border-gray-200 max-w-xs"
            style={style}
        >
            <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-gray-800">{word}</span>
                <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700"
                >
                    ×
                </button>
            </div>
            <div className="text-gray-600">{translation}</div>
        </div>
    );
};

export default function BookTranslationPreview() {
    const [currentPage, setCurrentPage] = useState(1);
    const [pages, setPages] = useState<PageData[]>([]);
    const [loading, setLoading] = useState(true);
    const [translatingWord, setTranslatingWord] = useState(false);
    const [wordPopup, setWordPopup] = useState<{
        word: string;
        translation: string;
        position: { x: number; y: number };
        visible: boolean;
    }>({
        word: '',
        translation: '',
        position: { x: 0, y: 0 },
        visible: false
    });
    const [clickedWord, setClickedWord] = useState<string | null>(null);

    const params = useParams();
    const book_id = params.id;

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                await api.get('/sanctum/csrf-cookie');
                const res = await api.get(`/api/book/${book_id}`);
                setPages(res.data.pages); // Laravel 側から受け取る形式に対応
            } catch (err) {
                console.error('データの取得に失敗しました', err);
            } finally {
                setLoading(false);
            }
        };

        if (book_id) {
            fetchData();
        }
    }, [book_id]);

    // 単語翻訳APIを呼び出す関数
    const translateWord = async (word: string, x: number, y: number) => {
        setTranslatingWord(true);
        setClickedWord(word);

        try {
            // 本来はAPIで単語翻訳するべきだが、ここではモック
            // 実際の実装では下記のようなAPIコールを行う
            // const response = await api.post('/api/translate-word', { word });
            // const translation = response.data.translation;

            // モック翻訳 (実際の実装では削除してAPIレスポンスを使用)
            const mockTranslations: Record<string, string> = {
                'the': '〜の、その',
                'a': '1つの、ある',
                'and': 'そして、および',
                'in': '〜の中に、〜において',
                'to': '〜へ、〜に向かって',
                'of': '〜の、〜から',
                'is': 'である、います',
                'for': '〜のために、〜向けの',
                'with': '〜と一緒に、〜を持って',
                'on': '〜の上に、〜について',
                'at': '〜で、〜に',
                'from': '〜から、〜より',
                'by': '〜によって、〜のそばに',
                'about': '〜について、およそ',
                'like': '〜のような、好む',
                'through': '〜を通して、〜の間中',
                'over': '〜の上に、〜を超えて',
                'before': '〜の前に、以前に',
                'between': '〜の間に',
                'after': '〜の後に、〜の後で',
                'since': '〜以来、〜なので',
                'without': '〜なしで、〜がないと',
                'under': '〜の下に、〜未満で',
                'within': '〜の中に、〜以内に',
                'along': '〜に沿って、〜と一緒に',
                'against': '〜に対して、〜に反対して',
                'during': '〜の間に、〜の最中に',
                'around': '〜の周りに、おおよそ',
                'into': '〜の中へ、〜になって',
                'across': '〜を横切って、向こう側に',
                'behind': '〜の後ろに、〜の背後に',
                'beyond': '〜を超えて、〜の向こうに',
                'near': '〜の近くに、もうすぐ',
                'among': '〜の間に、〜の中に',
                'towards': '〜の方へ、〜に向かって',
                'upon': '〜の上に、〜すると直ちに',
                'beside': '〜のそばに、〜に加えて',
                'beneath': '〜の下に、〜に値しない',
                'besides': '〜に加えて、その上',
                'except': '〜を除いて、〜以外は',
                'inside': '〜の内側に、〜の内部に',
                'outside': '〜の外側に、〜の範囲外で',
                'throughout': '〜の至る所に、終始',
                'despite': '〜にもかかわらず',
                'below': '〜の下に、〜より低く',
                'above': '〜の上に、〜より上に',
                'until': '〜まで、〜するまで',
                'unless': '〜でない限り、もし〜でなければ'
            };

            // 辞書にない場合はそのまま返す (実際の実装では削除)
            const translation = mockTranslations[word.toLowerCase()] || `「${word}」の翻訳`;

            // 少し遅延を入れてモックAPIのように見せる (実際の実装では削除)
            await new Promise(resolve => setTimeout(resolve, 300));

            setWordPopup({
                word,
                translation,
                position: { x, y },
                visible: true
            });
        } catch (err) {
            console.error('単語の翻訳に失敗しました', err);
        } finally {
            setTranslatingWord(false);
        }
    };

    const handleWordClick = (e: React.MouseEvent<HTMLSpanElement>, word: string) => {
        e.preventDefault();
        const rect = e.currentTarget.getBoundingClientRect();
        translateWord(word, rect.left, rect.top + window.scrollY);
    };

    const closePopup = () => {
        setWordPopup(prev => ({ ...prev, visible: false }));
        setClickedWord(null);
    };

    if (loading) {
        return <div className="p-8 text-gray-600 text-center">読み込み中...</div>;
    }

    if (pages.length === 0) {
        return <div className="p-8 text-gray-600 text-center">ページデータがありません。</div>;
    }

    const currentData = pages[currentPage - 1];
    const translation = currentData.translations[0]; // 1件目を使う（必要に応じて複数対応も可）

    const changePage = (direction: 'next' | 'prev') => {
        closePopup(); // ページ変更時にポップアップを閉じる
        if (direction === 'next' && currentPage < pages.length) {
            setCurrentPage(currentPage + 1);
        } else if (direction === 'prev' && currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const avgScore = translation ? translation.score : 0;

    // 原文を単語ごとに分割してクリック可能にする
    const renderInteractiveText = (text: string) => {
        // 単語と句読点などを正規表現で分割
        const words = text.split(/(\s+|[.,?!;:()[\]{}""''\-–—])/g).filter(Boolean);

        return words.map((word, index) => {
            // スペースや句読点の場合はそのまま表示
            if (/^\s+$|^[.,?!;:()[\]{}""''\-–—]$/.test(word)) {
                return <span key={index}>{word}</span>;
            }

            // 単語の場合はクリック可能に
            return (
                <span
                    key={index}
                    onClick={(e) => handleWordClick(e, word)}
                    className={`cursor-pointer transition-colors duration-200 ${clickedWord === word ? 'bg-blue-200 text-blue-800' : 'hover:text-blue-600'
                        }`}
                >
                    {word}
                </span>
            );
        });
    };

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-8xl mx-auto pl-6">
                <header className="mb-8">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold text-gray-800">書籍翻訳プレビュー</h1>
                        <div className="bg-white px-4 py-2 rounded-lg shadow text-sm text-gray-600 font-medium">
                            ページ {currentPage} / {pages.length}
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* 原文 */}
                    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow min-h-[700px]">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-gray-700">原文</h2>
                            <div className="flex space-x-2">
                                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">English</span>
                                <span className="text-xs font-medium text-blue-500 bg-blue-50 px-3 py-1 rounded-full">クリックで単語翻訳</span>
                            </div>
                        </div>
                        <div className="border-t border-gray-100 pt-4 overflow-y-auto max-h-[600px] pr-2">
                            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                                {renderInteractiveText(currentData.content)}
                            </p>
                        </div>
                    </div>

                    {/* ユーザー翻訳 */}
                    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow min-h-[700px]">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-gray-700">あなたの翻訳</h2>
                            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">日本語</span>
                        </div>
                        <div className="border-t border-gray-100 pt-4">
                            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{translation?.translatedText ?? '未翻訳'}</p>
                        </div>
                    </div>

                    {/* AI採点 */}
                    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow min-h-[700px]">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-gray-700">AI採点</h2>
                            <span className="text-xs font-medium text-white bg-indigo-500 px-3 py-1 rounded-full">
                                スコア: {avgScore}
                            </span>
                        </div>
                        <div className="border-t border-gray-100 pt-4">
                            <div className="space-y-4">
                                <div className="mt-6">
                                    <p className="text-sm text-gray-700 font-medium mb-2">コメント:</p>
                                    <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        {translation?.AIfeedback ?? 'AIからのコメントはまだありません。'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ページネーション */}
                <div className="flex justify-center mt-10">
                    <div className="inline-flex rounded-md shadow-sm">
                        <button
                            onClick={() => changePage('prev')}
                            disabled={currentPage === 1}
                            className={`relative inline-flex items-center rounded-l-md px-4 py-2 text-sm font-medium ${currentPage === 1
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
                                } border border-gray-300`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="19" y1="12" x2="5" y2="12" />
                                <polyline points="12 19 5 12 12 5" />
                            </svg>
                            前へ
                        </button>
                        <button
                            className="relative inline-flex items-center px-4 py-2 text-sm font-medium bg-blue-200 text-gray-700 border border-gray-300 hover:bg-blue-300 hover:text-white"
                        >
                            採点
                        </button>
                        <button
                            onClick={() => changePage('next')}
                            disabled={currentPage === pages.length}
                            className={`relative inline-flex items-center rounded-r-md px-4 py-2 text-sm font-medium ${currentPage === pages.length
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
                                } border border-gray-300`}
                        >
                            次へ
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="5" y1="12" x2="19" y2="12" />
                                <polyline points="12 5 19 12 12 19" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* 翻訳ポップアップ */}
            {wordPopup.visible && (
                <WordPopup
                    word={wordPopup.word}
                    translation={wordPopup.translation}
                    position={wordPopup.position}
                    onClose={closePopup}
                />
            )}
        </div>
    );
}