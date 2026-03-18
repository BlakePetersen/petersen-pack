// ABOUTME: Tests for the Toggle component and its server-safe primitive.
// ABOUTME: Validates terminal styling on both interactive and primitive variants.
import { render, screen } from '@testing-library/react'
import { TogglePrimitive } from '../../src/components/atoms/toggle/toggle'

describe('Toggle primitive component', () => {
  it('renders with terminal styling', () => {
    render(<TogglePrimitive data-testid="toggle">Option</TogglePrimitive>)
    const toggle = screen.getByTestId('toggle')
    expect(toggle.className).toContain('font-mono')
    expect(toggle.className).toContain('border-border')
  })

  it('renders children', () => {
    render(<TogglePrimitive>Bold</TogglePrimitive>)
    expect(screen.getByText('Bold')).toBeInTheDocument()
  })
})
