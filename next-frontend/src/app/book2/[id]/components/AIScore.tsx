interface AIScorePanelProps {
    score: number;
    feedback: string;
    AIText: string;
}

const formatAIText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/); // **text** を含むように分割

    return parts.map((part, index) => {
        const match = part.match(/^\*\*(.*?)\*\*$/); // **text** の形式かをチェック
        if (match) {
            return (
                <span key={index} className="text-red-500 font-bold">
                    {match[1]}
                </span>
            );
        }
        return <span key={index}>{part}</span>;
    });
};

const AIScorePanel = ({ score, feedback, AIText }: AIScorePanelProps) => {
    return (
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow min-h-[700px] max-h-[800px]">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-700">AI採点</h2>
                <span className="text-xs font-medium text-white bg-indigo-500 px-3 py-1 rounded-full">
                    スコア: {score}
                </span>
            </div>
            {/* <div className="border-t border-gray-100 pt-4">
                <p className="text-sm text-gray-700 font-medium mb-2">コメント:</p>
                <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    {feedback || 'AIからのコメントはまだありません。'}
                </p>
                <p className="text-sm text-gray-700 font-medium mb-2">翻訳例:</p>
                <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-200 whitespace-pre-wrap">
                    {formatAIText(AIText)}
                </p>
            </div> */}

            <div className="border-t border-gray-100 pt-4 overflow-y-auto max-h-[600px] pr-2">
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                    <p className="text-sm text-gray-700 font-medium mb-2">コメント:</p>
                    <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-200">
                        {feedback || 'AIからのコメントはまだありません。'}
                    </p>
                    <p className="text-sm text-gray-700 font-medium mb-2">翻訳例:</p>
                    <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-200 whitespace-pre-wrap">
                        {formatAIText(AIText)}
                    </p>
                </p>
            </div>

        </div>
    );
};

export default AIScorePanel;
