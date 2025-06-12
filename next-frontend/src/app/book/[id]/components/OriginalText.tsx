import React, { useRef, useEffect } from 'react';

interface OriginalTextProps {
    content: string;
    clickedWord: string | null;
    spokenWord?: string | null;
    spokenWordIndex?: number | null;
    onWordClick: (e: React.MouseEvent<HTMLSpanElement>, word: string) => void;
    onSpeakClick?: () => void;
    isSpeaking?: boolean;
}

const OriginalText: React.FC<OriginalTextProps> = ({
    content,
    clickedWord,
    spokenWord,
    spokenWordIndex,
    onWordClick,
    onSpeakClick,
    isSpeaking
}) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);

    useEffect(() => {
        if (
            spokenWordIndex !== null &&
            spokenWordIndex !== undefined &&
            wordRefs.current[spokenWordIndex] &&
            scrollRef.current
        ) {
            const wordEl = wordRefs.current[spokenWordIndex];
            const scrollEl = scrollRef.current;
            const wordRect = wordEl!.getBoundingClientRect();
            const scrollRect = scrollEl.getBoundingClientRect();

            // 単語が表示領域の外ならスクロール
            if (wordRect.bottom > scrollRect.bottom || wordRect.top < scrollRect.top) {
                wordEl!.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        }
    }, [spokenWordIndex]);

    const renderInteractiveText = (text: string) => {
        const words = text.split(/(\s+|[.,?!;:()[\]{}""''\-–—])/g).filter(Boolean);

        return words.map((word, index) => {
            // spokenWordがある場合はspokenWordのみ緑でハイライト
            const isSpoken = spokenWord === word && spokenWordIndex === index;
            const isClicked = clickedWord === word && !spokenWord;
            return /^\s+$|^[.,?!;:()[\]{}""''\-–—]$/.test(word) ? (
                <span key={index}>{word}</span>
            ) : (
                <span
                    key={index}
                    onClick={(e) => onWordClick(e, word)}
                    ref={el => { wordRefs.current[index] = el; }}
                    className={`cursor-pointer transition-colors duration-200 ${isSpoken
                        ? 'bg-green-200 text-green-900'
                        : isClicked
                            ? 'bg-yellow-200 text-yellow-900'
                            : 'hover:text-blue-600'
                        }`}
                >
                    {word}
                </span>
            );
        });
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow min-h-[700px]">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-700">原文</h2>
                <div className="flex space-x-2 items-center">
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">English</span>
                    <span className="text-xs font-medium text-blue-500 bg-blue-50 px-3 py-1 rounded-full">クリックで単語翻訳</span>
                    <button
                        onClick={onSpeakClick}
                        className="text-xs font-medium text-green-500 bg-green-50 px-3 py-1 rounded-full hover:bg-green-500 hover:text-white"
                    >
                        {isSpeaking ? '停止' : '読み上げ'}
                    </button>
                </div>
            </div>
            <div ref={scrollRef} className="border-t border-gray-100 pt-4 overflow-y-auto max-h-[600px] pr-2">
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {renderInteractiveText(content)}
                </p>
            </div>
        </div>
    );
};

export default OriginalText;