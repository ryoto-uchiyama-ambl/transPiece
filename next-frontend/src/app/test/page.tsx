'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { logout } from '../api/logout';

export default function test() {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await logout();
            router.push('/'); // トップページへリダイレクト
        } catch (error) {
            console.error('ログアウトエラー:', error);
        }
    };
    return (
        <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
            ログアウト
        </button>
    );
}
