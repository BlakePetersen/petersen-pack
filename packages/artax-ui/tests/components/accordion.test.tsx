// ABOUTME: Tests for the Accordion components and their server-safe primitives.
// ABOUTME: Validates terminal styling on primitive variants.
import { render, screen } from '@testing-library/react'
import {
  AccordionItemPrimitive,
  AccordionTriggerPrimitive,
  AccordionContentPrimitive
} from '../../src/components/organisms/accordion/accordion'

describe('Accordion primitive components', () => {
  it('renders AccordionItemPrimitive as a div', () => {
    render(
      <AccordionItemPrimitive data-testid="item">
        content
      </AccordionItemPrimitive>
    )
    expect(screen.getByTestId('item')).toBeInTheDocument()
  })

  it('renders AccordionTriggerPrimitive with terminal styling', () => {
    render(
      <AccordionTriggerPrimitive data-testid="trigger">
        Toggle
      </AccordionTriggerPrimitive>
    )
    const trigger = screen.getByTestId('trigger')
    expect(trigger.textContent).toContain('Toggle')
    expect(trigger.className).toContain('font-mono')
  })

  it('renders AccordionContentPrimitive', () => {
    render(
      <AccordionContentPrimitive data-testid="content">
        Body text
      </AccordionContentPrimitive>
    )
    expect(screen.getByTestId('content')).toBeInTheDocument()
    expect(screen.getByText('Body text')).toBeInTheDocument()
  })

  it('applies terminal border to AccordionItemPrimitive', () => {
    render(
      <AccordionItemPrimitive data-testid="item">
        content
      </AccordionItemPrimitive>
    )
    expect(screen.getByTestId('item').className).toContain('border-border')
  })
})
