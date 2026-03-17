// ABOUTME: Tests for the Tooltip component and its server-safe primitive.
// ABOUTME: Validates terminal styling on the primitive variant.
import { render, screen } from '@testing-library/react'
import { TooltipContentPrimitive } from '../../src/components/molecules/tooltip/tooltip'

describe('Tooltip primitive component', () => {
  it('renders TooltipContentPrimitive with terminal styling', () => {
    render(
      <TooltipContentPrimitive data-testid="tooltip">Hint text</TooltipContentPrimitive>
    )
    const content = screen.getByTestId('tooltip')
    expect(content.className).toContain('bg-popover')
    expect(content.className).toContain('border-border')
    expect(content.className).toContain('font-mono')
  })

  it('renders children', () => {
    render(<TooltipContentPrimitive>Help text</TooltipContentPrimitive>)
    expect(screen.getByText('Help text')).toBeInTheDocument()
  })
})
