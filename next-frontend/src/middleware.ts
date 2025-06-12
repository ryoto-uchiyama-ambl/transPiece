// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('laravel_session'); // Laravel Sanctum 用のトークンなど

    const pathname = request.nextUrl.pathname;

    // 除外パス
    const isPublic =
        pathname === '/' ||
        pathname.startsWith('/login') ||
        pathname.startsWith('/register') ||
        pathname.startsWith('/_next') ||  // Next.js の内部リソース
        pathname.startsWith('/favicon') ||
        pathname.startsWith('/api');      // API ルートは通常除外

    // 未ログイン & 保護ルートならリダイレクト
    if (!isPublic && !token) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/:path*'], // すべてのパスにマッチ
};
