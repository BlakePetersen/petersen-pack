// ABOUTME: AsyncLocalStorage request context — ULID requestId, actor, tenant slot
// ABOUTME: Exposes getRequestContext() readers and withRequestContext() HOF seed point

import { AsyncLocalStorage } from 'node:async_hooks'
import { monotonicFactory } from 'ulidx'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'

export interface RequestContext {
  requestId: string
  correlationId: string | null
  actorId: string | null
  actorRole: 'ADMIN' | 'CLIENT' | null
  actorEmail: string | null
  ip: string
  ua: string
  path: string
  method: string
  startedAt: number
  tenant: 'ashley'
}

export const als = new AsyncLocalStorage<RequestContext>()

export function getRequestContext(): RequestContext | undefined {
  return als.getStore()
}

// Per-process monotonic; cluster-wide uniqueness comes from the ULID random
// suffix, not from ordering. Across Node lambda pools or multiple workers,
// IDs sharing a millisecond prefix may interleave — monotonicity is a hint,
// not a cluster-wide guarantee.
const monotonicUlid = monotonicFactory()

export function newRequestId(): string {
  return monotonicUlid()
}

function getClientIp(req: NextRequest | Request): string {
  // Only trust x-forwarded-for when we know a trusted proxy set it.
  // Vercel rewrites the header at the edge; elsewhere (direct expose,
  // untrusted proxy) clients can spoof it. Since AuditLog persists IP
  // for compliance, spoofing is a real hazard.
  const onVercel = !!process.env.VERCEL
  if (onVercel) {
    const forwarded = req.headers.get('x-forwarded-for')
    if (forwarded) return forwarded.split(',')[0].trim()
  }
  return req.headers.get('x-real-ip') ?? 'unknown'
}

async function buildContextFromRequest(
  req: NextRequest | Request
): Promise<RequestContext> {
  const session = await auth().catch((err: unknown) => {
    // Unexpected auth failure (DB down, JWT crash) — request proceeds as
    // anonymous. Emit via the edge shim to avoid an import cycle with
    // `./logger`, which depends on `getRequestContext`.
    void import('./logger.edge').then(({ logger }) => {
      logger.warn({ err }, 'request-context.auth_failed')
    })
    return null
  })
  const user = session?.user as
    | { id?: string; role?: 'ADMIN' | 'CLIENT'; email?: string }
    | undefined
  const headers = req.headers
  return {
    requestId: newRequestId(),
    correlationId:
      headers.get('x-vercel-id') ?? headers.get('x-request-id') ?? null,
    actorId: user?.id ?? null,
    actorRole: user?.role ?? null,
    actorEmail: user?.email ?? null,
    ip: getClientIp(req),
    ua: headers.get('user-agent') ?? 'unknown',
    path: new URL(req.url).pathname,
    method: req.method,
    startedAt: Date.now(),
    tenant: 'ashley',
  }
}

// Routes consumed by Next.js use the (req, { params }?) shape; the inner
// chain handler uses (req, ctx). withRequestContext bridges them by seeding
// the ALS, calling the inner handler with `(req, ctx)`, and returning a
// function whose external signature is Next's route shape.
type RouteHandler = (req: NextRequest, context?: unknown) => Promise<Response>

export function withRequestContext(
  handler: (req: NextRequest, ctx: RequestContext) => Promise<Response>
): RouteHandler {
  return async (req: NextRequest): Promise<Response> => {
    const ctx = await buildContextFromRequest(req)
    return als.run(ctx, () => handler(req, ctx))
  }
}
