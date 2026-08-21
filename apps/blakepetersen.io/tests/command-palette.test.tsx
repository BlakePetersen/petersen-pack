/**
 * @jest-environment jest-environment-jsdom
 */

// ABOUTME: Render tests for CommandPalette and SearchTrigger components.
// ABOUTME: Verifies components render without crashing and have correct accessible elements.

import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock searchContent to return empty array
jest.mock('@/lib/search', () => ({
  searchContent: jest.fn().mockResolvedValue([])
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn()
  }),
  usePathname: () => '/'
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

  it('open dialog exposes an accessible description', () => {
    render(<CommandPalette defaultOpen />)
    const dialog = screen.getByRole('dialog')
    const describedBy = dialog.getAttribute('aria-describedby')
    expect(describedBy).toBeTruthy()

    const description = document.getElementById(describedBy as string)
    expect(description).not.toBeNull()
    expect(description).toHaveTextContent(/Search across all site content/i)
  })

  it('does not warn about a missing dialog description', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
    try {
      render(<CommandPalette defaultOpen />)
      const describedByWarnings = warn.mock.calls.filter(([first]) =>
        String(first).includes('Missing `Description`')
      )
      expect(describedByWarnings).toEqual([])
    } finally {
      warn.mockRestore()
    }
  })
})

describe('SearchTrigger', () => {
  it('renders a button with accessible label', () => {
    render(<SearchTrigger onClick={jest.fn()} />)
    const button = screen.getByRole('button', { name: /search/i })
    expect(button).toBeInTheDocument()
  })
})
