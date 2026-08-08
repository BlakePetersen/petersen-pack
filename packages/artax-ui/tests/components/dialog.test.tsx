// ABOUTME: Tests for the Dialog components and their server-safe primitives.
// ABOUTME: Validates terminal styling on primitive variants.
import { render, screen } from '@testing-library/react'
import {
  DialogOverlayPrimitive,
  DialogContentPrimitive,
  DialogTitlePrimitive,
  DialogDescriptionPrimitive
} from '../../src/components/organisms/dialog/dialog'

describe('Dialog primitive components', () => {
  it('renders DialogOverlayPrimitive', () => {
    render(<DialogOverlayPrimitive data-testid="overlay" />)
    expect(screen.getByTestId('overlay')).toBeInTheDocument()
  })

  it('renders DialogContentPrimitive with terminal styling', () => {
    render(
      <DialogContentPrimitive data-testid="content">
        Dialog body
      </DialogContentPrimitive>
    )
    const content = screen.getByTestId('content')
    expect(content.className).toContain('bg-card')
    expect(content.className).toContain('border-border')
  })

  it('renders DialogTitlePrimitive with monospace font', () => {
    render(
      <DialogTitlePrimitive data-testid="title">Title</DialogTitlePrimitive>
    )
    expect(screen.getByTestId('title').className).toContain('font-mono')
  })

  it('renders DialogDescriptionPrimitive', () => {
    render(
      <DialogDescriptionPrimitive data-testid="desc">
        Description
      </DialogDescriptionPrimitive>
    )
    expect(screen.getByText('Description')).toBeInTheDocument()
  })
})
