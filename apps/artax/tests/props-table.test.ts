/**
 * @jest-environment jsdom
 */
// ABOUTME: Tests for the PropsTable display component.
// ABOUTME: Validates 4-column table layout and empty state.

import { createElement } from 'react'
import { render, screen } from '@testing-library/react'

jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}))

import { PropsTable } from '@/components/props-table'

describe('PropsTable', () => {
  const sampleProps = [
    { name: 'variant', type: "'default' | 'outline'", default: "'default'", description: 'Visual style' },
    { name: 'size', type: "'sm' | 'lg'", default: "'sm'", description: 'Button size' },
  ]

  it('renders a 4-column table with Prop, Type, Default, Description headers', () => {
    render(createElement(PropsTable, { props: sampleProps }))

    expect(screen.getByText('Prop')).toBeDefined()
    expect(screen.getByText('Type')).toBeDefined()
    expect(screen.getByText('Default')).toBeDefined()
    expect(screen.getByText('Description')).toBeDefined()
  })

  it('renders prop rows with data', () => {
    render(createElement(PropsTable, { props: sampleProps }))

    expect(screen.getByText('variant')).toBeDefined()
    expect(screen.getByText("'default' | 'outline'")).toBeDefined()
    expect(screen.getByText('Visual style')).toBeDefined()

    expect(screen.getByText('size')).toBeDefined()
    expect(screen.getByText("'sm' | 'lg'")).toBeDefined()
  })

  it('shows "No props documented" when props array is empty', () => {
    render(createElement(PropsTable, { props: [] }))
    expect(screen.getByText('No props documented')).toBeDefined()
  })
})
