// ABOUTME: ADMIN role gate (SEC-07) — reads ctx.actorRole, NEVER re-calls auth() (D-02)
// ABOUTME: Self-tags via __wrapperKind; replaces inline session checks across 30+ routes

import type { NextRequest } from 'next/server'
import type { RequestContext } from '@/lib/request-context'

export const WRAPPER_KIND_ADMIN_AUTH = Symbol.for('luna.withAdminAuth')

type Handler = (req: NextRequest, ctx: RequestContext) => Promise<Response>

export function withAdminAuth(handler: Handler): Handler {
  const wrapped: Handler = async (req, ctx) => {
    if (!ctx.actorId) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', code: 'UNAUTHORIZED' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }
    if (ctx.actorRole !== 'ADMIN') {
      return new Response(
        JSON.stringify({ error: 'Forbidden', code: 'FORBIDDEN' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    }
    return handler(req, ctx)
  }
  ;(wrapped as unknown as { __wrapperKind: symbol }).__wrapperKind =
    WRAPPER_KIND_ADMIN_AUTH
  ;(wrapped as unknown as { __wrappedHandler: Handler }).__wrappedHandler =
    handler
  return wrapped
}
