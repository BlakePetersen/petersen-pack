// ABOUTME: Dynamic params wrapper helper — TST-07 introspection support
// ABOUTME: Tags outer function with __wrappedHandler to enable chain walking

import { NextRequest } from 'next/server'

interface ChainNode {
  __wrapperKind?: unknown
  __wrappedHandler?: unknown
}

function withDynamicParams<P>(
  handler: (req: NextRequest, ctx: unknown, params: P) => Promise<unknown>
): (req: NextRequest, args: { params: Promise<P> }) => Promise<unknown> {
  const outer = async (
    req: NextRequest,
    args: { params: Promise<P> }
  ): Promise<unknown> => {
    const params = await args.params
    return (handler as any)(req, undefined, params)
  }
  ;(outer as ChainNode).__wrappedHandler = handler
  return outer
}
