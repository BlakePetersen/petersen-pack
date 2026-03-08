// ABOUTME: Tests for the server-safe Tooltip base component.
// ABOUTME: Validates structure component renders without 'use client'.
import { render, screen } from '@testing-library/react'
import { TooltipContent } from '../../src/components/tooltip'
import { readFileSync } from 'fs'
import { resolve } from 'path'

describe('Tooltip base component', () => {
  it('renders TooltipContent with terminal styling', () => {
    render(
      <TooltipContent data-testid="tooltip">Hint text</TooltipContent>
    )
    const content = screen.getByTestId('tooltip')
    expect(content.className).toContain('terminal-surface')
    expect(content.className).toContain('terminal-border')
    expect(content.className).toContain('font-mono')
  })

  it('renders children', () => {
    render(<TooltipContent>Help text</TooltipContent>)
    expect(screen.getByText('Help text')).toBeInTheDocument()
  })

  it('is server-safe (no use client)', () => {
    const content = readFileSync(
      resolve(__dirname, '../../src/components/tooltip.tsx'),
      'utf-8'
    )
    expect(content).not.toContain("'use client'")
    expect(content).not.toContain('"use client"')
  })
})
