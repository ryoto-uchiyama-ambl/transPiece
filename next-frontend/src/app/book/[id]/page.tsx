'use client';

import { useEffect, useState, useRef } from 'react';
import api from '../../../../lib/api';
import { useParams } from 'next/navigation';
import axios from 'axios';
import BookHeader from './components/BookHeader';
import OriginalText from './components/OriginalText';
import UserTranslation from './components/UserTranslation';
//import WordPopup from './components/WordPopup';
import AIScore from './components/AIScore';
import PaginationControls from './components/PaginationControls';

interface Translation {
    translatedText: string;
    score: number;
    AIfeedback: string;
    AItext: string;
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
    const [spokenWord, setSpokenWord] = useState<string | null>(null);
    const [spokenWordIndex, setSpokenWordIndex] = useState<number | null>(null);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const params = useParams();
    const book_id = params.id;

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                await api.get('/sanctum/csrf-cookie');
                await api.post('/api/currentBook', { book_id });

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
            await api.get('/sanctum/csrf-cookie'); // Laravel Sanctum CSRF
            const response = await api.post('/api/translate-word', { word });
            const translation = response.data.translations[0]?.text || '翻訳結果がありません';

            if (translation !== '翻訳結果がありません') {
                const page = pages[currentPage - 1]
                await api.post('/api/saveWord', { word, translation, book_id, page_id: page.page_number });
            }

            // 少し遅延を入れてモックAPIのように見せる (実際の実装では削除)
            await new Promise(resolve => setTimeout(resolve, 100));

            setWordPopup({
                word,
                translation,
                position: { x, y },
                visible: true
            });
        } catch (err) {
            setWordPopup({
                word,
                translation: '翻訳に失敗しました',
                position: { x, y },
                visible: true
            });
        } finally {
            setTranslatingWord(false);
        }
    };

    const handleWordClick = (e: React.MouseEvent<HTMLSpanElement>, word: string) => {
        e.preventDefault();
        const rect = e.currentTarget.getBoundingClientRect();
        translateWord(word, rect.left, rect.top + window.scrollY);
    };

    // 読み上げ処理
    const handleSpeak = () => {
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            setSpokenWord(null);
            return;
        }
        const utterance = new window.SpeechSynthesisUtterance(currentData.content);
        utterance.lang = "en-US";
        utterance.onboundary = (event: any) => {
            if (event.name === 'word') {
                // 単語リストを取得
                const words = currentData.content.split(/(\s+|[.,?!;:()[\]{}""''\-–—])/g).filter(Boolean);
                // charIndexからインデックスを特定
                let acc = 0;
                for (let i = 0; i < words.length; i++) {
                    acc += words[i].length;
                    if (acc > event.charIndex) {
                        setSpokenWord(words[i]);
                        setSpokenWordIndex(i);
                        break;
                    }
                }
            }
        };
        utterance.onend = () => {
            setIsSpeaking(false);
            setSpokenWord(null);
            setSpokenWordIndex(null);
        };
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
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

    const changePage = async (direction: 'next' | 'prev') => {
        closePopup(); // ページ変更時にポップアップを閉じる

        // 現在の翻訳を保存
        await saveTranslation();

        // ページを変更
        if (direction === 'next' && currentPage < pages.length) {
            setCurrentPage(currentPage + 1);
        } else if (direction === 'prev' && currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const scoring = async () => {
        closePopup();

        const current = pages[currentPage - 1];
        const bookText = current.content;
        const translatedText = current?.translations[0]?.translatedText ?? '';

        if (!translatedText.trim()) {
            console.warn("翻訳が未入力です");
            return;
        }

        try {
            await api.get('/sanctum/csrf-cookie'); // Laravel Sanctum CSRF
            const response = await api.post('/api/grade-translation', {
                book_text: bookText,
                translated_text: translatedText,
            });

            const { score, feedback, AItext } = response.data;

            // 採点結果をstateに反映
            setPages(prev =>
                prev.map((page, idx) => {
                    if (idx === currentPage - 1) {
                        const updatedTranslations = [...page.translations];
                        if (updatedTranslations.length > 0) {
                            updatedTranslations[0] = {
                                ...updatedTranslations[0],
                                score,
                                AIfeedback: feedback,
                                AItext: AItext
                            };
                        }
                        return {
                            ...page,
                            translations: updatedTranslations,
                        };
                    }
                    return page;
                })
            );
            // 現在の翻訳を保存
            await saveTranslation();

        } catch (err) {
            console.error('単語の翻訳に失敗しました', err);
        } finally {
            setTranslatingWord(false);
        }
    }

    const avgScore = translation ? translation.score : 0;

    const saveTranslation = async () => {
        const current = pages[currentPage - 1];
        const translation = current.translations[0];

        if(!translation) return;
        
        try {
            await api.get('/sanctum/csrf-cookie');
            await api.post('/api/saveTranslation', {
                book_id,
                page_number: current.page_number,
                translated_text: translation.translatedText,
                score: translation.score,
                AIfeedback: translation.AIfeedback,
                AItext: translation.AItext,
            });
        } catch (err) {
            console.error('翻訳の保存に失敗しました', err);
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-8xl mx-auto pl-6">
                <BookHeader currentPage={currentPage} totalPages={pages.length} />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* 原文 */}
                    <OriginalText
                        content={currentData.content}
                        clickedWord={clickedWord}
                        spokenWord={spokenWord}
                        spokenWordIndex={spokenWordIndex}
                        onWordClick={handleWordClick}
                        onSpeakClick={handleSpeak}
                        isSpeaking={isSpeaking}
                    />

                    {/* ユーザー翻訳 */}
                    <UserTranslation
                        translatedText={translation?.translatedText ?? ''}
                        onChange={(newText) => {
                            setPages((prevPages) =>
                                prevPages.map((page, idx) => {
                                    if (idx === currentPage - 1) {
                                        const updatedTranslations = [...page.translations];
                                        if (updatedTranslations.length > 0) {
                                            updatedTranslations[0] = {
                                                ...updatedTranslations[0],
                                                translatedText: newText,
                                            };
                                        } else {
                                            updatedTranslations.push({
                                                translatedText: newText,
                                                score: 0,
                                                AIfeedback: '',
                                                AItext: '',
                                            });
                                        }
                                        return {
                                            ...page,
                                            translations: updatedTranslations,
                                        };
                                    }
                                    return page;
                                })
                            );
                        }}
                    />


                    {/* AI採点 */}
                    <AIScore score={avgScore} feedback={translation?.AIfeedback ?? ''} AIText={translation?.AItext ?? ''} />
                </div>

                {/* ページネーション */}
                <PaginationControls
                    currentPage={currentPage}
                    totalPages={pages.length}
                    onPrev={() => changePage('prev')}
                    onNext={() => changePage('next')}
                    onGrade={() => scoring()}
                />
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