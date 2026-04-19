// ABOUTME: Tests for createCollectionIndexPage factory behavior.
// ABOUTME: Focus on the empty-state branch (getter returns []) per UI-SPEC Copywriting Contract.

import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

// Mock next/link to a plain anchor so SSR rendering doesn't drag in Next.js runtime internals.
jest.mock('next/link', () => {
  const MockLink = ({
    href,
    children,
    ...rest
  }: {
    href: string
    children: React.ReactNode
    [key: string]: unknown
  }) => React.createElement('a', { href, ...rest }, children)
  MockLink.displayName = 'MockLink'
  return { __esModule: true, default: MockLink }
})

// Mock the collection registry so we can force an empty getter without touching real content.
// Mirrors CollectionDefinition shape from collection-registry.ts (slug, label, color, layout,
// indexDescription, visibility flags, href, getter) — any field the factory reads must be present.
jest.mock('@/lib/collection-registry', () => ({
  getCollection: (slug: string) => ({
    slug,
    label: 'Test Collection',
    color: '#10B981',
    layout: 'dx' as const,
    indexDescription: (n: number) => `Test description with ${n} items`,
    showInNav: true,
    showInSitemap: true,
    showInFeed: true,
    href: `/${slug}`,
    getter: () => [],
  }),
}))

// Mock content module (referenced transitively) so tests don't depend on Velite output.
jest.mock('@/lib/content', () => ({
  resolveRelatedSlugs: () => [],
}))

// Mock layout components to keep the rendered tree small and focused on factory output.
jest.mock('@/components/content-shell', () => ({
  ContentShell: ({ children }: { children: React.ReactNode }) => children,
}))

jest.mock('@/components/sidebar', () => ({
  Sidebar: () => null,
}))

// Import AFTER the mocks are registered.
import { createCollectionIndexPage } from '@/lib/collection-pages'

describe('createCollectionIndexPage — empty state', () => {
  it('renders `// empty_collection` caption when getter returns []', () => {
    const { Page } = createCollectionIndexPage('configs')
    const html = renderToStaticMarkup(Page() as React.ReactElement)

    expect(html).toContain('// empty_collection')
  })

  it('renders the UI-SPEC contribute copy', () => {
    const { Page } = createCollectionIndexPage('configs')
    const html = renderToStaticMarkup(Page() as React.ReactElement)

    expect(html).toContain('No entries yet. Check back, or contribute one')
  })

  it('renders a [contribute] link pointing to /start-here', () => {
    const { Page } = createCollectionIndexPage('configs')
    const html = renderToStaticMarkup(Page() as React.ReactElement)

    expect(html).toContain('[contribute]')
    expect(html).toMatch(/<a[^>]*href="\/start-here"/)
  })

  it('uses the collection label in the empty-state heading', () => {
    const { Page } = createCollectionIndexPage('configs')
    const html = renderToStaticMarkup(Page() as React.ReactElement)

    expect(html).toContain('Test Collection')
  })
})
