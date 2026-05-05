// ABOUTME: Authenticated-only gate (SEC-07) — reads ctx.actorId, any role passes
// ABOUTME: Per-resource ownership checks live in handlers (api-auth.ts::requireGalleryAccess)

import type { NextRequest } from 'next/server'
import type { RequestContext } from '@/lib/request-context'

export const WRAPPER_KIND_CLIENT_AUTH = Symbol.for('luna.withClientAuth')

type Handler = (req: NextRequest, ctx: RequestContext) => Promise<Response>

export function withClientAuth(handler: Handler): Handler {
  const wrapped: Handler = async (req, ctx) => {
    if (!ctx.actorId) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', code: 'UNAUTHORIZED' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }
    return handler(req, ctx)
  }
  ;(wrapped as unknown as { __wrapperKind: symbol }).__wrapperKind =
    WRAPPER_KIND_CLIENT_AUTH
  ;(wrapped as unknown as { __wrappedHandler: Handler }).__wrappedHandler =
    handler
  return wrapped
}
