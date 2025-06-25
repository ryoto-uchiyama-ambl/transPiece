'use client';

import dynamic from 'next/dynamic';

const BookDetailPageClient = dynamic(() => import('./BookDetailPageClient'), { ssr: false });

export default function Page() {
    return <BookDetailPageClient />;
}