// ABOUTME: Audit chain marker (SEC-02) — validates action format, tags chain for TST-07
// ABOUTME: Does NOT write to AuditLog — handlers write inside their own $transaction (D-10)

import type { NextRequest } from 'next/server'
import type { RequestContext } from '@/lib/request-context'

export const WRAPPER_KIND_AUDIT = Symbol.for('luna.withAudit')

type Handler = (req: NextRequest, ctx: RequestContext) => Promise<Response>

// Phase 1 D-09: dotted resource.verb format (e.g. 'booking.convert_inquiry')
const ACTION_RE = /^[a-z_]+\.[a-z_]+$/

export function withAudit(action: string, handler: Handler): Handler {
  if (!ACTION_RE.test(action)) {
    throw new Error(
      `withAudit: invalid action "${action}". Expected dotted resource.verb (lowercase + underscores), e.g. "booking.convert_inquiry"`
    )
  }
  const wrapped: Handler = async (req, ctx) => handler(req, ctx)
  ;(wrapped as unknown as { __wrapperKind: symbol }).__wrapperKind =
    WRAPPER_KIND_AUDIT
  ;(wrapped as unknown as { __wrappedHandler: Handler }).__wrappedHandler =
    handler
  ;(wrapped as unknown as { __auditAction: string }).__auditAction = action
  return wrapped
}
