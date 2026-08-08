/**
 * @jest-environment jsdom
 */
// ABOUTME: Tests for the CodeExamples display component.
// ABOUTME: Validates labeled code blocks render with correct structure.

import { createElement } from 'react'
import { render, screen } from '@testing-library/react'

jest.mock('next/navigation', () => ({
  usePathname: () => '/'
}))

import { CodeExamples } from '@/components/code-examples'

describe('CodeExamples', () => {
  const sampleExamples = [
    { label: 'Basic', code: '<Button>Click</Button>' },
    { label: 'Variants', code: '<Button variant="outline">Outline</Button>' }
  ]

  it('renders labeled code blocks', () => {
    render(createElement(CodeExamples, { examples: sampleExamples }))

    expect(screen.getByText('Basic')).toBeDefined()
    expect(screen.getByText('Variants')).toBeDefined()
  })

  it('renders code content in pre elements', () => {
    const { container } = render(
      createElement(CodeExamples, { examples: sampleExamples })
    )

    const preElements = container.querySelectorAll('pre')
    expect(preElements.length).toBe(2)
  })

  it('renders nothing meaningful when examples array is empty', () => {
    const { container } = render(createElement(CodeExamples, { examples: [] }))

    const preElements = container.querySelectorAll('pre')
    expect(preElements.length).toBe(0)
  })
})
