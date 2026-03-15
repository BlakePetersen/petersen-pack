/**
 * @jest-environment jest-environment-jsdom
 */

// ABOUTME: Tests for ApplyActionBar component command construction.
// ABOUTME: Validates that blink apply commands use type/slug format.

import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import { ApplyActionBar } from '@/components/apply-action-bar'

describe('ApplyActionBar', () => {
  it('renders blink apply command with config type', () => {
    render(<ApplyActionBar type="config" slug="eslint-flat-config" />)
    expect(screen.getByText('blink apply config/eslint-flat-config')).toBeInTheDocument()
  })

  it('renders blink apply command with skill type', () => {
    render(<ApplyActionBar type="skill" slug="test-driven-development" />)
    expect(screen.getByText('blink apply skill/test-driven-development')).toBeInTheDocument()
  })

  it('renders the $ prefix before the command', () => {
    render(<ApplyActionBar type="config" slug="eslint-flat-config" />)
    expect(screen.getByText('$ ')).toBeInTheDocument()
  })

  it('renders a copy button', () => {
    render(<ApplyActionBar type="config" slug="eslint-flat-config" />)
    expect(screen.getByText('copy')).toBeInTheDocument()
  })
})
