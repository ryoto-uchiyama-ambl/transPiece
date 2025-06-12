'use client';

import React from 'react';

interface UserTranslationProps {
    translatedText: string;
    onChange: (newText: string) => void;
}

export default function UserTranslation({ translatedText, onChange }: UserTranslationProps) {
    return (
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow min-h-[700px]">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-700">あなたの翻訳</h2>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">日本語</span>
            </div>
            <div className="border-t border-gray-100 pt-4">
                <textarea
                    value={translatedText}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full h-[600px] resize-none border border-gray-300 rounded-lg p-4 text-gray-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-300"
                    placeholder="ここに翻訳を書いてください…"
                />
            </div>
        </div>
    );
}
