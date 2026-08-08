/**
 * @jest-environment jsdom
 */
// ABOUTME: Tests for the ComponentPreview display component.
// ABOUTME: Validates dot-grid background, variant selector, and preview rendering.

import { createElement } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'

jest.mock('next/navigation', () => ({
  usePathname: () => '/'
}))

import { ComponentPreview } from '@/components/component-preview'

describe('ComponentPreview', () => {
  it('renders dot-grid background pattern', () => {
    const { container } = render(
      createElement(ComponentPreview, {
        renderPreview: () => createElement('span', null, 'Hello')
      })
    )

    const previewArea = container.querySelector('[data-testid="preview-area"]')
    expect(previewArea).toBeDefined()
    expect(previewArea?.className).toContain('bg-[radial-gradient')
  })

  it('renders variant selector buttons when variants provided', () => {
    render(
      createElement(ComponentPreview, {
        variants: ['default', 'outline', 'ghost'],
        renderPreview: (values?: Record<string, string>) =>
          createElement('span', null, `Variant: ${values?.variant}`)
      })
    )

    expect(screen.getByText('default')).toBeDefined()
    expect(screen.getByText('outline')).toBeDefined()
    expect(screen.getByText('ghost')).toBeDefined()
  })

  it('does not render variant buttons when no variants provided', () => {
    const { container } = render(
      createElement(ComponentPreview, {
        renderPreview: () => createElement('span', null, 'Hello')
      })
    )

    const buttons = container.querySelectorAll('[data-testid="variant-button"]')
    expect(buttons.length).toBe(0)
  })

  it('switches displayed variant on button click', () => {
    render(
      createElement(ComponentPreview, {
        variants: ['default', 'outline'],
        renderPreview: (values?: Record<string, string>) =>
          createElement(
            'span',
            { 'data-testid': 'preview-content' },
            `Variant: ${values?.variant}`
          )
      })
    )

    // Initially shows first variant
    expect(screen.getByTestId('preview-content').textContent).toBe(
      'Variant: default'
    )

    // Click outline
    fireEvent.click(screen.getByText('outline'))
    expect(screen.getByTestId('preview-content').textContent).toBe(
      'Variant: outline'
    )
  })

  it('applies active style to selected variant button', () => {
    render(
      createElement(ComponentPreview, {
        variants: ['default', 'outline'],
        renderPreview: () => createElement('span', null, 'Hello')
      })
    )

    const defaultBtn = screen.getByText('default')
    expect(defaultBtn.className).toContain('bg-primary')
    expect(defaultBtn.className).toContain('text-primary-foreground')

    const outlineBtn = screen.getByText('outline')
    expect(outlineBtn.className).toContain('text-muted-foreground')
  })
})
