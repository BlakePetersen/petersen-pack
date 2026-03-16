// ABOUTME: Tests for the ThemeProvider component and useTheme hook.
// ABOUTME: Validates theme switching, system preference detection, and data-theme attribute management.
import { render, screen, act } from '@testing-library/react'
import { ThemeProvider, useTheme } from '../src/providers/theme-provider'
import type { Theme } from '../src/providers/theme-provider'

// Mock matchMedia
function createMatchMedia(matches: boolean) {
  const listeners: Array<(e: MediaQueryListEvent) => void> = []
  const mql = {
    matches,
    media: '(prefers-color-scheme: dark)',
    addEventListener: (_event: string, listener: (e: MediaQueryListEvent) => void) => {
      listeners.push(listener)
    },
    removeEventListener: (_event: string, listener: (e: MediaQueryListEvent) => void) => {
      const idx = listeners.indexOf(listener)
      if (idx >= 0) listeners.splice(idx, 1)
    },
    dispatchChange: (newMatches: boolean) => {
      listeners.forEach(l => l({ matches: newMatches } as MediaQueryListEvent))
    },
  }
  window.matchMedia = jest.fn().mockReturnValue(mql)
  return mql
}

// Component that exposes useTheme values for testing
function ThemeConsumer({ onTheme }: { onTheme: (val: { theme: Theme; resolvedTheme: 'light' | 'dark'; setTheme: (t: Theme) => void }) => void }) {
  const value = useTheme()
  onTheme(value)
  return <div data-testid="consumer">theme: {value.theme}, resolved: {value.resolvedTheme}</div>
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme')
    createMatchMedia(true) // default: system prefers dark
  })

  it('renders children', () => {
    render(
      <ThemeProvider>
        <div data-testid="child">Hello</div>
      </ThemeProvider>
    )
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('defaults to system theme', () => {
    let captured: { theme: Theme; resolvedTheme: 'light' | 'dark' } | null = null
    render(
      <ThemeProvider>
        <ThemeConsumer onTheme={(val) => { captured = val }} />
      </ThemeProvider>
    )
    expect(captured!.theme).toBe('system')
  })

  it('resolves system theme to dark when prefers-color-scheme is dark', () => {
    createMatchMedia(true)
    let captured: { theme: Theme; resolvedTheme: 'light' | 'dark' } | null = null
    render(
      <ThemeProvider>
        <ThemeConsumer onTheme={(val) => { captured = val }} />
      </ThemeProvider>
    )
    expect(captured!.resolvedTheme).toBe('dark')
  })

  it('resolves system theme to light when prefers-color-scheme is light', () => {
    createMatchMedia(false)
    let captured: { theme: Theme; resolvedTheme: 'light' | 'dark' } | null = null
    render(
      <ThemeProvider>
        <ThemeConsumer onTheme={(val) => { captured = val }} />
      </ThemeProvider>
    )
    expect(captured!.resolvedTheme).toBe('light')
  })

  it('sets data-theme attribute on document.documentElement', () => {
    createMatchMedia(true)
    render(
      <ThemeProvider>
        <div>test</div>
      </ThemeProvider>
    )
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })

  it('sets data-theme to light when system prefers light', () => {
    createMatchMedia(false)
    render(
      <ThemeProvider>
        <div>test</div>
      </ThemeProvider>
    )
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })
})

describe('useTheme', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme')
    createMatchMedia(true)
  })

  it('returns theme, resolvedTheme, and setTheme', () => {
    let captured: { theme: Theme; resolvedTheme: 'light' | 'dark'; setTheme: (t: Theme) => void } | null = null
    render(
      <ThemeProvider>
        <ThemeConsumer onTheme={(val) => { captured = val }} />
      </ThemeProvider>
    )
    expect(captured).not.toBeNull()
    expect(captured!.theme).toBeDefined()
    expect(captured!.resolvedTheme).toBeDefined()
    expect(typeof captured!.setTheme).toBe('function')
  })

  it('setTheme(dark) updates resolvedTheme to dark', () => {
    let captured: { theme: Theme; resolvedTheme: 'light' | 'dark'; setTheme: (t: Theme) => void } | null = null
    render(
      <ThemeProvider defaultTheme="light">
        <ThemeConsumer onTheme={(val) => { captured = val }} />
      </ThemeProvider>
    )
    expect(captured!.resolvedTheme).toBe('light')

    act(() => {
      captured!.setTheme('dark')
    })
    expect(captured!.resolvedTheme).toBe('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })

  it('setTheme(light) updates resolvedTheme to light', () => {
    let captured: { theme: Theme; resolvedTheme: 'light' | 'dark'; setTheme: (t: Theme) => void } | null = null
    render(
      <ThemeProvider defaultTheme="dark">
        <ThemeConsumer onTheme={(val) => { captured = val }} />
      </ThemeProvider>
    )
    expect(captured!.resolvedTheme).toBe('dark')

    act(() => {
      captured!.setTheme('light')
    })
    expect(captured!.resolvedTheme).toBe('light')
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })

  it('throws when used outside ThemeProvider', () => {
    // Suppress console.error for the expected error
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {})

    function BadConsumer() {
      useTheme()
      return null
    }

    expect(() => {
      render(<BadConsumer />)
    }).toThrow('useTheme must be used within ThemeProvider')

    spy.mockRestore()
  })
})
