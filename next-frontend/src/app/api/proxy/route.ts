// app/api/proxy/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const url = req.nextUrl.searchParams.get('url');

    if (!url) {
        return new NextResponse('Missing URL', { status: 400 });
    }

    try {
        const res = await fetch(url);
        const text = await res.text();

        return new NextResponse(text, {
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Cache-Control': 'public, max-age=3600',
            },
        });
    } catch (err) {
        return new NextResponse('Failed to fetch content', { status: 500 });
    }
}



