// ABOUTME: Unit tests for inspectWrapperChain — walks __wrappedHandler back-pointers
// ABOUTME: Verifies TST-07 introspection semantics across synthetic chains (D-17)

import { describe, it, expect } from 'vitest'
import { inspectWrapperChain } from './chain-introspection'

type Fn = (...args: unknown[]) => unknown

function tag(fn: Fn, kind: string, inner?: Fn): Fn {
  ;(fn as unknown as { __wrapperKind: symbol }).__wrapperKind = Symbol.for(kind)
  if (inner) {
    ;(fn as unknown as { __wrappedHandler: Fn }).__wrappedHandler = inner
  }
  return fn
}

describe('inspectWrapperChain', () => {
  it('returns empty set for an undecorated handler', () => {
    const handler = async () => new Response()
    expect(inspectWrapperChain(handler)).toEqual(new Set())
  })

  it('walks a 2-deep chain and collects kinds', () => {
    const inner = async () => new Response()
    const middle = tag(async () => new Response(), 'luna.withAdminAuth', inner)
    const outer = tag(async () => new Response(), 'luna.withCsrf', middle)
    const kinds = inspectWrapperChain(outer)
    expect(kinds).toEqual(new Set(['csrf', 'adminAuth']))
  })

  it('walks a 4-deep chain', () => {
    const inner = async () => new Response()
    const a = tag(async () => new Response(), 'luna.withClientAuth', inner)
    const b = tag(async () => new Response(), 'luna.withAdminAuth', a)
    const c = tag(async () => new Response(), 'luna.withCsrf', b)
    const d = tag(async () => new Response(), 'luna.withRateLimit', c)
    expect(inspectWrapperChain(d)).toEqual(
      new Set(['rateLimit', 'csrf', 'adminAuth', 'clientAuth'])
    )
  })

  it('stops walking when __wrappedHandler is missing', () => {
    const fn = tag(async () => new Response(), 'luna.withCsrf')
    expect(inspectWrapperChain(fn)).toEqual(new Set(['csrf']))
  })

  it('ignores unknown symbol kinds without throwing', () => {
    const fn = tag(async () => new Response(), 'luna.withMystery')
    expect(inspectWrapperChain(fn)).toEqual(new Set())
  })

  it('returns empty set when given non-function', () => {
    expect(inspectWrapperChain(null)).toEqual(new Set())
    expect(inspectWrapperChain(undefined)).toEqual(new Set())
    expect(inspectWrapperChain(42)).toEqual(new Set())
  })

  it('stops walking when __wrappedHandler is non-function', () => {
    const fn = tag(async () => new Response(), 'luna.withCsrf')
    ;(fn as unknown as { __wrappedHandler: unknown }).__wrappedHandler = 'oops'
    expect(inspectWrapperChain(fn)).toEqual(new Set(['csrf']))
  })
})
