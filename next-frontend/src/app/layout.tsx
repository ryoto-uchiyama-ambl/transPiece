import './globals.css';
import type { Metadata } from 'next';
import { ReactNode } from 'react';
import Sidebar from '@/components/Sidebar'; // ← クライアントコンポーネントを読み込む

export const metadata: Metadata = {
  title: 'Your App',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body className="flex">
        <Sidebar />
        <main className="flex-1 bg-gray-50 p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
