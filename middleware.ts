
import { type NextRequest } from 'next/server'
import { updateSession } from './lib/supabase/middleware'

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. PWA Asset Bypass
    if (
        pathname.startsWith('/manifest') ||
        pathname.startsWith('/icon-') ||
        pathname === '/sw.js' ||
        pathname.startsWith('/workbox-') ||
        pathname === '/logo-transparent.png'
    ) {
        return; // Early return to let Next.js handle it naturally without Supabase interference
    }

    return await updateSession(request)
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - icon-*.png (PWA icons)
         * - manifest.ts, manifest.json, manifest.webmanifest (PWA manifests)
         * - sw.js, workbox-*.js (Service workers)
         * - logo-transparent.png (Brand Logo)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|icon-.*\\.png|manifest\\.(?:ts|json|webmanifest)|sw\\.js|workbox-.*\\.js|logo-transparent\\.png).*)',
    ],
}
