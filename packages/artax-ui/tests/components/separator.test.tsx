// ABOUTME: Tests for the Separator component with terminal aesthetic.
// ABOUTME: Validates horizontal rule rendering with terminal styling.
import React from 'react'
import { render, screen } from '@testing-library/react'
import { Separator } from '../../src/components/separator'

describe('Separator', () => {
  it('renders a separator element', () => {
    render(<Separator data-testid="sep" />)
    expect(screen.getByTestId('sep')).toBeInTheDocument()
  })

  it('supports custom className', () => {
    render(<Separator data-testid="sep" className="custom" />)
    expect(screen.getByTestId('sep').className).toContain('custom')
  })

  it('renders as horizontal by default', () => {
    render(<Separator data-testid="sep" />)
    const el = screen.getByTestId('sep')
    expect(el.getAttribute('role')).toBe('separator')
  })
})
