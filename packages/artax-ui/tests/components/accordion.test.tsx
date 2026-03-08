// ABOUTME: Tests for the server-safe Accordion base component.
// ABOUTME: Validates structure components render without 'use client'.
import { render, screen } from '@testing-library/react'
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent
} from '../../src/components/accordion'
import { readFileSync } from 'fs'
import { resolve } from 'path'

describe('Accordion base components', () => {
  it('renders AccordionItem as a div', () => {
    render(<AccordionItem data-testid="item">content</AccordionItem>)
    expect(screen.getByTestId('item')).toBeInTheDocument()
  })

  it('renders AccordionTrigger with terminal styling', () => {
    render(
      <AccordionTrigger data-testid="trigger">Toggle</AccordionTrigger>
    )
    const trigger = screen.getByTestId('trigger')
    expect(trigger.textContent).toContain('Toggle')
    expect(trigger.className).toContain('font-mono')
  })

  it('renders AccordionContent', () => {
    render(
      <AccordionContent data-testid="content">Body text</AccordionContent>
    )
    expect(screen.getByTestId('content')).toBeInTheDocument()
    expect(screen.getByText('Body text')).toBeInTheDocument()
  })

  it('applies terminal border to AccordionItem', () => {
    render(<AccordionItem data-testid="item">content</AccordionItem>)
    expect(screen.getByTestId('item').className).toContain('terminal-border')
  })

  it('is server-safe (no use client)', () => {
    const content = readFileSync(
      resolve(__dirname, '../../src/components/accordion.tsx'),
      'utf-8'
    )
    expect(content).not.toContain("'use client'")
    expect(content).not.toContain('"use client"')
  })
})
