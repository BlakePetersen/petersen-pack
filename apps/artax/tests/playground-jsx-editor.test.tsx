/** @jest-environment jsdom */
// ABOUTME: Tests for PlaygroundJsxEditor with mocked react-live per RESEARCH.md Pitfall 5.
// ABOUTME: Validates LiveProvider/LiveEditor/LivePreview composition, chrome classes, label, and reset button wiring.

import { render, screen, fireEvent } from '@testing-library/react'
import type { ReactNode } from 'react'

jest.mock('react-live', () => ({
  LiveProvider: ({ children }: { children: ReactNode }) => (
    <div data-testid="live-provider">{children}</div>
  ),
  LiveEditor: () => <div data-testid="live-editor" />,
  LivePreview: () => <div data-testid="live-preview" />,
  LiveError: () => null
}))

import { PlaygroundJsxEditor } from '@/components/playground-jsx-editor'

describe('PlaygroundJsxEditor', () => {
  it('renders exactly one LiveProvider, LiveEditor, and LivePreview', () => {
    render(
      <PlaygroundJsxEditor code="<Button />" scope={{}} onReset={jest.fn()} />
    )

    expect(screen.getAllByTestId('live-provider')).toHaveLength(1)
    expect(screen.getAllByTestId('live-editor')).toHaveLength(1)
    expect(screen.getAllByTestId('live-preview')).toHaveLength(1)
  })

  it('wraps the editor in a bg-card border chrome container', () => {
    const { container } = render(
      <PlaygroundJsxEditor code="<Button />" scope={{}} onReset={jest.fn()} />
    )

    const chrome = container.querySelector('.bg-card.border.border-border')
    expect(chrome).not.toBeNull()
  })

  it('renders the "// jsx editor" label in terminal aesthetic classes', () => {
    render(
      <PlaygroundJsxEditor code="<Button />" scope={{}} onReset={jest.fn()} />
    )

    const label = screen.getByText('// jsx editor')
    expect(label).toBeInTheDocument()
    expect(label.className).toContain('font-mono')
    expect(label.className).toContain('text-xs')
    expect(label.className).toContain('text-muted-foreground')
  })

  it('invokes onReset exactly once when the reset button is clicked', () => {
    const onReset = jest.fn()
    render(
      <PlaygroundJsxEditor code="<Button />" scope={{}} onReset={onReset} />
    )

    const resetButton = screen.getByText('// reset to example')
    fireEvent.click(resetButton)

    expect(onReset).toHaveBeenCalledTimes(1)
  })

  it('renders the reset button with terminal-aesthetic classes', () => {
    render(
      <PlaygroundJsxEditor code="<Button />" scope={{}} onReset={jest.fn()} />
    )

    const resetButton = screen.getByText('// reset to example')
    expect(resetButton.className).toContain('font-mono')
    expect(resetButton.className).toContain('text-xs')
    expect(resetButton.className).toContain('text-muted-foreground')
  })
})
