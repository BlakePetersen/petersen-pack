/**
 * @jest-environment jsdom
 */
// ABOUTME: Tests for sidebar navigation with tier groupings and active state.
// ABOUTME: Validates all 15 component links, tier headings, and no collapse behavior.

import { createElement } from 'react'
import { render, screen } from '@testing-library/react'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/components/atoms/button',
}))

// Mock next/link to render a simple anchor
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) =>
    createElement('a', { href, className }, children),
}))

import { SidebarNav } from '@/components/sidebar-nav'

function getSections() {
  return [
    {
      label: '',
      items: [
        { name: 'Overview', href: '/' },
        { name: 'Getting Started', href: '/getting-started' },
      ],
    },
    {
      label: '// atoms',
      items: [
        { name: 'Button', href: '/components/atoms/button' },
        { name: 'Input', href: '/components/atoms/input' },
        { name: 'Badge', href: '/components/atoms/badge' },
        { name: 'Separator', href: '/components/atoms/separator' },
        { name: 'CopyButton', href: '/components/atoms/copy-button' },
        { name: 'Toggle', href: '/components/atoms/toggle' },
      ],
    },
    {
      label: '// molecules',
      items: [
        { name: 'Card', href: '/components/molecules/card' },
        { name: 'Table', href: '/components/molecules/table' },
        { name: 'Callout', href: '/components/molecules/callout' },
        { name: 'CodeBlock', href: '/components/molecules/code-block' },
        { name: 'Tabs', href: '/components/molecules/tabs' },
        { name: 'Tooltip', href: '/components/molecules/tooltip' },
      ],
    },
    {
      label: '// organisms',
      items: [
        { name: 'Accordion', href: '/components/organisms/accordion' },
        { name: 'Dialog', href: '/components/organisms/dialog' },
        { name: 'Dropdown', href: '/components/organisms/dropdown' },
      ],
    },
    {
      label: '',
      items: [{ name: 'Tokens', href: '/tokens' }],
    },
  ]
}

describe('SidebarNav', () => {
  it('renders Overview and Getting Started links', () => {
    render(createElement(SidebarNav, { sections: getSections() }))
    expect(screen.getByText('Overview')).toBeDefined()
    expect(screen.getByText('Getting Started')).toBeDefined()
  })

  it('renders tier headings (// atoms, // molecules, // organisms)', () => {
    render(createElement(SidebarNav, { sections: getSections() }))
    expect(screen.getByText('// atoms')).toBeDefined()
    expect(screen.getByText('// molecules')).toBeDefined()
    expect(screen.getByText('// organisms')).toBeDefined()
  })

  it('renders Tokens link in its own section', () => {
    render(createElement(SidebarNav, { sections: getSections() }))
    const tokensLink = screen.getByText('Tokens')
    expect(tokensLink).toBeDefined()
    expect(tokensLink.closest('a')?.getAttribute('href')).toBe('/tokens')
  })

  it('applies active styles to current pathname link', () => {
    render(createElement(SidebarNav, { sections: getSections() }))
    const buttonLink = screen.getByText('Button').closest('a')
    expect(buttonLink?.className).toContain('border-l-2')
    expect(buttonLink?.className).toContain('border-primary')
    expect(buttonLink?.className).toContain('bg-accent')
  })

  it('renders all 15 component links with correct hrefs', () => {
    const { container } = render(createElement(SidebarNav, { sections: getSections() }))

    const componentLinks = container.querySelectorAll('a[href^="/components/"]')
    expect(componentLinks.length).toBe(15)

    const atomLinks = container.querySelectorAll('a[href^="/components/atoms/"]')
    expect(atomLinks.length).toBe(6)

    const moleculeLinks = container.querySelectorAll('a[href^="/components/molecules/"]')
    expect(moleculeLinks.length).toBe(6)

    const organismLinks = container.querySelectorAll('a[href^="/components/organisms/"]')
    expect(organismLinks.length).toBe(3)
  })

  it('tier headings are always visible (no collapse/expand)', () => {
    const { container } = render(createElement(SidebarNav, { sections: getSections() }))

    // All component items should be visible, no collapsible mechanism
    expect(screen.getByText('Accordion')).toBeDefined()
    expect(screen.getByText('Tooltip')).toBeDefined()

    // No disclosure/details elements
    expect(container.querySelectorAll('details').length).toBe(0)
    expect(container.querySelectorAll('[role="button"]').length).toBe(0)
  })
})
