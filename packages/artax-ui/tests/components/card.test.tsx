// ABOUTME: Tests for the Card component family with terminal aesthetic.
// ABOUTME: Validates Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter.
import React from 'react'
import { render, screen } from '@testing-library/react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '../../src/components/molecules/card/card'

describe('Card', () => {
  it('renders with children', () => {
    render(<Card data-testid="card">content</Card>)
    expect(screen.getByTestId('card')).toHaveTextContent('content')
  })

  it('supports custom className', () => {
    render(
      <Card data-testid="card" className="custom">
        content
      </Card>
    )
    expect(screen.getByTestId('card').className).toContain('custom')
  })
})

describe('CardHeader', () => {
  it('renders with monospace font', () => {
    render(<CardHeader data-testid="header">header</CardHeader>)
    expect(screen.getByTestId('header').className).toContain('font-mono')
  })
})

describe('CardTitle', () => {
  it('renders with // prefix', () => {
    render(<CardTitle data-testid="title">status</CardTitle>)
    expect(screen.getByTestId('title').textContent).toContain('//')
    expect(screen.getByTestId('title').textContent).toContain('status')
  })
})

describe('CardDescription', () => {
  it('renders with children', () => {
    render(<CardDescription data-testid="desc">details</CardDescription>)
    expect(screen.getByTestId('desc')).toHaveTextContent('details')
  })
})

describe('CardContent', () => {
  it('renders with children', () => {
    render(<CardContent data-testid="content">body</CardContent>)
    expect(screen.getByTestId('content')).toHaveTextContent('body')
  })
})

describe('CardFooter', () => {
  it('renders with children', () => {
    render(<CardFooter data-testid="footer">actions</CardFooter>)
    expect(screen.getByTestId('footer')).toHaveTextContent('actions')
  })
})
