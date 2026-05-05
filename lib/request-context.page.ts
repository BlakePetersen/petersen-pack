// ABOUTME: Server Component ALS seed — wraps app/layout render in als.run()
// ABOUTME: Reuses the same `als` instance exported from lib/request-context.ts (shared storage)

import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { als, newRequestId, type RequestContext } from './request-context'

export async function seedPageRequestContext<T>(
  render: () => T | Promise<T>
): Promise<T> {
  const h = await headers()
  const session = await auth().catch((err: unknown) => {
    // Unexpected auth failure (DB down, JWT crash) — render proceeds as
    // anonymous. Edge shim avoids the `./logger` → `getRequestContext` cycle.
    void import('./logger.edge').then(({ logger }) => {
      logger.warn({ err }, 'request-context.page.auth_failed')
    })
    return null
  })
  const user = session?.user as
    | { id?: string; role?: 'ADMIN' | 'CLIENT'; email?: string }
    | undefined
  const ctx: RequestContext = {
    requestId: newRequestId(),
    correlationId: h.get('x-vercel-id') ?? h.get('x-request-id') ?? null,
    actorId: user?.id ?? null,
    actorRole: user?.role ?? null,
    actorEmail: user?.email ?? null,
    // Only trust x-forwarded-for on Vercel (edge rewrites it). Elsewhere
    // the header is client-controlled and must not be persisted to AuditLog.
    ip: process.env.VERCEL
      ? (h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown')
      : (h.get('x-real-ip') ?? 'unknown'),
    ua: h.get('user-agent') ?? 'unknown',
    path: h.get('x-pathname') ?? '',
    method: 'GET',
    startedAt: Date.now(),
    tenant: 'ashley',
  }
  return als.run(ctx, render)
}
