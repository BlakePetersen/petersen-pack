/** @jest-environment jsdom */
// ABOUTME: Tests for the ComponentPlayground tab integration component.
// ABOUTME: Validates canvas/form layout, excluded-component guard, URL hydration, and debounced pushPlaygroundParams writes.

import { render, screen, fireEvent, act } from '@testing-library/react'
import type { ReactNode } from 'react'
import { useSearchParams } from 'next/navigation'

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}))

jest.mock('@/lib/playground-url-state', () => ({
  ...jest.requireActual('@/lib/playground-url-state'),
  pushPlaygroundParams: jest.fn(),
}))

// Track the last `code` prop passed to the mocked LiveProvider so tests can
// assert that reset flushes the seed JSX back to codeExamples[0].code.
const liveProviderCodeHistory: string[] = []

jest.mock('react-live', () => ({
  LiveProvider: ({
    code,
    children,
  }: {
    code: string
    children: ReactNode
  }) => {
    liveProviderCodeHistory.push(code)
    return (
      <div data-testid="live-provider" data-code={code}>
        {children}
      </div>
    )
  },
  LiveEditor: () => <div data-testid="live-editor" />,
  LivePreview: () => <div data-testid="live-preview" />,
  LiveError: () => null,
}))

import { ComponentPlayground } from '@/components/component-playground'
import { getComponent } from '@/lib/component-registry'
import { pushPlaygroundParams } from '@/lib/playground-url-state'

const mockedUseSearchParams = useSearchParams as jest.MockedFunction<
  typeof useSearchParams
>
const mockedPush = pushPlaygroundParams as jest.MockedFunction<
  typeof pushPlaygroundParams
>

function setSearchParams(query: string) {
  mockedUseSearchParams.mockReturnValue(
    new URLSearchParams(query) as unknown as ReturnType<typeof useSearchParams>
  )
}

describe('ComponentPlayground', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    mockedPush.mockClear()
    liveProviderCodeHistory.length = 0
    setSearchParams('')
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('renders dot-grid preview canvas and props form for an enabled component', () => {
    const comp = getComponent('atoms', 'button')!

    const { container } = render(<ComponentPlayground comp={comp} />)

    const canvas = screen.getByTestId('playground-canvas')
    expect(canvas).toBeInTheDocument()
    expect(canvas.className).toContain('bg-[radial-gradient')
    // PlaygroundPropsForm renders a <select> for variant (literal-union).
    expect(container.querySelector('select[name="variant"]')).toBeInTheDocument()
  })

  it('returns null for excluded components (tooltip, no playground field)', () => {
    const comp = getComponent('molecules', 'tooltip')!

    const { container } = render(<ComponentPlayground comp={comp} />)

    expect(container.firstChild).toBeNull()
    expect(screen.queryByTestId('playground-canvas')).toBeNull()
  })

  it('renders the "// playground" section label above the canvas', () => {
    const comp = getComponent('atoms', 'button')!

    render(<ComponentPlayground comp={comp} />)

    const label = screen.getByText('// playground')
    expect(label).toBeInTheDocument()
    expect(label.className).toContain('font-mono')
    expect(label.className).toContain('text-xs')
    expect(label.className).toContain('text-muted-foreground')
  })

  it('hydrates initial form state from URL p[*] params', () => {
    setSearchParams('p[variant]=outline&p[size]=sm')
    const comp = getComponent('atoms', 'button')!

    const { container } = render(<ComponentPlayground comp={comp} />)

    const variantSelect = container.querySelector(
      'select[name="variant"]'
    ) as HTMLSelectElement
    const sizeSelect = container.querySelector(
      'select[name="size"]'
    ) as HTMLSelectElement
    expect(variantSelect).toHaveValue('outline')
    expect(sizeSelect).toHaveValue('sm')
  })

  it('debounces pushPlaygroundParams by 300ms on form change', () => {
    const comp = getComponent('atoms', 'button')!

    const { container } = render(<ComponentPlayground comp={comp} />)

    const select = container.querySelector(
      'select[name="variant"]'
    ) as HTMLSelectElement
    fireEvent.change(select, { target: { value: 'outline' } })

    // Before the debounce window elapses: no push.
    expect(mockedPush).not.toHaveBeenCalled()

    act(() => {
      jest.advanceTimersByTime(300)
    })

    expect(mockedPush).toHaveBeenCalledTimes(1)
    expect(mockedPush).toHaveBeenCalledWith(
      expect.objectContaining({ variant: 'outline' })
    )
  })

  it('collapses multiple rapid changes into a single debounced push with final value', () => {
    const comp = getComponent('atoms', 'button')!

    const { container } = render(<ComponentPlayground comp={comp} />)

    const select = container.querySelector(
      'select[name="variant"]'
    ) as HTMLSelectElement
    fireEvent.change(select, { target: { value: 'outline' } })
    act(() => {
      jest.advanceTimersByTime(100)
    })
    fireEvent.change(select, { target: { value: 'ghost' } })

    act(() => {
      jest.advanceTimersByTime(300)
    })

    expect(mockedPush).toHaveBeenCalledTimes(1)
    expect(mockedPush).toHaveBeenCalledWith(
      expect.objectContaining({ variant: 'ghost' })
    )
  })

  it('renders the Edit JSX toggle in the off state by default (no JSX editor mounted)', () => {
    const comp = getComponent('atoms', 'button')!

    render(<ComponentPlayground comp={comp} />)

    const toggle = screen.getByText('Edit JSX')
    expect(toggle).toBeInTheDocument()
    expect(screen.queryByTestId('live-provider')).toBeNull()
  })

  it('mounts PlaygroundJsxEditor when Edit JSX is toggled on', () => {
    const comp = getComponent('atoms', 'button')!

    render(<ComponentPlayground comp={comp} />)

    fireEvent.click(screen.getByText('Edit JSX'))

    expect(screen.getByTestId('live-provider')).toBeInTheDocument()
  })

  it('unmounts PlaygroundJsxEditor when Edit JSX is toggled off again', () => {
    const comp = getComponent('atoms', 'button')!

    render(<ComponentPlayground comp={comp} />)

    const toggle = screen.getByText('Edit JSX')
    fireEvent.click(toggle)
    expect(screen.getByTestId('live-provider')).toBeInTheDocument()

    fireEvent.click(toggle)
    expect(screen.queryByTestId('live-provider')).toBeNull()
  })

  it('seeds the JSX editor with codeExamples[0].code on first mount', () => {
    const comp = getComponent('atoms', 'button')!
    const expectedSeed = comp.codeExamples[0]!.code

    render(<ComponentPlayground comp={comp} />)

    fireEvent.click(screen.getByText('Edit JSX'))

    const provider = screen.getByTestId('live-provider')
    expect(provider.getAttribute('data-code')).toBe(expectedSeed)
  })

  it('does NOT trigger pushPlaygroundParams when the JSX toggle is flipped (URL stays clean per D-04)', () => {
    const comp = getComponent('atoms', 'button')!

    render(<ComponentPlayground comp={comp} />)

    fireEvent.click(screen.getByText('Edit JSX'))
    act(() => {
      jest.advanceTimersByTime(500)
    })

    expect(mockedPush).not.toHaveBeenCalled()
  })
})
