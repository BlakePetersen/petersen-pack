// ABOUTME: Tests for the PrevNextNav molecule covering slot combinations.
// ABOUTME: Validates prev-only, next-only, both, and the null-guard case.
import { render, screen } from '@testing-library/react'
import { PrevNextNav } from '../../src/components/molecules/prev-next-nav/prev-next-nav'

describe('PrevNextNav', () => {
  it('renders prev-only slot and omits next', () => {
    render(<PrevNextNav prev={{ href: '/a', label: 'Alpha' }} />)
    expect(screen.getByText(/← prev: Alpha/)).toBeInTheDocument()
    expect(screen.queryByText(/next:/)).not.toBeInTheDocument()
  })

  it('renders next-only slot and omits prev', () => {
    render(<PrevNextNav next={{ href: '/b', label: 'Beta' }} />)
    expect(screen.getByText(/next: Beta →/)).toBeInTheDocument()
    expect(screen.queryByText(/← prev:/)).not.toBeInTheDocument()
  })

  it('renders both slots inside aria-labelled nav wrapper', () => {
    render(
      <PrevNextNav
        prev={{ href: '/a', label: 'Alpha' }}
        next={{ href: '/b', label: 'Beta' }}
      />
    )
    const nav = screen.getByRole('navigation', { name: 'Article navigation' })
    expect(nav).toBeInTheDocument()
    expect(screen.getByText(/← prev: Alpha/)).toBeInTheDocument()
    expect(screen.getByText(/next: Beta →/)).toBeInTheDocument()
  })

  it('returns null when both prev and next are omitted', () => {
    const { container } = render(<PrevNextNav />)
    expect(container.firstChild).toBeNull()
  })
})
