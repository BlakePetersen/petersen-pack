/**
 * @jest-environment jest-environment-jsdom
 */

// ABOUTME: Tests for ApplyActionBar component command construction.
// ABOUTME: Validates that blink apply commands use bare slug format.

import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import { ApplyActionBar } from '@/components/apply-action-bar'

describe('ApplyActionBar', () => {
  it('renders blink apply command with bare slug', () => {
    render(<ApplyActionBar slug="eslint-flat-config" />)
    const el = screen.getByText((_, element) =>
      element?.tagName === 'SPAN' &&
      element?.textContent === '$ blink apply eslint-flat-config'
    )
    expect(el).toBeInTheDocument()
  })

  it('renders blink apply command with skill slug', () => {
    render(<ApplyActionBar slug="test-driven-development" />)
    const el = screen.getByText((_, element) =>
      element?.tagName === 'SPAN' &&
      element?.textContent === '$ blink apply test-driven-development'
    )
    expect(el).toBeInTheDocument()
  })

  it('renders the $ prefix before the command', () => {
    render(<ApplyActionBar slug="eslint-flat-config" />)
    const el = screen.getByText((_, element) =>
      element?.tagName === 'SPAN' &&
      element?.textContent?.startsWith('$ ')
    )
    expect(el).toBeInTheDocument()
  })

  it('renders a copy button', () => {
    render(<ApplyActionBar slug="eslint-flat-config" />)
    expect(screen.getByText('copy')).toBeInTheDocument()
  })
})
