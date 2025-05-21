"use client";

import { useState, useEffect } from 'react';

export default function VocabularyPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'

    // サンプル単語リスト（実際のアプリではAPIから取得するなど）
    const [vocabulary, setVocabulary] = useState([
    { id: 1, english: "apple", japanese: "りんご", category: "food", memorized: false },
    { id: 2, english: "book", japanese: "本", category: "objects", memorized: false },
    { id: 3, english: "computer", japanese: "コンピューター", category: "technology", memorized: false },
    { id: 4, english: "student", japanese: "学生", category: "people", memorized: false },
    { id: 5, english: "water", japanese: "水", category: "nature", memorized: false },
    { id: 6, english: "library", japanese: "図書館", category: "places", memorized: false },
    { id: 7, english: "smartphone", japanese: "スマートフォン", category: "technology", memorized: false },
    { id: 8, english: "desk", japanese: "机", category: "objects", memorized: false },
    { id: 9, english: "coffee", japanese: "コーヒー", category: "food", memorized: false },
    { id: 10, english: "teacher", japanese: "先生", category: "people", memorized: false },
    { id: 11, english: "mountain", japanese: "山", category: "nature", memorized: false },
    { id: 12, english: "hospital", japanese: "病院", category: "places", memorized: false },
]);

    // カテゴリーリストを動的に生成
    const categories = ['all', ...new Set(vocabulary.map(item => item.category))];

    // 検索・フィルタリング・ソート処理
    const filteredVocabulary = vocabulary
        .filter(item => {
            // 検索語句でフィルタリング
            const matchesSearch =
                item.english.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.japanese.includes(searchTerm);

            // カテゴリーでフィルタリング
            const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;

            return matchesSearch && matchesCategory;
        })
        .sort((a, b) => {
            // 英単語でソート
            if (sortOrder === 'asc') {
                return a.english.localeCompare(b.english);
            } else {
                return b.english.localeCompare(a.english);
            }
        });

    // 単語を記憶済みとしてマーク
    const toggleMemorized = (id : number) => {
        setVocabulary(vocabulary.map(word =>
            word.id === id ? { ...word, memorized: !word.memorized } : word
        ));
    };

    return (
        <div className="flex min-h-screen bg-gray-100">

            <div className="flex-1 ml-16 lg:ml-64">
                <main className="p-6">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h1 className="text-2xl font-bold text-gray-800 mb-6">英日単語リスト</h1>

                        {/* 検索・フィルター部分 */}
                        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="検索..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 pl-10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <span className="absolute left-3 top-2.5 text-gray-400 ri-search-line"></span>
                            </div>

                            <div>
                                <select
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                >
                                    {categories.map(category => (
                                        <option key={category} value={category}>
                                            {category === 'all' ? 'すべてのカテゴリー' : category}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <button
                                    className="w-full px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 flex items-center justify-center"
                                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                >
                                    <span className="mr-2">並び替え</span>
                                    <span className={sortOrder === 'asc' ? 'ri-sort-asc' : 'ri-sort-desc'}></span>
                                </button>
                            </div>
                        </div>

                        {/* 単語リスト */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white rounded-lg overflow-hidden">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">英語</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日本語</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">カテゴリー</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ステータス</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredVocabulary.length > 0 ? (
                                        filteredVocabulary.map((word) => (
                                            <tr key={word.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{word.english}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{word.japanese}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                                                        {word.category}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <button
                                                        onClick={() => toggleMemorized(word.id)}
                                                        className={`px-3 py-1 rounded-full text-xs font-medium ${word.memorized
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-yellow-100 text-yellow-800'
                                                            }`}
                                                    >
                                                        {word.memorized ? '記憶済み' : '勉強中'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                                                単語が見つかりません
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* 単語追加フォーム */}
                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">新しい単語を追加</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <input
                                    type="text"
                                    placeholder="英語"
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                                <input
                                    type="text"
                                    placeholder="日本語"
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                                <input
                                    type="text"
                                    placeholder="カテゴリー"
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <button className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                                追加
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}