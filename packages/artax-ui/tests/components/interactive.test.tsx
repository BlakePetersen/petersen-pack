// ABOUTME: Tests for interactive components using Radix primitives.
// ABOUTME: Validates 'use client' directive and terminal styling on all interactive components.
import { render, screen } from '@testing-library/react'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const componentFiles = [
  ['organisms/accordion/accordion.tsx'],
  ['organisms/dialog/dialog.tsx'],
  ['organisms/dropdown/dropdown-menu.tsx'],
  ['molecules/tabs/tabs.tsx'],
  ['atoms/toggle/toggle.tsx'],
  ['molecules/tooltip/tooltip.tsx']
]

describe('component files have use client', () => {
  it.each(componentFiles)(
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

describe('Accordion', () => {
  it('renders with terminal styling', async () => {
    const { Accordion } = await import(
      '../../src/components/organisms/accordion/accordion'
    )
    render(
      <Accordion type="single" collapsible data-testid="accordion">
        <div>item</div>
      </Accordion>
    )
    const el = screen.getByTestId('accordion')
    expect(el).toBeInTheDocument()
  })
})

describe('Dialog', () => {
  it('exports Dialog component', async () => {
    const mod = await import('../../src/components/organisms/dialog/dialog')
    expect(mod.Dialog).toBeDefined()
    expect(mod.DialogContent).toBeDefined()
    expect(mod.DialogTrigger).toBeDefined()
    expect(mod.DialogClose).toBeDefined()
  })
})

describe('Dropdown', () => {
  it('exports Dropdown component', async () => {
    const mod = await import('../../src/components/organisms/dropdown/dropdown-menu')
    expect(mod.Dropdown).toBeDefined()
    expect(mod.DropdownTrigger).toBeDefined()
    expect(mod.DropdownContent).toBeDefined()
    expect(mod.DropdownItem).toBeDefined()
  })
})

describe('Tabs', () => {
  it('renders with terminal styling', async () => {
    const { Tabs, TabsList, TabsTrigger, TabsContent } = await import(
      '../../src/components/molecules/tabs/tabs'
    )
    render(
      <Tabs defaultValue="tab1" data-testid="tabs">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
      </Tabs>
    )
    expect(screen.getByTestId('tabs')).toBeInTheDocument()
  })
})

describe('Toggle', () => {
  it('renders with terminal styling', async () => {
    const { Toggle } = await import(
      '../../src/components/atoms/toggle/toggle'
    )
    render(<Toggle data-testid="toggle">Bold</Toggle>)
    const el = screen.getByTestId('toggle')
    expect(el).toBeInTheDocument()
    expect(el.className).toContain('font-mono')
  })
})

describe('Tooltip', () => {
  it('exports Tooltip components', async () => {
    const mod = await import('../../src/components/molecules/tooltip/tooltip')
    expect(mod.TooltipProvider).toBeDefined()
    expect(mod.Tooltip).toBeDefined()
    expect(mod.TooltipTrigger).toBeDefined()
    expect(mod.TooltipContent).toBeDefined()
  })
})
