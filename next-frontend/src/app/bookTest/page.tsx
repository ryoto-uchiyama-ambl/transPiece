'use client';

import { useState } from 'react';

export default function BookTranslationPreview() {
    const [currentPage, setCurrentPage] = useState(1);

    // サンプルデータ
    const bookData = [
        {
            id: 1,
            originalText: "In a hole in the ground there lived a hobbit. Not a nasty, dirty, wet hole, filled with the ends of worms and an oozy smell, nor yet a dry, bare, sandy hole with nothing in it to sit down on or to eat: it was a hobbit-hole, and that means comfort.",
            userTranslation: "地面の穴の中に、ホビットが住んでいた。それは不快で、汚く、湿った穴ではなく、ミミズの末端や粘っこいにおいで満たされているわけでもなく、また座ったり食べたりするものが何もない乾いた、むき出しの、砂っぽい穴でもなかった。それはホビットの穴だったのだ。つまり、快適だということだ。",
            aiScoring: {
                accuracy: 95,
                fluency: 90,
                naturalness: 93,
                comments: "全体的に素晴らしい翻訳です。「ミミズの末端」は「ミミズの死骸」とするとより自然かもしれません。"
            }
        },
        {
            id: 2,
            originalText: "It had a perfectly round door like a porthole, painted green, with a shiny yellow brass knob in the exact middle. The door opened on to a tube-shaped hall like a tunnel: a very comfortable tunnel without smoke, with panelled walls, and floors tiled and carpeted, provided with polished chairs, and lots and lots of pegs for hats and coats.",
            userTranslation: "その穴には、舷窓のような完全に丸いドアがあり、緑色に塗られ、真ん中には光る黄色い真鍮のつまみがついていた。ドアを開けると、トンネルのような筒状の廊下があった。煙のない、壁にはパネルが張られ、床にはタイルが敷かれカーペットが敷かれた、磨かれた椅子と、帽子やコートをかけるための沢山のフックが備え付けられた、とても快適なトンネルだった。",
            aiScoring: {
                accuracy: 92,
                fluency: 88,
                naturalness: 90,
                comments: "「フック」は「ペグ」の翻訳として使われていますが、文脈によっては「掛け釘」の方が適切かもしれません。全体的には非常に良い翻訳です。"
            }
        },
        {
            id: 3,
            originalText: "The tunnel wound on and on, going fairly but not quite straight into the side of the hill - The Hill, as all the people for many miles round called it - and many little round doors opened out of it, first on one side and then on another.",
            userTranslation: "トンネルはくねくねとかなり真っすぐに丘の側面へと続いていた—それは、周囲何マイルもの人々がそう呼んでいた「丘」だった—そしてそこからは多くの小さな丸いドアが開いていて、最初は片側に、そして別の側に続いていた。",
            aiScoring: {
                accuracy: 85,
                fluency: 82,
                naturalness: 80,
                comments: "「かなり真っすぐに」と「くねくねと」は矛盾しています。原文は「ほぼ真っすぐだがそうではない」という意味です。また、文の後半の構造が少し分かりにくくなっています。"
            }
        }
    ];

    // 現在のページデータ
    const currentData = bookData[currentPage - 1];

    // ページを変更する関数
    const changePage = (direction: 'next' | 'prev') => {
        if (direction === 'next' && currentPage < bookData.length) {
            setCurrentPage(currentPage + 1);
        } else if (direction === 'prev' && currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto pl-10">
                <header className="mb-8">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold text-gray-800">書籍翻訳プレビュー</h1>
                        <div className="bg-white px-4 py-2 rounded-lg shadow text-sm text-gray-600 font-medium">
                            ページ {currentPage} / {bookData.length}
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* 原文エリア */}
                    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow min-h-[700px]">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-gray-700">原文</h2>
                            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">English</span>
                        </div>
                        <div className="border-t border-gray-100 pt-4">
                            <p className="text-gray-800 leading-relaxed">{currentData.originalText}</p>
                        </div>
                    </div>

                    {/* ユーザー翻訳エリア */}
                    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow min-h-[700px]">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-gray-700">あなたの翻訳</h2>
                            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">日本語</span>
                        </div>
                        <div className="border-t border-gray-100 pt-4">
                            <p className="text-gray-800 leading-relaxed">{currentData.userTranslation}</p>
                        </div>
                    </div>

                    {/* AI採点エリア */}
                    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow min-h-[700px]">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-gray-700">AI採点</h2>
                            <span className="text-xs font-medium text-white bg-indigo-500 px-3 py-1 rounded-full">
                                スコア: {Math.round((currentData.aiScoring.accuracy + currentData.aiScoring.fluency + currentData.aiScoring.naturalness) / 3)}
                            </span>
                        </div>
                        <div className="border-t border-gray-100 pt-4">
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-medium text-gray-600">正確さ</span>
                                        <span className="text-sm font-medium text-gray-800">{currentData.aiScoring.accuracy}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${currentData.aiScoring.accuracy}%` }}></div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-medium text-gray-600">流暢さ</span>
                                        <span className="text-sm font-medium text-gray-800">{currentData.aiScoring.fluency}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${currentData.aiScoring.fluency}%` }}></div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-medium text-gray-600">自然さ</span>
                                        <span className="text-sm font-medium text-gray-800">{currentData.aiScoring.naturalness}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div className="bg-purple-500 h-2.5 rounded-full" style={{ width: `${currentData.aiScoring.naturalness}%` }}></div>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <p className="text-sm text-gray-700 font-medium mb-2">コメント:</p>
                                    <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-200">{currentData.aiScoring.comments}</p>
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
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="19" y1="12" x2="5" y2="12"></line>
                                <polyline points="12 19 5 12 12 5"></polyline>
                            </svg>
                            前へ
                        </button>
                        <button
                            className={`relative inline-flex items-center px-4 py-2 text-sm font-medium
                                bg-blue-200 text-gray-700
                                border border-gray-300 hover:bg-blue-300 hover:text-white`}
                        >
                            採点
                        </button>
                        <button
                            onClick={() => changePage('next')}
                            disabled={currentPage === bookData.length}
                            className={`relative inline-flex items-center rounded-r-md px-4 py-2 text-sm font-medium ${currentPage === bookData.length
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
                                } border border-gray-300`}
                        >
                            次へ
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                <polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}