import { useEffect, useRef } from 'react';

interface WordPopupProps {
    word: string;
    translation: string;
    position: { x: number; y: number };
    onClose: () => void;
}

const WordPopup = ({ word, translation, position, onClose }: WordPopupProps) => {
    const popupRef = useRef<HTMLDivElement>(null);

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
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700">×</button>
            </div>
            <div className="text-gray-600">{translation}</div>
        </div>
    );
};

export default WordPopup;
