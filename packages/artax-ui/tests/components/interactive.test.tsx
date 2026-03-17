// ABOUTME: Tests for interactive client wrappers using Radix primitives.
// ABOUTME: Validates 'use client' directive and terminal styling on all interactive components.
import { render, screen } from '@testing-library/react'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const interactiveFiles = [
  ['organisms/accordion/accordion-interactive.tsx'],
  ['organisms/dialog/dialog-interactive.tsx'],
  ['organisms/dropdown/dropdown-interactive.tsx'],
  ['molecules/tabs/tabs-interactive.tsx'],
  ['atoms/toggle/toggle-interactive.tsx'],
  ['molecules/tooltip/tooltip-interactive.tsx']
]

describe('interactive wrappers have use client', () => {
  it.each(interactiveFiles)(
    '%s has "use client" directive',
    filename => {
      const content = readFileSync(
        resolve(__dirname, '../../src/components', filename),
        'utf-8'
      )
      const firstLine = content.split('\n')[0].trim()
      expect(firstLine).toBe("'use client'")
    }
  )
})

describe('AccordionInteractive', () => {
  it('renders with terminal styling', async () => {
    const { AccordionInteractive } = await import(
      '../../src/components/organisms/accordion/accordion-interactive'
    )
    render(
      <AccordionInteractive type="single" collapsible data-testid="accordion">
        <div>item</div>
      </AccordionInteractive>
    )
    const el = screen.getByTestId('accordion')
    expect(el).toBeInTheDocument()
  })
})

describe('DialogInteractive', () => {
  it('exports DialogInteractive component', async () => {
    const mod = await import('../../src/components/organisms/dialog/dialog-interactive')
    expect(mod.DialogInteractive).toBeDefined()
    expect(mod.DialogInteractiveContent).toBeDefined()
    expect(mod.DialogInteractiveTrigger).toBeDefined()
    expect(mod.DialogInteractiveClose).toBeDefined()
  })
})

describe('DropdownInteractive', () => {
  it('exports DropdownInteractive component', async () => {
    const mod = await import('../../src/components/organisms/dropdown/dropdown-interactive')
    expect(mod.DropdownInteractive).toBeDefined()
    expect(mod.DropdownInteractiveTrigger).toBeDefined()
    expect(mod.DropdownInteractiveContent).toBeDefined()
    expect(mod.DropdownInteractiveItem).toBeDefined()
  })
})

describe('TabsInteractive', () => {
  it('renders with terminal styling', async () => {
    const { TabsInteractive, TabsInteractiveList, TabsInteractiveTrigger, TabsInteractiveContent } = await import(
      '../../src/components/molecules/tabs/tabs-interactive'
    )
    render(
      <TabsInteractive defaultValue="tab1" data-testid="tabs">
        <TabsInteractiveList>
          <TabsInteractiveTrigger value="tab1">Tab 1</TabsInteractiveTrigger>
        </TabsInteractiveList>
        <TabsInteractiveContent value="tab1">Content 1</TabsInteractiveContent>
      </TabsInteractive>
    )
    expect(screen.getByTestId('tabs')).toBeInTheDocument()
  })
})

describe('ToggleInteractive', () => {
  it('renders with terminal styling', async () => {
    const { ToggleInteractive } = await import(
      '../../src/components/atoms/toggle/toggle-interactive'
    )
    render(<ToggleInteractive data-testid="toggle">Bold</ToggleInteractive>)
    const el = screen.getByTestId('toggle')
    expect(el).toBeInTheDocument()
    expect(el.className).toContain('font-mono')
  })
})

describe('TooltipInteractive', () => {
  it('exports TooltipInteractive components', async () => {
    const mod = await import('../../src/components/molecules/tooltip/tooltip-interactive')
    expect(mod.TooltipInteractiveProvider).toBeDefined()
    expect(mod.TooltipInteractive).toBeDefined()
    expect(mod.TooltipInteractiveTrigger).toBeDefined()
    expect(mod.TooltipInteractiveContent).toBeDefined()
  })
})
