"use client";

import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { useRouter } from 'next/navigation';

interface VocabularyItem {
    id: number;
    word: string;
    translation: string;
    part_of_speech: string;
    language: string;
    is_understanding: number;
    due_schedule: string;
}

export default function VocabularyPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [partOfSpeechFilter, setPartOfSpeechFilter] = useState('all');
    const [languageFilter, setLanguageFilter] = useState('all');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    const fetchVocabulary = async () => {
        try {
            setLoading(true);
            setError(null);

            await api.get('/sanctum/csrf-cookie');
            const response = await api.get('/api/vocabulary');

            const vocabularyData: VocabularyItem[] = response.data.map((item: any) => ({
                id: item.id,
                word: item.word,
                translation: item.translation,
                part_of_speech: item.part_of_speech,
                language: item.language,
                is_understanding: item.is_understanding,
                due_schedule: item.due,
            }));

            setVocabulary(vocabularyData);
        } catch (err) {
            setError('単語データの取得に失敗しました');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVocabulary();
    }, []);

    const partsOfSpeech = ['all', ...new Set(vocabulary.map(item => item.part_of_speech))];
    const languages = ['all', ...new Set(vocabulary.map(item => item.language))];

    const filteredVocabulary = vocabulary
        .filter(item => {
            const matchesSearch =
                item.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.translation.includes(searchTerm);
            const matchesPartOfSpeech = partOfSpeechFilter === 'all' || item.part_of_speech === partOfSpeechFilter;
            const matchesLanguage = languageFilter === 'all' || item.language === languageFilter;
            return matchesSearch && matchesPartOfSpeech && matchesLanguage;
        })
        .sort((a, b) => sortOrder === 'asc'
            ? a.word.localeCompare(b.word)
            : b.word.localeCompare(a.word)
        );

    const totalPages = Math.ceil(filteredVocabulary.length / itemsPerPage);
    const currentItems = filteredVocabulary.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // const toggleUnderstanding = async (id: number) => {
    //     try {
    //         setVocabulary(prev =>
    //             prev.map(word =>
    //                 word.id === id ? { ...word, is_understanding: !word.is_understanding } : word
    //             )
    //         );
    //     } catch (err) {
    //         console.error('理解状態の更新に失敗しました:', err);
    //     }
    // };

    const getStateLabel = (state: number) => {
        switch (state) {
            case 0: return '未学習';
            case 1: return '学習中';
            case 2: return '理解済み';
            case 3: return '復習済み';
            default: return '不明';
        }
    }

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
            <div className="flex min-h-screen items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin h-12 w-12 border-b-2 border-indigo-500 rounded-full mx-auto mb-4" />
                    <p className="text-gray-600">単語データを読み込み中...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-100">
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
            <div className="flex-1 ml-16 lg:ml-16 p-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-6">単語リスト</h1>

                    <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <input
                            type="text"
                            placeholder="検索..."
                            className="w-full px-4 py-2 border rounded-lg focus:ring-indigo-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <select
                            className="w-full px-4 py-2 border rounded-lg focus:ring-indigo-500"
                            value={partOfSpeechFilter}
                            onChange={(e) => setPartOfSpeechFilter(e.target.value)}
                        >
                            <option value="all">すべての品詞</option>
                            {partsOfSpeech.filter(pos => pos !== 'all').map(pos => (
                                <option key={pos} value={pos}>{getPartOfSpeechLabel(pos)}</option>
                            ))}
                        </select>
                        <select
                            className="w-full px-4 py-2 border rounded-lg focus:ring-indigo-500"
                            value={languageFilter}
                            onChange={(e) => setLanguageFilter(e.target.value)}
                        >
                            <option value="all">すべての言語</option>
                            {languages.filter(lang => lang !== 'all').map(lang => (
                                <option key={lang} value={lang}>{lang}</option>
                            ))}
                        </select>
                        <button
                            className="w-full px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200"
                            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        >
                            並び替え {sortOrder === 'asc' ? '↑' : '↓'}
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white rounded-lg overflow-hidden">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">英語</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">日本語</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">品詞</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">言語</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">理解状態</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">次の学習日</th>

                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {currentItems.length > 0 ? currentItems.map(word => (
                                    <tr key={word.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{word.word}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{word.translation}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                                {getPartOfSpeechLabel(word.part_of_speech)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                                                {word.language}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium">
                                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                                                {getStateLabel(word.is_understanding)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {word.due_schedule
                                                ? new Date(word.due_schedule).toLocaleString('ja-JP', {
                                                    year: 'numeric',
                                                    month: '2-digit',
                                                    day: '2-digit',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })
                                                : ''}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="text-center text-sm text-gray-500 py-4">
                                            単語が見つかりません
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* ページネーション */}
                    <div className="mt-6 flex justify-center space-x-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
                        >
                            前へ
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`px-3 py-1 rounded ${currentPage === page
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-200 text-gray-700'
                                    }`}
                            >
                                {page}
                            </button>
                        ))}
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
                        >
                            次へ
                        </button>
                    </div>

                    {/* リフレッシュ　& 学習 */}
                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={fetchVocabulary}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 mr-6"
                        >
                            データを更新
                        </button>

                        <button
                            onClick={() => router.push('/study')}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                            単語を学習
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
