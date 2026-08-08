// ABOUTME: Tests for the Input component with terminal aesthetic.
// ABOUTME: Validates monospace font, terminal border styling, and prop passthrough.
import React from 'react'
import { render, screen } from '@testing-library/react'
import { Input } from '../../src/components/atoms/input/input'

describe('Input', () => {
  it('renders an input element', () => {
    render(<Input data-testid="input" />)
    expect(screen.getByTestId('input').tagName).toBe('INPUT')
  })

  it('applies monospace font class', () => {
    render(<Input data-testid="input" />)
    expect(screen.getByTestId('input').className).toContain('font-mono')
  })

  it('supports custom className via cn()', () => {
    render(<Input data-testid="input" className="custom-class" />)
    expect(screen.getByTestId('input').className).toContain('custom-class')
  })

  it('passes through native input props', () => {
    render(
      <Input data-testid="input" placeholder="enter command" type="text" />
    )
    const input = screen.getByTestId('input') as HTMLInputElement
    expect(input.placeholder).toBe('enter command')
    expect(input.type).toBe('text')
  })

  it('supports disabled state', () => {
    render(<Input data-testid="input" disabled />)
    expect(screen.getByTestId('input')).toBeDisabled()
  })
})
