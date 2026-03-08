// ABOUTME: Render tests for CommandPalette and SearchTrigger components.
// ABOUTME: Verifies components render without crashing and have correct accessible elements.

/**
 * @jest-environment jest-environment-jsdom
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock searchContent to return empty array
jest.mock('@/lib/search', () => ({
  searchContent: jest.fn().mockResolvedValue([]),
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  usePathname: () => '/',
}))

import { CommandPalette } from '@/components/command-palette'
import { SearchTrigger } from '@/components/search-trigger'

describe('CommandPalette', () => {
  it('renders without crashing', () => {
    render(<CommandPalette />)
  })

  it('shows input field when open', () => {
    render(<CommandPalette defaultOpen />)
    const input = screen.getByPlaceholderText(/search/i)
    expect(input).toBeInTheDocument()
  })
})

describe('SearchTrigger', () => {
  it('renders a button with accessible label', () => {
    render(<SearchTrigger onClick={jest.fn()} />)
    const button = screen.getByRole('button', { name: /search/i })
    expect(button).toBeInTheDocument()
  })
})
