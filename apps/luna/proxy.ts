// ABOUTME: Proxy (Node runtime) — narrowed to session-presence gate on protected routes
// ABOUTME: Role enforcement lives in route-layer wrappers (Phase 2 withAdminAuth); no ALS here

import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')
  const isClientRoute = req.nextUrl.pathname.startsWith(
    '/client-portal/dashboard'
  )
  // SEC-06: preview routes must NEVER cache — revocation has to take effect
  // within a single request (CDN + browser combined). The downstream RSC page
  // re-queries PreviewToken on every render via getPreviewToken (which filters
  // out revoked rows), but if a CDN serves a cached copy revocation is bypassed.
  const isPreviewRoute = req.nextUrl.pathname.startsWith('/preview')

  if (isAdminRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (isClientRoute && !isLoggedIn) {
    return NextResponse.redirect(
      new URL('/login?callbackUrl=/client-portal/dashboard', req.url)
    )
  }

  // Forward pathname so seedPageRequestContext can populate ctx.path for
  // RSC renders. Mutating the request headers (via NextResponse.next's
  // request option) makes the value visible to downstream server
  // components via next/headers. Redirects don't carry this header,
  // which is fine — seeded path only matters for successful renders.
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-pathname', req.nextUrl.pathname)
  const response = NextResponse.next({ request: { headers: requestHeaders } })

  if (isPreviewRoute) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
  }

  return response
})

// API routes are EXCLUDED from this matcher — role enforcement for /api/**
// lives in route-layer withAdminAuth wrappers (Phase 2 SEC-01). The proxy
// only gates PAGE routes for session presence. Don't assume /api/admin/* is
// protected by this file.
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
