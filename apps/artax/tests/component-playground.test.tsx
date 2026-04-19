/** @jest-environment jsdom */
// ABOUTME: Tests for the ComponentPlayground tab integration component.
// ABOUTME: Validates canvas/form layout, excluded-component guard, URL hydration, and debounced pushPlaygroundParams writes.

import { render, screen, fireEvent, act } from '@testing-library/react'
import { useSearchParams } from 'next/navigation'

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}))

jest.mock('@/lib/playground-url-state', () => ({
  ...jest.requireActual('@/lib/playground-url-state'),
  pushPlaygroundParams: jest.fn(),
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
})
