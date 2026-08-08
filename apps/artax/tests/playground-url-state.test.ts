/** @jest-environment jsdom */
// ABOUTME: Tests for playground URL-state encode/decode/push helpers.
// ABOUTME: Validates round-tripping, namespaced ?p[*]= filtering, and shallow pushState behavior.

import {
  encodePlaygroundParams,
  decodePlaygroundParams,
  pushPlaygroundParams
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
        size: 'sm'
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
      const params = new URLSearchParams(
        'p[variant]=outline&p[size]=sm&p[disabled]=true'
      )
      expect(decodePlaygroundParams(params)).toEqual({
        variant: 'outline',
        size: 'sm',
        disabled: 'true'
      })
    })
  })

  describe('round-trip: decode(new URLSearchParams(encode(x))) === x', () => {
    const cases: Array<Record<string, string>> = [
      {},
      { variant: 'outline' },
      { variant: 'outline', size: 'sm', disabled: 'true' }
    ]

    it.each(cases)('round-trips %p', input => {
      const encoded = encodePlaygroundParams(input)
      const roundTripped = decodePlaygroundParams(new URLSearchParams(encoded))
      expect(roundTripped).toEqual(input)
    })
  })

  describe('pushPlaygroundParams', () => {
    let pushStateSpy: jest.SpyInstance
    const originalHref = window.location.href

    beforeEach(() => {
      // Don't spy yet — we use the real pushState below in stubLocation to
      // move jsdom to the desired URL, then spy so the SUT's pushState call
      // is the only one captured.
    })

    afterEach(() => {
      if (pushStateSpy) pushStateSpy.mockRestore()
      // Reset jsdom URL to the original so tests stay isolated.
      window.history.pushState(null, '', originalHref)
    })

    /**
     * Move jsdom to the given pathname/search/hash via the real pushState,
     * then install the spy. After this returns, exactly one subsequent
     * pushState call (the one under test) is captured in pushStateSpy.
     */
    function stubLocation(parts: {
      pathname?: string
      search?: string
      hash?: string
    }) {
      const pathname = parts.pathname ?? '/'
      const search = parts.search ?? ''
      const hash = parts.hash ?? ''
      window.history.pushState(null, '', `${pathname}${search}${hash}`)
      pushStateSpy = jest
        .spyOn(window.history, 'pushState')
        .mockImplementation(() => {})
    }

    /** Used by the three pre-existing tests that don't need a stubbed URL. */
    function spyOnly() {
      pushStateSpy = jest
        .spyOn(window.history, 'pushState')
        .mockImplementation(() => {})
    }

    it('invokes window.history.pushState exactly once', () => {
      spyOnly()
      pushPlaygroundParams({ variant: 'outline' })
      expect(pushStateSpy).toHaveBeenCalledTimes(1)
    })

    it('pushes a URL containing the encoded p[*] params', () => {
      spyOnly()
      pushPlaygroundParams({ variant: 'outline' })
      const urlArg = pushStateSpy.mock.calls[0][2] as string
      // URLSearchParams may encode brackets as %5B / %5D — accept either.
      expect(urlArg).toMatch(/p(\[|%5B)variant(\]|%5D)=outline/)
    })

    it('does not trigger a real navigation in jsdom', () => {
      spyOnly()
      const before = window.location.href
      pushPlaygroundParams({ variant: 'outline' })
      // pushState is stubbed so window.location.href is unchanged.
      expect(window.location.href).toBe(before)
    })

    it('preserves non-playground query params', () => {
      stubLocation({
        pathname: '/components/button',
        search: '?utm=test&ref=email'
      })
      pushPlaygroundParams({ variant: 'outline' })
      const urlArg = pushStateSpy.mock.calls[0][2] as string
      expect(urlArg).toMatch(/utm=test/)
      expect(urlArg).toMatch(/ref=email/)
      expect(urlArg).toMatch(/p(\[|%5B)variant(\]|%5D)=outline/)
    })

    it('preserves window.location.hash verbatim', () => {
      stubLocation({
        pathname: '/components/button',
        search: '',
        hash: '#examples'
      })
      pushPlaygroundParams({ variant: 'outline' })
      const urlArg = pushStateSpy.mock.calls[0][2] as string
      expect(urlArg).toMatch(/#examples$/)
    })

    it('drops stale p[*] keys before overlaying new payload', () => {
      stubLocation({
        pathname: '/components/button',
        search: '?p[variant]=ghost&p[size]=lg&utm=test'
      })
      pushPlaygroundParams({ variant: 'outline' })
      const urlArg = pushStateSpy.mock.calls[0][2] as string
      expect(urlArg).toMatch(/p(\[|%5B)variant(\]|%5D)=outline/)
      expect(urlArg).toMatch(/utm=test/)
      expect(urlArg).not.toMatch(/p(\[|%5B)size(\]|%5D)=lg/)
    })

    it('keeps non-playground params and hash when props is empty', () => {
      stubLocation({
        pathname: '/components/button',
        search: '?utm=test',
        hash: '#anchor'
      })
      pushPlaygroundParams({})
      const urlArg = pushStateSpy.mock.calls[0][2] as string
      expect(urlArg).toMatch(/utm=test/)
      expect(urlArg).toMatch(/#anchor$/)
      expect(urlArg).not.toMatch(/p(\[|%5B)/)
    })
  })
})
