// ABOUTME: Tests for the server-safe Tabs base component.
// ABOUTME: Validates structure components render without 'use client'.
import { render, screen } from '@testing-library/react'
import { TabsList, TabsTrigger, TabsContent } from '../../src/components/molecules/tabs/tabs'
import { readFileSync } from 'fs'
import { resolve } from 'path'

describe('Tabs base components', () => {
  it('renders TabsList with terminal styling', () => {
    render(
      <TabsList data-testid="list">
        <TabsTrigger>Tab 1</TabsTrigger>
      </TabsList>
    )
    const list = screen.getByTestId('list')
    expect(list.className).toContain('terminal-border')
  })

  it('renders TabsTrigger with monospace font', () => {
    render(<TabsTrigger data-testid="trigger">Tab 1</TabsTrigger>)
    expect(screen.getByTestId('trigger').className).toContain('font-mono')
  })

  it('renders TabsContent', () => {
    render(<TabsContent data-testid="content">Panel content</TabsContent>)
    expect(screen.getByText('Panel content')).toBeInTheDocument()
  })

  it('is server-safe (no use client)', () => {
    const content = readFileSync(
      resolve(__dirname, '../../src/components/molecules/tabs/tabs.tsx'),
      'utf-8'
    )
    expect(content).not.toContain("'use client'")
    expect(content).not.toContain('"use client"')
  })
})
