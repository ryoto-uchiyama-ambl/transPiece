interface PaginationControlsProps {
    currentPage: number;
    totalPages: number;
    onPrev: () => void;
    onNext: () => void;
    onGrade: () => void;
}

const PaginationControls = ({ currentPage, totalPages, onPrev, onNext, onGrade }: PaginationControlsProps) => {
    return (
        <div className="flex justify-center mt-10">
            <div className="inline-flex rounded-md shadow-sm">
                <button
                    onClick={onPrev}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center rounded-l-md px-4 py-2 text-sm font-medium ${
                        currentPage === 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
                    } border border-gray-300`}
                >
                    <svg className="h-5 w-5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="19" y1="12" x2="5" y2="12" />
                        <polyline points="12 19 5 12 12 5" />
                    </svg>
                    前へ
                </button>
                <button
                    onClick={onGrade}
                    className="relative inline-flex items-center px-4 py-2 text-sm font-medium bg-blue-200 text-gray-700 border border-gray-300 hover:bg-blue-300 hover:text-white"
                >
                    採点
                </button>
                <button
                    onClick={onNext}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center rounded-r-md px-4 py-2 text-sm font-medium ${
                        currentPage === totalPages
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
                    } border border-gray-300`}
                >
                    次へ
                    <svg className="h-5 w-5 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default PaginationControls;
