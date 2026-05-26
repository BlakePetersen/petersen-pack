// ABOUTME: Wrapper-chain self-tagging — TST-07 introspection (D-17)
// ABOUTME: Each wrapper attaches __wrapperKind via Symbol.for; chain IS the contract

export type WrapperKind =
  | 'rateLimit'
  | 'csrf'
  | 'adminAuth'
  | 'clientAuth'
  | 'audit'
  | 'validation'
  | 'stripeSignature'
  | 'idempotency'

const symbolToKind = new Map<symbol, WrapperKind>([
  [Symbol.for('luna.withRateLimit'), 'rateLimit'],
  [Symbol.for('luna.withCsrf'), 'csrf'],
  [Symbol.for('luna.withAdminAuth'), 'adminAuth'],
  [Symbol.for('luna.withClientAuth'), 'clientAuth'],
  [Symbol.for('luna.withAudit'), 'audit'],
  [Symbol.for('luna.withValidation'), 'validation'],
  [Symbol.for('luna.withStripeSignature'), 'stripeSignature'],
  [Symbol.for('luna.withIdempotency'), 'idempotency'],
])

interface ChainNode {
  __wrapperKind?: unknown
  __wrappedHandler?: unknown
}

export function inspectWrapperChain(handler: unknown): Set<WrapperKind> {
  const kinds = new Set<WrapperKind>()
  let cursor: unknown = handler
  while (cursor && typeof cursor === 'function') {
    const node = cursor as unknown as ChainNode
    const sym = node.__wrapperKind
    if (typeof sym === 'symbol') {
      const kind = symbolToKind.get(sym)
      if (kind) kinds.add(kind)
    }
    cursor = node.__wrappedHandler
  }
  return kinds
}
