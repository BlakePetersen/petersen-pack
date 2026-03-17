// ABOUTME: Tests for the server-safe Dialog base component.
// ABOUTME: Validates structure components render without 'use client'.
import { render, screen } from '@testing-library/react'
import {
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription
} from '../../src/components/organisms/dialog/dialog'
import { readFileSync } from 'fs'
import { resolve } from 'path'

describe('Dialog base components', () => {
  it('renders DialogOverlay', () => {
    render(<DialogOverlay data-testid="overlay" />)
    expect(screen.getByTestId('overlay')).toBeInTheDocument()
  })

  it('renders DialogContent with terminal styling', () => {
    render(<DialogContent data-testid="content">Dialog body</DialogContent>)
    const content = screen.getByTestId('content')
    expect(content.className).toContain('bg-card')
    expect(content.className).toContain('border-border')
  })

  it('renders DialogTitle with monospace font', () => {
    render(<DialogTitle data-testid="title">Title</DialogTitle>)
    expect(screen.getByTestId('title').className).toContain('font-mono')
  })

  it('renders DialogDescription', () => {
    render(
      <DialogDescription data-testid="desc">Description</DialogDescription>
    )
    expect(screen.getByText('Description')).toBeInTheDocument()
  })

  it('is server-safe (no use client)', () => {
    const content = readFileSync(
      resolve(__dirname, '../../src/components/organisms/dialog/dialog.tsx'),
      'utf-8'
    )
    expect(content).not.toContain("'use client'")
    expect(content).not.toContain('"use client"')
  })
})
