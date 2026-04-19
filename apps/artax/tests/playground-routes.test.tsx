/** @jest-environment jsdom */
// ABOUTME: Route-level integration tests for Playground tab visibility and URL hydration.
// ABOUTME: Pins the 11-enabled / 4-excluded partition and verifies URL → form round-trip.

import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { useSearchParams } from 'next/navigation'

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}))

jest.mock('@/lib/playground-url-state', () => ({
  ...jest.requireActual('@/lib/playground-url-state'),
  pushPlaygroundParams: jest.fn(),
}))

// react-live is mocked so the JSX editor (when toggled on) does not run Sucrase
// inside jsdom. The Playground tab does not render the editor by default, but
// the mock keeps this file safe against future test additions that toggle it.
jest.mock('react-live', () => ({
  LiveProvider: ({ children, code }: { children: ReactNode; code: string }) => (
    <div data-testid="live-provider" data-code={code}>
      {children}
    </div>
  ),
  LiveEditor: () => <div data-testid="live-editor" />,
  LivePreview: () => <div data-testid="live-preview" />,
  LiveError: () => null,
}))

import { ComponentPageClient } from '@/components/component-page-client'
import { ComponentPlayground } from '@/components/component-playground'
import { getComponent } from '@/lib/component-registry'

const mockedUseSearchParams = useSearchParams as jest.MockedFunction<
  typeof useSearchParams
>

function setSearchParams(query: string) {
  mockedUseSearchParams.mockReturnValue(
    new URLSearchParams(query) as unknown as ReturnType<typeof useSearchParams>
  )
}

// Locality-of-intent: duplicate the partition here rather than importing a
// shared constant. If someone toggles playground.enabled on a component in the
// registry, that drift should break THIS test so it is visible at the
// route-integration layer (not only inside the registry unit tests).
const ENABLED: ReadonlyArray<{ tier: string; slug: string }> = [
  { tier: 'atoms', slug: 'button' },
  { tier: 'atoms', slug: 'input' },
  { tier: 'atoms', slug: 'badge' },
  { tier: 'atoms', slug: 'separator' },
  { tier: 'atoms', slug: 'copy-button' },
  { tier: 'atoms', slug: 'toggle' },
  { tier: 'molecules', slug: 'card' },
  { tier: 'molecules', slug: 'table' },
  { tier: 'molecules', slug: 'callout' },
  { tier: 'molecules', slug: 'code-block' },
  { tier: 'molecules', slug: 'tabs' },
]

const EXCLUDED: ReadonlyArray<{ tier: string; slug: string }> = [
  { tier: 'molecules', slug: 'tooltip' },
  { tier: 'organisms', slug: 'accordion' },
  { tier: 'organisms', slug: 'dialog' },
  { tier: 'organisms', slug: 'dropdown' },
]

describe('playground routes — Playground tab visibility', () => {
  beforeEach(() => {
    setSearchParams('')
  })

  describe.each(ENABLED)(
    'enabled: $tier/$slug renders a Playground tab trigger',
    ({ tier, slug }) => {
      it('renders <TabsTrigger value="playground">Playground</TabsTrigger>', () => {
        render(<ComponentPageClient tier={tier} slug={slug} />)

        const trigger = screen.getByRole('tab', { name: 'Playground' })
        expect(trigger).toBeInTheDocument()
      })
    }
  )

  describe.each(EXCLUDED)(
    'excluded: $tier/$slug does NOT render a Playground tab trigger',
    ({ tier, slug }) => {
      it('has no <TabsTrigger value="playground">', () => {
        render(<ComponentPageClient tier={tier} slug={slug} />)

        expect(
          screen.queryByRole('tab', { name: 'Playground' })
        ).toBeNull()
      })

      it('still renders the Code and Props tabs', () => {
        render(<ComponentPageClient tier={tier} slug={slug} />)

        expect(screen.getByRole('tab', { name: 'Code' })).toBeInTheDocument()
        expect(screen.getByRole('tab', { name: 'Props' })).toBeInTheDocument()
      })
    }
  )
})

describe('playground routes — URL round-trip hydration', () => {
  beforeEach(() => {
    setSearchParams('')
  })

  it('hydrates the variant select from ?p[variant]=outline', () => {
    setSearchParams('p[variant]=outline')
    const comp = getComponent('atoms', 'button')!

    const { container } = render(<ComponentPlayground comp={comp} />)

    const variantSelect = container.querySelector(
      'select[name="variant"]'
    ) as HTMLSelectElement
    expect(variantSelect).toHaveValue('outline')
  })

  it('hydrates the size select from ?p[size]=sm', () => {
    setSearchParams('p[size]=sm')
    const comp = getComponent('atoms', 'button')!

    const { container } = render(<ComponentPlayground comp={comp} />)

    const sizeSelect = container.querySelector(
      'select[name="size"]'
    ) as HTMLSelectElement
    expect(sizeSelect).toHaveValue('sm')
  })

  it('hydrates both variant and size simultaneously', () => {
    setSearchParams('p[variant]=ghost&p[size]=lg')
    const comp = getComponent('atoms', 'button')!

    const { container } = render(<ComponentPlayground comp={comp} />)

    const variantSelect = container.querySelector(
      'select[name="variant"]'
    ) as HTMLSelectElement
    const sizeSelect = container.querySelector(
      'select[name="size"]'
    ) as HTMLSelectElement
    expect(variantSelect).toHaveValue('ghost')
    expect(sizeSelect).toHaveValue('lg')
  })

  it('ignores unknown p[*] keys and does not render an input for them', () => {
    setSearchParams('p[bogus]=x&p[variant]=outline')
    const comp = getComponent('atoms', 'button')!

    const { container } = render(<ComponentPlayground comp={comp} />)

    // The unknown key does not crash render and does not produce a control.
    expect(container.querySelector('[name="bogus"]')).toBeNull()
    // The known key still hydrates correctly.
    const variantSelect = container.querySelector(
      'select[name="variant"]'
    ) as HTMLSelectElement
    expect(variantSelect).toHaveValue('outline')
  })

  it('renders without crashing when searchParams is empty', () => {
    setSearchParams('')
    const comp = getComponent('atoms', 'button')!

    const { container } = render(<ComponentPlayground comp={comp} />)

    // Variant select falls back to the registered default.
    const variantSelect = container.querySelector(
      'select[name="variant"]'
    ) as HTMLSelectElement
    expect(variantSelect).toBeInTheDocument()
  })
})

describe('playground routes — partition size guard', () => {
  it('ENABLED covers exactly 11 components', () => {
    expect(ENABLED).toHaveLength(11)
  })

  it('EXCLUDED covers exactly 4 components', () => {
    expect(EXCLUDED).toHaveLength(4)
  })

  it('every ENABLED slug resolves to a registered component with playground.enabled=true', () => {
    ENABLED.forEach(({ tier, slug }) => {
      const comp = getComponent(tier, slug)
      expect(comp).toBeDefined()
      expect(comp!.playground?.enabled).toBe(true)
    })
  })

  it('every EXCLUDED slug resolves to a registered component without playground.enabled', () => {
    EXCLUDED.forEach(({ tier, slug }) => {
      const comp = getComponent(tier, slug)
      expect(comp).toBeDefined()
      expect(comp!.playground?.enabled).toBeFalsy()
    })
  })
})
