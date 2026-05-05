// ABOUTME: CSRF guard (SEC-03) — origin-header check vs env.NEXT_PUBLIC_APP_URL
// ABOUTME: Self-tags via __wrapperKind; webhook + NextAuth chains OMIT this (D-04)

import type { NextRequest } from 'next/server'
import type { RequestContext } from '@/lib/request-context'
import { env } from '@/lib/env'
import { logger } from '@/lib/logger'

export const WRAPPER_KIND_CSRF = Symbol.for('luna.withCsrf')

type Handler = (req: NextRequest, ctx: RequestContext) => Promise<Response>

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

export function withCsrf(handler: Handler): Handler {
  const expectedOrigin = new URL(env.NEXT_PUBLIC_APP_URL).origin
  const wrapped: Handler = async (req, ctx) => {
    if (SAFE_METHODS.has(req.method)) {
      return handler(req, ctx)
    }
    const origin = req.headers.get('origin')
    if (origin !== expectedOrigin) {
      logger.warn(
        { origin, expected: expectedOrigin, path: ctx.path },
        'csrf.origin_mismatch'
      )
      return new Response(
        JSON.stringify({ error: 'csrf_origin_mismatch', code: 'FORBIDDEN' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    }
    return handler(req, ctx)
  }
  ;(wrapped as unknown as { __wrapperKind: symbol }).__wrapperKind =
    WRAPPER_KIND_CSRF
  ;(wrapped as unknown as { __wrappedHandler: Handler }).__wrappedHandler =
    handler
  return wrapped
}
