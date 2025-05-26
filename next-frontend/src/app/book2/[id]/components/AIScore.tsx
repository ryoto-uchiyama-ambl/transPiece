interface AIScorePanelProps {
    score: number;
    feedback: string;
}

const AIScorePanel = ({ score, feedback }: AIScorePanelProps) => {
    return (
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow min-h-[700px]">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-700">AI採点</h2>
                <span className="text-xs font-medium text-white bg-indigo-500 px-3 py-1 rounded-full">
                    スコア: {score}
                </span>
            </div>
            <div className="border-t border-gray-100 pt-4">
                <p className="text-sm text-gray-700 font-medium mb-2">コメント:</p>
                <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    {feedback || 'AIからのコメントはまだありません。'}
                </p>
            </div>
        </div>
    );
};

export default AIScorePanel;
