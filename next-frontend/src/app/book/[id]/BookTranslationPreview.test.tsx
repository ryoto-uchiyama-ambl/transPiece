import { render, screen, waitFor } from '@testing-library/react';
import BookTranslationPreview from './page';
import api from '../../../../lib/api';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { useServerInsertedHTML } from 'next/navigation';

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

    test('APIが正しく呼ばれることの確認', async () => {
        render(<BookTranslationPreview />);
        await waitFor(() => {
            expect(api.get).toHaveBeenCalledWith('/sanctum/csrf-cookie');
            expect(api.get).toHaveBeenCalledWith('/api/book/1');
        });
    });

    test('翻訳テキストの編集', async () => {
        render(<BookTranslationPreview />);
        await waitFor(() => {
            screen.getByDisplayValue('これはテスト文です。')
        });

        const textarea = screen.getByDisplayValue('これはテスト文です。');
        expect(textarea).toBeEnabled();

        await userEvent.clear(textarea);
        await userEvent.type(textarea, '編集した翻訳テキスト');

        expect(screen.getByDisplayValue('編集した翻訳テキスト')).toBeInTheDocument();
    });

    test('APIエラー時にエラーメッセージを表示', async () => {
        (api.get as jest.Mock).mockRejectedValueOnce(new Error('APIエラー'));
        render(<BookTranslationPreview />);

        await waitFor(() => {
            expect(screen.getByText(/ページデータがありません。/)).toBeInTheDocument();
        });
    });
});
