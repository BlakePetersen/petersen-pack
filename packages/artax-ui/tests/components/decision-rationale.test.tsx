// ABOUTME: Tests for DecisionRationale molecule — caption, headline, alternatives, collapsed variant.
// ABOUTME: Asserts both <section> (default) and <details>/<summary> (collapsed) render paths.
import { render, screen } from '@testing-library/react'
import { DecisionRationale } from '../../src/components/molecules/decision-rationale/decision-rationale'

describe('DecisionRationale', () => {
  it('renders the // decision caption', () => {
    render(
      <DecisionRationale
        decision="Use Postgres"
        rationale={<p>Relational fit.</p>}
      />
    )
    expect(screen.getByText('// decision')).toBeInTheDocument()
  })

  it('renders the decision headline', () => {
    render(
      <DecisionRationale decision="Use Postgres" rationale={<p>body</p>} />
    )
    expect(screen.getByText('Use Postgres')).toBeInTheDocument()
  })

  it('renders rationale body', () => {
    render(
      <DecisionRationale
        decision="Decision A"
        rationale={<p>The rationale text here.</p>}
      />
    )
    expect(screen.getByText('The rationale text here.')).toBeInTheDocument()
  })

  it('renders alternatives list when provided', () => {
    const { container } = render(
      <DecisionRationale
        decision="Chose Postgres"
        rationale={<p>rationale</p>}
        alternatives={[
          { name: 'MySQL', reason: 'less JSON support' },
          { name: 'SQLite', reason: 'single-writer limit' },
          { name: 'Mongo', reason: 'no relational guarantees' }
        ]}
      />
    )
    const items = container.querySelectorAll('ul > li')
    expect(items).toHaveLength(3)
    expect(screen.getByText('MySQL')).toBeInTheDocument()
    expect(screen.getByText(/less JSON support/)).toBeInTheDocument()
  })

  it('renders as <section> when collapsed is falsy', () => {
    const { container } = render(
      <DecisionRationale decision="D" rationale={<p>r</p>} />
    )
    expect(container.querySelector('section')).not.toBeNull()
    expect(container.querySelector('details')).toBeNull()
  })

  it('renders as <details>/<summary> when collapsed is true', () => {
    const { container } = render(
      <DecisionRationale decision="D" rationale={<p>r</p>} collapsed />
    )
    expect(container.querySelector('details')).not.toBeNull()
    expect(container.querySelector('summary')).not.toBeNull()
    expect(container.querySelector('section')).toBeNull()
  })

  it('applies border-l-primary left accent', () => {
    const { container } = render(
      <DecisionRationale decision="D" rationale={<p>r</p>} />
    )
    const section = container.querySelector('section')
    expect(section?.className).toContain('border-l-primary')
  })

  it('accepts custom className', () => {
    const { container } = render(
      <DecisionRationale
        decision="D"
        rationale={<p>r</p>}
        className="custom-deco"
      />
    )
    expect(container.querySelector('section')?.className).toContain(
      'custom-deco'
    )
  })
})
