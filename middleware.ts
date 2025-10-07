import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// Protect all routes by default except home and a few public pages
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Public routes
  const publicPaths = ['/', '/login', '/reset-password', '/logout']
  if (publicPaths.includes(pathname)) return NextResponse.next()

  // Skip static assets and files (served from /public)
  if (
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico' ||
    /\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|json|webmanifest)$/i.test(pathname)
  ) {
    return NextResponse.next()
  }

  // Simple session presence check via Supabase cookies set by @supabase/ssr
  const hasSbCookie =
    req.cookies.has('sb-access-token') ||
    req.cookies.has('sb-refresh-token') ||
    req.cookies.getAll().some((c) => c.name.startsWith('sb-'))

  if (!hasSbCookie) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    const res = NextResponse.redirect(url)
    try { res.cookies.set('flash', 'denied', { path: '/' }) } catch {}
    return res
  }

  return NextResponse.next()
}

// Exclude Next.js internals and static assets and API routes
export const config = {
  matcher: [
    // Run on all routes except Next internals and API; filtering of files is handled in code above
    '/((?!api|_next/static|_next/image).*)',
  ],
}
