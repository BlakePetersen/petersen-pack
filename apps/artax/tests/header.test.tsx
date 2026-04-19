/** @jest-environment jsdom */
// ABOUTME: Hydration regression test for Header.
// ABOUTME: Asserts no hydration warnings appear in console during render.

import { render } from '@testing-library/react'

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
})
