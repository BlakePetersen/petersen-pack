// ABOUTME: Zod-validated body wrapper (SEC-07 partial / TYP-05 long-tail in Phase 5)
// ABOUTME: Parses req.json() once; forwards typed body as third handler arg

import type { NextRequest } from 'next/server'
import type { RequestContext } from '@/lib/request-context'
import type { ZodType, z } from 'zod'

export const WRAPPER_KIND_VALIDATION = Symbol.for('luna.withValidation')

type Handler = (req: NextRequest, ctx: RequestContext) => Promise<Response>
type ValidatedHandler<S extends ZodType> = (
  req: NextRequest,
  ctx: RequestContext,
  body: z.infer<S>
) => Promise<Response>

export function withValidation<S extends ZodType>(
  schema: S,
  handler: ValidatedHandler<S>
): Handler {
  const wrapped: Handler = async (req, ctx) => {
    const raw = await req.json().catch(() => null)
    const parsed = schema.safeParse(raw)
    if (!parsed.success) {
      const details: Record<string, string[]> = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path.length > 0 ? issue.path.join('.') : '<root>'
        ;(details[key] ??= []).push(issue.message)
      }
      return new Response(
        JSON.stringify({
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }
    return handler(req, ctx, parsed.data)
  }
  ;(wrapped as unknown as { __wrapperKind: symbol }).__wrapperKind =
    WRAPPER_KIND_VALIDATION
  ;(
    wrapped as unknown as { __wrappedHandler: ValidatedHandler<S> }
  ).__wrappedHandler = handler
  return wrapped
}
