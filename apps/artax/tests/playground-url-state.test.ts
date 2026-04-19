/** @jest-environment jsdom */
// ABOUTME: Tests for playground URL-state encode/decode/push helpers.
// ABOUTME: Validates round-tripping, namespaced ?p[*]= filtering, and shallow pushState behavior.

import {
  encodePlaygroundParams,
  decodePlaygroundParams,
  pushPlaygroundParams,
} from '@/lib/playground-url-state'

describe('playground-url-state', () => {
  describe('encodePlaygroundParams', () => {
    it('returns empty string for an empty object', () => {
      expect(encodePlaygroundParams({})).toBe('')
    })

    it('encodes keys under the p[*] namespace (decode verifies shape)', () => {
      const encoded = encodePlaygroundParams({ variant: 'outline', size: 'sm' })
      // Don't assert on exact URL-encoding of brackets — URLSearchParams may encode
      // `[` as `%5B`. Assert by round-tripping back through URLSearchParams.
      const params = new URLSearchParams(encoded)
      expect(decodePlaygroundParams(params)).toEqual({
        variant: 'outline',
        size: 'sm',
      })
    })
  })

  describe('decodePlaygroundParams', () => {
    it('extracts p[key]=value pairs into a plain object', () => {
      const params = new URLSearchParams('p[variant]=outline')
      expect(decodePlaygroundParams(params)).toEqual({ variant: 'outline' })
    })

    it('ignores params not namespaced under p[*]', () => {
      const params = new URLSearchParams('foo=bar&p[size]=sm&baz=qux')
      expect(decodePlaygroundParams(params)).toEqual({ size: 'sm' })
    })

    it('returns an empty object when no p[*] params are present', () => {
      const params = new URLSearchParams('foo=bar&baz=qux')
      expect(decodePlaygroundParams(params)).toEqual({})
    })

    it('handles multiple p[*] params in one query string', () => {
      const params = new URLSearchParams('p[variant]=outline&p[size]=sm&p[disabled]=true')
      expect(decodePlaygroundParams(params)).toEqual({
        variant: 'outline',
        size: 'sm',
        disabled: 'true',
      })
    })
  })

  describe('round-trip: decode(new URLSearchParams(encode(x))) === x', () => {
    const cases: Array<Record<string, string>> = [
      {},
      { variant: 'outline' },
      { variant: 'outline', size: 'sm', disabled: 'true' },
    ]

    it.each(cases)('round-trips %p', (input) => {
      const encoded = encodePlaygroundParams(input)
      const roundTripped = decodePlaygroundParams(new URLSearchParams(encoded))
      expect(roundTripped).toEqual(input)
    })
  })

  describe('pushPlaygroundParams', () => {
    let pushStateSpy: jest.SpyInstance

    beforeEach(() => {
      pushStateSpy = jest.spyOn(window.history, 'pushState').mockImplementation(() => {})
    })

    afterEach(() => {
      pushStateSpy.mockRestore()
    })

    it('invokes window.history.pushState exactly once', () => {
      pushPlaygroundParams({ variant: 'outline' })
      expect(pushStateSpy).toHaveBeenCalledTimes(1)
    })

    it('pushes a URL containing the encoded p[*] params', () => {
      pushPlaygroundParams({ variant: 'outline' })
      const urlArg = pushStateSpy.mock.calls[0][2] as string
      // URLSearchParams may encode brackets as %5B / %5D — accept either.
      expect(urlArg).toMatch(/p(\[|%5B)variant(\]|%5D)=outline/)
    })

    it('does not trigger a real navigation in jsdom', () => {
      const before = window.location.href
      pushPlaygroundParams({ variant: 'outline' })
      // pushState is stubbed so window.location.href is unchanged.
      expect(window.location.href).toBe(before)
    })
  })
})
