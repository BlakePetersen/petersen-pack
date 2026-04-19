// ABOUTME: Tests for the Badge component with terminal aesthetic.
// ABOUTME: Validates monospace font and variant rendering (default, outline, secondary).
import React from 'react'
import { render, screen } from '@testing-library/react'
import { Badge } from '../../src/components/atoms/badge/badge'

describe('Badge', () => {
  it('renders with children', () => {
    render(<Badge data-testid="badge">active</Badge>)
    expect(screen.getByTestId('badge')).toHaveTextContent('active')
  })

  it('applies monospace font class', () => {
    render(<Badge data-testid="badge">active</Badge>)
    expect(screen.getByTestId('badge').className).toContain('font-mono')
  })

  it('supports custom className', () => {
    render(<Badge data-testid="badge" className="custom">active</Badge>)
    expect(screen.getByTestId('badge').className).toContain('custom')
  })

  it('renders default variant', () => {
    render(<Badge data-testid="badge">active</Badge>)
    expect(screen.getByTestId('badge')).toBeInTheDocument()
  })

  it('renders outline variant', () => {
    render(<Badge data-testid="badge" variant="outline">pending</Badge>)
    expect(screen.getByTestId('badge')).toBeInTheDocument()
  })

  it('renders secondary variant', () => {
    render(<Badge data-testid="badge" variant="secondary">archived</Badge>)
    expect(screen.getByTestId('badge')).toBeInTheDocument()
  })

  it('renders info variant with info token', () => {
    render(<Badge data-testid="badge" variant="info">info</Badge>)
    expect(screen.getByTestId('badge').className).toContain('text-info')
  })

  it('renders success variant with success token', () => {
    render(<Badge data-testid="badge" variant="success">shipped</Badge>)
    expect(screen.getByTestId('badge').className).toContain('text-success')
  })

  it('renders warning variant with warning token', () => {
    render(<Badge data-testid="badge" variant="warning">beta</Badge>)
    expect(screen.getByTestId('badge').className).toContain('text-warning')
  })

  it('renders destructive variant with destructive token', () => {
    render(<Badge data-testid="badge" variant="destructive">danger</Badge>)
    expect(screen.getByTestId('badge').className).toContain('text-destructive')
  })
})
