// ABOUTME: Tests for the terminal-styled Callout component.
// ABOUTME: Validates variant rendering and left border accent styling.
import { render, screen } from '@testing-library/react'
import { Callout } from '../../src/components/molecules/callout/callout'

describe('Callout', () => {
  it('renders with default info variant', () => {
    render(<Callout>Information here</Callout>)
    expect(screen.getByText('Information here')).toBeInTheDocument()
  })

  it('renders with terminal surface background', () => {
    render(<Callout data-testid="callout">content</Callout>)
    expect(screen.getByTestId('callout').className).toContain(
      'terminal-surface'
    )
  })

  it('renders with left border accent', () => {
    render(<Callout data-testid="callout">content</Callout>)
    expect(screen.getByTestId('callout').className).toContain('border-l')
  })

  it('renders info variant with cyan border', () => {
    render(
      <Callout variant="info" data-testid="callout">
        info
      </Callout>
    )
    expect(screen.getByTestId('callout').className).toContain('cyan')
  })

  it('renders warning variant with amber border', () => {
    render(
      <Callout variant="warning" data-testid="callout">
        warning
      </Callout>
    )
    expect(screen.getByTestId('callout').className).toContain('amber')
  })

  it('renders error variant with red border', () => {
    render(
      <Callout variant="error" data-testid="callout">
        error
      </Callout>
    )
    expect(screen.getByTestId('callout').className).toContain('red')
  })

  it('renders success variant with green border', () => {
    render(
      <Callout variant="success" data-testid="callout">
        success
      </Callout>
    )
    expect(screen.getByTestId('callout').className).toContain('green')
  })

  it('renders monospace label', () => {
    render(<Callout data-testid="callout">content</Callout>)
    expect(screen.getByTestId('callout').className).toContain('font-mono')
  })

  it('passes custom className', () => {
    render(
      <Callout className="custom" data-testid="callout">
        content
      </Callout>
    )
    expect(screen.getByTestId('callout').className).toContain('custom')
  })
})
