// ABOUTME: Tests for the DropdownMenu components and their server-safe primitives.
// ABOUTME: Validates terminal styling on primitive variants.
import { render, screen } from '@testing-library/react'
import {
  DropdownContentPrimitive,
  DropdownItemPrimitive,
  DropdownSeparatorPrimitive
} from '../../src/components/organisms/dropdown/dropdown-menu'

describe('DropdownMenu primitive components', () => {
  it('renders DropdownContentPrimitive with terminal styling', () => {
    render(
      <DropdownContentPrimitive data-testid="content">
        items
      </DropdownContentPrimitive>
    )
    const content = screen.getByTestId('content')
    expect(content.className).toContain('bg-popover')
    expect(content.className).toContain('border-border')
  })

  it('renders DropdownItemPrimitive with monospace font', () => {
    render(
      <DropdownItemPrimitive data-testid="item">Option 1</DropdownItemPrimitive>
    )
    expect(screen.getByTestId('item').className).toContain('font-mono')
  })

  it('renders DropdownSeparatorPrimitive', () => {
    render(<DropdownSeparatorPrimitive data-testid="sep" />)
    expect(screen.getByTestId('sep')).toBeInTheDocument()
    expect(screen.getByTestId('sep').className).toContain('bg-border')
  })
})
