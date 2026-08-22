// ABOUTME: Tests for the ThemeProvider next-themes wrapper and useTheme re-export.
// ABOUTME: Validates that artax-ui pre-configures next-themes with data-theme attribute.
import { render, screen } from '@testing-library/react'
import { ThemeProvider, useTheme } from '../src/providers/theme-provider'
import type { Theme } from '../src/providers/theme-provider'

// Mock next-themes since it requires a Next.js runtime (blocking script injection)
const mockUseTheme = jest.fn().mockReturnValue({
  theme: 'system',
  setTheme: jest.fn(),
  resolvedTheme: 'dark'
})

jest.mock('next-themes', () => ({
  ThemeProvider: jest.fn(({ children, ...props }: Record<string, unknown>) => (
    <div data-testid="next-theme-provider" data-props={JSON.stringify(props)}>
      {children as React.ReactNode}
    </div>
  )),
  // eslint-disable-next-line @eslint-react/no-unnecessary-use-prefix -- mocks next-themes' useTheme; the name is the module's contract
  useTheme: (...args: unknown[]) => mockUseTheme(...args)
}))

describe('ThemeProvider', () => {
  it('renders children', () => {
    render(
      <ThemeProvider>
        <div data-testid="child">Hello</div>
      </ThemeProvider>
    )
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('passes attribute="data-theme" to the underlying next-themes provider', () => {
    render(
      <ThemeProvider>
        <div>test</div>
      </ThemeProvider>
    )
    const provider = screen.getByTestId('next-theme-provider')
    const props = JSON.parse(provider.getAttribute('data-props')!)
    expect(props.attribute).toBe('data-theme')
  })

  it('defaults to defaultTheme="system"', () => {
    render(
      <ThemeProvider>
        <div>test</div>
      </ThemeProvider>
    )
    const provider = screen.getByTestId('next-theme-provider')
    const props = JSON.parse(provider.getAttribute('data-props')!)
    expect(props.defaultTheme).toBe('system')
  })

  it('passes enableSystem to next-themes provider', () => {
    render(
      <ThemeProvider>
        <div>test</div>
      </ThemeProvider>
    )
    const provider = screen.getByTestId('next-theme-provider')
    const props = JSON.parse(provider.getAttribute('data-props')!)
    expect(props.enableSystem).toBe(true)
  })

  it('accepts and forwards a custom defaultTheme', () => {
    render(
      <ThemeProvider defaultTheme="dark">
        <div>test</div>
      </ThemeProvider>
    )
    const provider = screen.getByTestId('next-theme-provider')
    const props = JSON.parse(provider.getAttribute('data-props')!)
    expect(props.defaultTheme).toBe('dark')
  })
})

describe('useTheme', () => {
  it('is re-exported and callable', () => {
    function Consumer() {
      const value = useTheme()
      return <div data-testid="consumer">{value.theme}</div>
    }
    render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>
    )
    expect(screen.getByTestId('consumer')).toHaveTextContent('system')
  })

  it('returns theme, setTheme, and resolvedTheme', () => {
    let captured: ReturnType<typeof useTheme> | null = null
    function Consumer() {
      captured = useTheme()
      return null
    }
    render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>
    )
    expect(captured).not.toBeNull()
    expect(captured!.theme).toBeDefined()
    expect(captured!.resolvedTheme).toBeDefined()
    expect(typeof captured!.setTheme).toBe('function')
  })
})

describe('Theme type', () => {
  it('accepts light, dark, and system values', () => {
    // TypeScript compile-time check — if this compiles, the type is correct
    const light: Theme = 'light'
    const dark: Theme = 'dark'
    const system: Theme = 'system'
    expect([light, dark, system]).toEqual(['light', 'dark', 'system'])
  })
})

describe('index.ts exports', () => {
  it('exports ThemeProvider, useTheme, and Theme from the package barrel', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const barrel = require('../src/index')
    expect(barrel.ThemeProvider).toBeDefined()
    expect(barrel.useTheme).toBeDefined()
  })
})
