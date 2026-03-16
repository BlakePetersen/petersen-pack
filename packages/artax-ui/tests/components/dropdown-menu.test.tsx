// ABOUTME: Tests for the server-safe DropdownMenu base component.
// ABOUTME: Validates structure components render without 'use client'.
import { render, screen } from '@testing-library/react'
import {
  DropdownContent,
  DropdownItem,
  DropdownSeparator
} from '../../src/components/organisms/dropdown/dropdown-menu'
import { readFileSync } from 'fs'
import { resolve } from 'path'

describe('DropdownMenu base components', () => {
  it('renders DropdownContent with terminal styling', () => {
    render(
      <DropdownContent data-testid="content">items</DropdownContent>
    )
    const content = screen.getByTestId('content')
    expect(content.className).toContain('terminal-surface')
    expect(content.className).toContain('terminal-border')
  })

  it('renders DropdownItem with monospace font', () => {
    render(<DropdownItem data-testid="item">Option 1</DropdownItem>)
    expect(screen.getByTestId('item').className).toContain('font-mono')
  })

  it('renders DropdownSeparator', () => {
    render(<DropdownSeparator data-testid="sep" />)
    expect(screen.getByTestId('sep')).toBeInTheDocument()
    expect(screen.getByTestId('sep').className).toContain('terminal-border')
  })

  it('is server-safe (no use client)', () => {
    const content = readFileSync(
      resolve(__dirname, '../../src/components/organisms/dropdown/dropdown-menu.tsx'),
      'utf-8'
    )
    expect(content).not.toContain("'use client'")
    expect(content).not.toContain('"use client"')
  })
})
