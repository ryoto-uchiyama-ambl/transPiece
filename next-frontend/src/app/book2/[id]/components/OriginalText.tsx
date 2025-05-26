import React from 'react';

interface OriginalTextProps {
    content: string;
    clickedWord: string | null;
    onWordClick: (e: React.MouseEvent<HTMLSpanElement>, word: string) => void;
}

const OriginalText: React.FC<OriginalTextProps> = ({ content, clickedWord, onWordClick }) => {
    // 単語ごとに分割してクリック可能にする関数（元のrenderInteractiveText）
    const renderInteractiveText = (text: string) => {
        const words = text.split(/(\s+|[.,?!;:()[\]{}""''\-–—])/g).filter(Boolean);

        return words.map((word, index) => {
            if (/^\s+$|^[.,?!;:()[\]{}""''\-–—]$/.test(word)) {
                return <span key={index}>{word}</span>;
            }
            return (
                <span
                    key={index}
                    onClick={(e) => onWordClick(e, word)}
                    className={`cursor-pointer transition-colors duration-200 ${clickedWord === word ? 'bg-blue-200 text-blue-800' : 'hover:text-blue-600'
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
                <div className="flex space-x-2">
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">English</span>
                    <span className="text-xs font-medium text-blue-500 bg-blue-50 px-3 py-1 rounded-full">クリックで単語翻訳</span>
                </div>
            </div>
            <div className="border-t border-gray-100 pt-4 overflow-y-auto max-h-[600px] pr-2">
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {renderInteractiveText(content)}
                </p>
            </div>
        </div>
    );
};

export default OriginalText;
