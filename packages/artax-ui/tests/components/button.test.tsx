// ABOUTME: Tests for the Button component with terminal aesthetic.
// ABOUTME: Validates rendering, $ prefix, [bracket] ghost variant, and variant/size props.
import React from 'react'
import { render, screen } from '@testing-library/react'
import {
  Button,
  buttonVariants
} from '../../src/components/atoms/button/button'

describe('Button', () => {
  it('renders with children text', () => {
    render(<Button>deploy</Button>)
    expect(screen.getByRole('button')).toHaveTextContent('deploy')
  })

  it('renders $ prefix for default variant', () => {
    render(<Button>deploy</Button>)
    const button = screen.getByRole('button')
    expect(button.textContent).toContain('$')
    expect(button.textContent).toContain('deploy')
  })

  it('renders [brackets] for ghost variant', () => {
    render(<Button variant="ghost">cancel</Button>)
    const button = screen.getByRole('button')
    expect(button.textContent).toContain('[')
    expect(button.textContent).toContain(']')
    expect(button.textContent).toContain('cancel')
  })

  it('does not render $ prefix for ghost variant', () => {
    render(<Button variant="ghost">cancel</Button>)
    const button = screen.getByRole('button')
    expect(button.textContent).not.toContain('$')
  })

  it('does not render brackets for default variant', () => {
    render(<Button>deploy</Button>)
    const button = screen.getByRole('button')
    expect(button.textContent).not.toContain('[')
    expect(button.textContent).not.toContain(']')
  })

  it('renders outline variant without $ or brackets', () => {
    render(<Button variant="outline">configure</Button>)
    const button = screen.getByRole('button')
    expect(button.textContent).not.toContain('$')
    expect(button.textContent).not.toContain('[')
  })

  it('applies monospace font class', () => {
    render(<Button>test</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('font-mono')
  })

  it('supports custom className via cn()', () => {
    render(<Button className="custom-class">test</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('custom-class')
  })

  it('passes through native button props', () => {
    render(<Button disabled>test</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('exports buttonVariants function', () => {
    expect(typeof buttonVariants).toBe('function')
  })
})
