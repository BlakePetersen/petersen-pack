// ABOUTME: Tests for the server-safe Toggle base component.
// ABOUTME: Validates structure component renders without 'use client'.
import { render, screen } from '@testing-library/react'
import { ToggleBase } from '../../src/components/atoms/toggle/toggle'
import { readFileSync } from 'fs'
import { resolve } from 'path'

describe('Toggle base component', () => {
  it('renders with terminal styling', () => {
    render(<ToggleBase data-testid="toggle">Option</ToggleBase>)
    const toggle = screen.getByTestId('toggle')
    expect(toggle.className).toContain('font-mono')
    expect(toggle.className).toContain('terminal-border')
  })

  it('renders children', () => {
    render(<ToggleBase>Bold</ToggleBase>)
    expect(screen.getByText('Bold')).toBeInTheDocument()
  })

  it('is server-safe (no use client)', () => {
    const content = readFileSync(
      resolve(__dirname, '../../src/components/atoms/toggle/toggle.tsx'),
      'utf-8'
    )
    expect(content).not.toContain("'use client'")
    expect(content).not.toContain('"use client"')
  })
})
