import { render, screen, waitFor } from '@testing-library/react';
import BookTranslationPreview from './page';
import api from '../../../../lib/api';
import '@testing-library/jest-dom';

// APIをモック
jest.mock('../../../../lib/api');

// useParamsをモック
jest.mock('next/navigation', () => ({
    useParams: () => ({ id: '1' }),
}));

describe('BookTranslationPreview', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // モックされたAPIの戻り値を設定
        (api.get as jest.Mock).mockImplementation((url: string) => {
            if (url === '/sanctum/csrf-cookie') {
                return Promise.resolve();
            }
            if (url === '/api/book/1') {
                return Promise.resolve({
                    data: {
                        pages: [
                            {
                                page_number: 1,
                                content: 'Thisisatestsentence',
                                translations: [
                                    {
                                        translatedText: 'これはテスト文です。',
                                        score: 80,
                                        AIfeedback: '良い翻訳です',
                                        AItext: 'これはAIの翻訳例です。',
                                    },
                                ],
                            },
                        ],
                    },
                });
            }
            return Promise.resolve({ data: {} });
        });

        (api.post as jest.Mock).mockResolvedValue({});
    });

    test('読み込み中 → コンテンツ表示', async () => {
        render(<BookTranslationPreview />);

        // 初期状態のローディング表示を確認
        expect(screen.getByText(/読み込み中/)).toBeInTheDocument();

        // コンテンツが表示されるまで待機
        await waitFor(() => {
            expect(screen.getByText('Thisisatestsentence')).toBeInTheDocument();
            expect(screen.getByDisplayValue('これはテスト文です。')).toBeInTheDocument();
        });
    });
});
