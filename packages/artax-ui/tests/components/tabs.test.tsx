// ABOUTME: Tests for the Tabs components and their server-safe primitives.
// ABOUTME: Validates terminal styling on both interactive and primitive variants.
import { render, screen } from '@testing-library/react'
import { TabsListPrimitive, TabsTriggerPrimitive, TabsContentPrimitive } from '../../src/components/molecules/tabs/tabs'

describe('Tabs primitive components', () => {
  it('renders TabsListPrimitive with terminal styling', () => {
    render(
      <TabsListPrimitive data-testid="list">
        <TabsTriggerPrimitive>Tab 1</TabsTriggerPrimitive>
      </TabsListPrimitive>
    )
    const list = screen.getByTestId('list')
    expect(list.className).toContain('border-border')
  })

  it('renders TabsTriggerPrimitive with monospace font', () => {
    render(<TabsTriggerPrimitive data-testid="trigger">Tab 1</TabsTriggerPrimitive>)
    expect(screen.getByTestId('trigger').className).toContain('font-mono')
  })

  it('renders TabsContentPrimitive', () => {
    render(<TabsContentPrimitive data-testid="content">Panel content</TabsContentPrimitive>)
    expect(screen.getByText('Panel content')).toBeInTheDocument()
  })
})
