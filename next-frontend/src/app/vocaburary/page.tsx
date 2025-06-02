"use client";

import { useState, useEffect } from 'react';

interface VocabularyItem {
    id: number;
    word: string;
    translation: string;
    part_of_speech: string;
    language: string;
    is_understanding: boolean;
}

export default function VocabularyPage() {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [partOfSpeechFilter, setPartOfSpeechFilter] = useState<string>('all');
    const [languageFilter, setLanguageFilter] = useState<string>('all');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // APIから単語データを取得する関数
    const fetchVocabulary = async (): Promise<void> => {
        try {
            setLoading(true);
            setError(null);
            // 実際のAPIエンドポイントに置き換えてください
            // const response = await fetch('/api/vocabulary');
            // const data = await response.json();

            // モックデータ（実際のAPIレスポンスの代わり）
            const mockData: VocabularyItem[] = [
                { id: 1, word: "apple", translation: "りんご", part_of_speech: "noun", language: "English", is_understanding: false },
                { id: 2, word: "run", translation: "走る", part_of_speech: "verb", language: "English", is_understanding: true },
                { id: 3, word: "beautiful", translation: "美しい", part_of_speech: "adjective", language: "English", is_understanding: false },
                { id: 4, word: "quickly", translation: "素早く", part_of_speech: "adverb", language: "English", is_understanding: false },
                { id: 5, word: "computer", translation: "コンピューター", part_of_speech: "noun", language: "English", is_understanding: true },
                { id: 6, word: "study", translation: "勉強する", part_of_speech: "verb", language: "English", is_understanding: false },
                { id: 7, word: "interesting", translation: "面白い", part_of_speech: "adjective", language: "English", is_understanding: true },
                { id: 8, word: "carefully", translation: "注意深く", part_of_speech: "adverb", language: "English", is_understanding: false },
                { id: 9, word: "library", translation: "図書館", part_of_speech: "noun", language: "English", is_understanding: false },
                { id: 10, word: "write", translation: "書く", part_of_speech: "verb", language: "English", is_understanding: true },
            ];

            // APIの代わりにモックデータを使用
            setTimeout(() => {
                setVocabulary(mockData);
                setLoading(false);
            }, 1000); // 1秒の遅延でAPI呼び出しをシミュレート

        } catch (err) {
            setError('単語データの取得に失敗しました');
            setLoading(false);
        }
    };

    // コンポーネントマウント時にデータを取得
    useEffect(() => {
        fetchVocabulary();
    }, []);

    // 品詞と言語のリストを動的に生成
    const partsOfSpeech = ['all', ...new Set(vocabulary.map(item => item.part_of_speech))];
    const languages = ['all', ...new Set(vocabulary.map(item => item.language))];

    // 検索・フィルタリング・ソート処理
    const filteredVocabulary = vocabulary
        .filter(item => {
            // 検索語句でフィルタリング
            const matchesSearch =
                item.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.translation.includes(searchTerm);

            // 品詞でフィルタリング
            const matchesPartOfSpeech = partOfSpeechFilter === 'all' || item.part_of_speech === partOfSpeechFilter;

            // 言語でフィルタリング
            const matchesLanguage = languageFilter === 'all' || item.language === languageFilter;

            return matchesSearch && matchesPartOfSpeech && matchesLanguage;
        })
        .sort((a, b) => {
            // 英単語でソート
            if (sortOrder === 'asc') {
                return a.word.localeCompare(b.word);
            } else {
                return b.word.localeCompare(a.word);
            }
        });

    // 単語の理解状態を切り替える
    const toggleUnderstanding = async (id: number): Promise<void> => {
        try {
            // 実際のAPIコール
            // await fetch(`/api/vocabulary/${id}/toggle-understanding`, { method: 'PUT' });

            // ローカル状態を更新
            setVocabulary(vocabulary.map(word =>
                word.id === id ? { ...word, is_understanding: !word.is_understanding } : word
            ));
        } catch (err) {
            console.error('理解状態の更新に失敗しました:', err);
        }
    };

    // 品詞の日本語表示
    const getPartOfSpeechLabel = (partOfSpeech: string): string => {
        const labels: Record<string, string> = {
            'noun': '名詞',
            'verb': '動詞',
            'adjective': '形容詞',
            'adverb': '副詞',
            'pronoun': '代名詞',
            'preposition': '前置詞',
            'conjunction': '接続詞',
            'interjection': '感嘆詞'
        };
        return labels[partOfSpeech] || partOfSpeech;
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-100 items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">単語データを読み込み中...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen bg-gray-100 items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={fetchVocabulary}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                        再試行
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-100">
            <div className="flex-1 ml-16 lg:ml-64">
                <main className="p-6">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h1 className="text-2xl font-bold text-gray-800 mb-6">英日単語リスト</h1>

                        {/* 検索・フィルター部分 */}
                        <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="検索..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 pl-10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
                            </div>

                            <div>
                                <select
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    value={partOfSpeechFilter}
                                    onChange={(e) => setPartOfSpeechFilter(e.target.value)}
                                >
                                    <option value="all">すべての品詞</option>
                                    {partsOfSpeech.filter(pos => pos !== 'all').map(partOfSpeech => (
                                        <option key={partOfSpeech} value={partOfSpeech}>
                                            {getPartOfSpeechLabel(partOfSpeech)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <select
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    value={languageFilter}
                                    onChange={(e) => setLanguageFilter(e.target.value)}
                                >
                                    <option value="all">すべての言語</option>
                                    {languages.filter(lang => lang !== 'all').map(language => (
                                        <option key={language} value={language}>
                                            {language}
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
                                    <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
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
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">品詞</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">言語</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">理解状態</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredVocabulary.length > 0 ? (
                                        filteredVocabulary.map((word) => (
                                            <tr key={word.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{word.word}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{word.translation}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                        {getPartOfSpeechLabel(word.part_of_speech)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                                                        {word.language}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <button
                                                        onClick={() => toggleUnderstanding(word.id)}
                                                        className={`px-3 py-1 rounded-full text-xs font-medium ${word.is_understanding
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-yellow-100 text-yellow-800'
                                                            }`}
                                                    >
                                                        {word.is_understanding ? '理解済み' : '学習中'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                                                単語が見つかりません
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* リフレッシュボタン */}
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={fetchVocabulary}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                データを更新
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}