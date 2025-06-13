"use client";

import { useState, useEffect } from 'react';
import api from '../../../lib/api';

interface VocabularyItem {
    id: number;
    word: string;
    translation: string;
    part_of_speech: string;
    language: string;
    is_understanding: number;
    due_schedule: string;
}

interface StudySession {
    totalWords: number;
    correctAnswers: number;
    studiedWords: VocabularyItem[];
}

export default function StudyPage() {
    const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);
    const [currentWord, setCurrentWord] = useState<VocabularyItem | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [studyMode, setStudyMode] = useState<'english-to-japanese' | 'japanese-to-english'>('english-to-japanese');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [studySession, setStudySession] = useState<StudySession>({
        totalWords: 0,
        correctAnswers: 0,
        studiedWords: []
    });
    const [isStudyStarted, setIsStudyStarted] = useState(false);
    const [studyCompleted, setStudyCompleted] = useState(false);

    const fetchStudyWords = async () => {
        try {
            setLoading(true);
            setError(null);

            await api.get('/sanctum/csrf-cookie');
            const response = await api.get('/api/getVocabularyStudies');

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
            if (vocabularyData.length > 0) {
                setCurrentWord(vocabularyData[0]);
                setStudySession(prev => ({ ...prev, totalWords: vocabularyData.length }));
            }
        } catch (err) {
            setError('学習データの取得に失敗しました');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudyWords();
    }, []);

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

    const handleAnswerResponse = async (difficulty: 'again' | 'hard' | 'good' | 'easy') => {
        if (!currentWord) return;

        // 学習結果を記録（good以上を正解として扱う）
        const isCorrect = difficulty === 'good' || difficulty === 'easy';
        const updatedSession = {
            ...studySession,
            correctAnswers: isCorrect ? studySession.correctAnswers + 1 : studySession.correctAnswers,
            studiedWords: [...studySession.studiedWords, currentWord]
        };
        setStudySession(updatedSession);

        try {
            // APIに学習結果を送信
            await api.post(`/api/vocabulary/${currentWord.id}/study`, {
                difficulty: difficulty,
                study_mode: studyMode
            });
        } catch (err) {
            console.error('学習結果の送信に失敗しました:', err);
        }

        // 次の単語に進む
        const nextIndex = currentIndex + 1;
        if (nextIndex < vocabulary.length) {
            setCurrentIndex(nextIndex);
            setCurrentWord(vocabulary[nextIndex]);
            setShowAnswer(false);
        } else {
            setStudyCompleted(true);
        }
    };

    const resetStudy = () => {
        setCurrentIndex(0);
        setCurrentWord(vocabulary.length > 0 ? vocabulary[0] : null);
        setShowAnswer(false);
        setStudySession({
            totalWords: vocabulary.length,
            correctAnswers: 0,
            studiedWords: []
        });
        setStudyCompleted(false);
        setIsStudyStarted(false);
    };

    const startStudy = () => {
        setIsStudyStarted(true);
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin h-12 w-12 border-b-2 border-indigo-500 rounded-full mx-auto mb-4" />
                    <p className="text-gray-600">学習データを読み込み中...</p>
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
                        onClick={fetchStudyWords}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                        再試行
                    </button>
                </div>
            </div>
        );
    }

    if (vocabulary.length === 0) {
        return (
            <div className="flex min-h-screen bg-gray-100">
                <div className="flex-1 ml-16 lg:ml-16 p-6">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h1 className="text-2xl font-bold text-gray-800 mb-6">学習</h1>
                        <div className="text-center py-12">
                            <p className="text-gray-600 mb-4">学習する単語がありません</p>
                            <button
                                onClick={fetchStudyWords}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                            >
                                データを更新
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (studyCompleted) {
        const accuracy = Math.round((studySession.correctAnswers / studySession.totalWords) * 100);

        return (
            <div className="flex min-h-screen bg-gray-100">
                <div className="flex-1 ml-16 lg:ml-16 p-6">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h1 className="text-2xl font-bold text-gray-800 mb-6">学習完了</h1>

                        <div className="text-center py-8">
                            <div className="mb-6">
                                <div className="text-6xl mb-4">🎉</div>
                                <h2 className="text-3xl font-bold text-gray-800 mb-2">お疲れ様でした！</h2>
                                <p className="text-gray-600">学習セッションが完了しました</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="bg-blue-50 p-6 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600">{studySession.totalWords}</div>
                                    <div className="text-sm text-gray-600">学習した単語数</div>
                                </div>
                                <div className="bg-green-50 p-6 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600">{studySession.correctAnswers}</div>
                                    <div className="text-sm text-gray-600">正解数</div>
                                </div>
                                <div className="bg-purple-50 p-6 rounded-lg">
                                    <div className="text-2xl font-bold text-purple-600">{accuracy}%</div>
                                    <div className="text-sm text-gray-600">正解率</div>
                                </div>
                            </div>

                            <div className="flex justify-center space-x-4">
                                <button
                                    onClick={resetStudy}
                                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                >
                                    もう一度学習
                                </button>
                                <button
                                    onClick={fetchStudyWords}
                                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                                >
                                    新しい単語で学習
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!isStudyStarted) {
        return (
            <div className="flex min-h-screen bg-gray-100">
                <div className="flex-1 ml-16 lg:ml-16 p-6">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h1 className="text-2xl font-bold text-gray-800 mb-6">学習</h1>

                        <div className="max-w-2xl mx-auto">
                            <div className="text-center mb-8">
                                <div className="text-5xl text-blue-600 mb-4">
                                    <i className="ri-book-open-line"></i>
                                </div>
                                <h2 className="text-xl font-semibold text-gray-800 mb-2">学習を開始しましょう</h2>
                                <p className="text-gray-600">今日は{vocabulary.length}個の単語が学習対象です</p>
                            </div>

                            <div className="mb-8">
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    学習モード
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setStudyMode('english-to-japanese')}
                                        className={`p-4 border-2 rounded-lg text-left ${studyMode === 'english-to-japanese'
                                                ? 'border-indigo-500 bg-indigo-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="font-medium">英語 → 日本語</div>
                                        <div className="text-sm text-gray-500">英語を見て日本語を答える</div>
                                    </button>
                                    <button
                                        onClick={() => setStudyMode('japanese-to-english')}
                                        className={`p-4 border-2 rounded-lg text-left ${studyMode === 'japanese-to-english'
                                                ? 'border-indigo-500 bg-indigo-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="font-medium">日本語 → 英語</div>
                                        <div className="text-sm text-gray-500">日本語を見て英語を答える</div>
                                    </button>
                                </div>
                            </div>

                            <div className="text-center">
                                <button
                                    onClick={startStudy}
                                    className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-lg font-medium"
                                >
                                    学習開始
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!currentWord) return null;

    const progress = ((currentIndex + 1) / vocabulary.length) * 100;
    const question = studyMode === 'english-to-japanese' ? currentWord.word : currentWord.translation;
    const answer = studyMode === 'english-to-japanese' ? currentWord.translation : currentWord.word;

    return (
        <div className="flex min-h-screen bg-gray-100">
            <div className="flex-1 ml-16 lg:ml-16 p-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <h1 className="text-2xl font-bold text-gray-800">学習</h1>
                            <div className="text-sm text-gray-600">
                                {currentIndex + 1} / {vocabulary.length}
                            </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    <div className="max-w-2xl mx-auto">
                        <div className="text-center mb-8">
                            <div className="mb-4">
                                <span className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
                                    {getPartOfSpeechLabel(currentWord.part_of_speech)}
                                </span>
                            </div>

                            <div className="mb-6">
                                <div className="text-4xl font-bold text-gray-800 mb-2">{question}</div>
                                <div className="text-sm text-gray-500">
                                    {studyMode === 'english-to-japanese' ? '日本語で答えてください' : '英語で答えてください'}
                                </div>
                            </div>

                            {showAnswer ? (
                                <div className="mb-8">
                                    <div className="text-2xl font-semibold text-green-600 mb-4">{answer}</div>
                                    <div className="text-sm text-gray-600 mb-6">この単語の理解度を選択してください</div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        <button
                                            onClick={() => handleAnswerResponse('again')}
                                            className="px-4 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-medium"
                                        >
                                            <i className="ri-restart-line text-lg" /> 再学習
                                        </button>
                                        <button
                                            onClick={() => handleAnswerResponse('hard')}
                                            className="px-4 py-3 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 text-sm font-medium"
                                        >
                                            <i className="ri-emotion-unhappy-line text-lg" /> 難しい
                                        </button>
                                        <button
                                            onClick={() => handleAnswerResponse('good')}
                                            className="px-4 py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm font-medium"
                                        >
                                            <i className="ri-thumb-up-line text-lg" /> ほどよい
                                        </button>
                                        <button
                                            onClick={() => handleAnswerResponse('easy')}
                                            className="px-4 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm font-medium"
                                        >
                                            <i className="ri-emotion-happy-line text-lg" /> 簡単
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="mb-8">
                                    <button
                                        onClick={() => setShowAnswer(true)}
                                        className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                    >
                                        答えを表示
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="text-center text-sm text-gray-500">
                            <div className="flex justify-center space-x-6">
                                <div>正解: {studySession.correctAnswers}</div>
                                <div>学習済み: {studySession.studiedWords.length}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}