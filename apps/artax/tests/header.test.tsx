/** @jest-environment jsdom */
// ABOUTME: Hydration regression test for Header.
// ABOUTME: Asserts no hydration warnings and verifies SSR-output contract.

import { render } from '@testing-library/react'
import { renderToString } from 'react-dom/server'

import { Header } from '@/components/header'

describe('Header', () => {
  let errorSpy: jest.SpyInstance
  beforeEach(() => {
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => {
    errorSpy.mockRestore()
  })

  it('renders without hydration warnings', () => {
    render(<Header />)
    const hydrationWarnings = errorSpy.mock.calls.filter((args) => {
      const msg = String(args[0] ?? '')
      return /hydrat|did not match|Text content/i.test(msg)
    })
    expect(hydrationWarnings).toEqual([])
  })

  it('renders the wordmark and the mobile nav trigger', () => {
    const { getByText, getByLabelText } = render(<Header />)
    expect(getByText('Artax UI')).toBeInTheDocument()
    expect(getByLabelText('Open navigation')).toBeInTheDocument()
  })

  // The 24.1-03 fix gates the Radix Dialog subtree inside SidebarDrawer on
  // a mounted flag. Under SSR the component returns the plain <button>
  // children, so aria-controls (which Radix derives from its internal
  // useId) must NOT appear in the server-rendered HTML. The client's
  // post-mount render wires up aria-controls with a stable client ID,
  // eliminating the SSR/CSR divergence that fired the hydration warning.
  it('SSR output carries accessible trigger without Radix-managed aria-controls', () => {
    const ssrHtml = renderToString(<Header />)

    // Accessible trigger must survive to SSR so layout + a11y stay stable.
    expect(ssrHtml).toContain('aria-label="Open navigation"')

    // Radix Dialog trigger adds aria-controls="radix-..." keyed off useId.
    // The mounted-flag gate in SidebarDrawer omits that attribute on SSR.
    expect(ssrHtml).not.toMatch(/aria-controls="radix-/)
  })
})
