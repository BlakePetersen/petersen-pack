// ABOUTME: Tests for breadcrumb path builder used in content detail pages.
// ABOUTME: Validates segment generation, label formatting, and edge cases.

import { buildBreadcrumbs } from '@/components/breadcrumbs'

describe('buildBreadcrumbs', () => {
  it('returns segments for a detail page path', () => {
    const crumbs = buildBreadcrumbs('/skills/commit-hooks')
    expect(crumbs).toEqual([
      { label: 'skills', href: '/skills' },
      { label: 'commit hooks', href: '/skills/commit-hooks' },
    ])
  })

  it('returns empty array for root path', () => {
    expect(buildBreadcrumbs('/')).toEqual([])
  })

  it('returns empty array for listing page (single segment)', () => {
    expect(buildBreadcrumbs('/skills')).toEqual([])
  })

  it('handles nested paths with multiple segments', () => {
    const crumbs = buildBreadcrumbs('/posts/some-post')
    expect(crumbs).toEqual([
      { label: 'posts', href: '/posts' },
      { label: 'some post', href: '/posts/some-post' },
    ])
  })

  it('replaces hyphens with spaces in labels', () => {
    const crumbs = buildBreadcrumbs('/guides/monorepo-setup-guide')
    expect(crumbs[1].label).toBe('monorepo setup guide')
  })

  it('preserves correct hrefs for each segment', () => {
    const crumbs = buildBreadcrumbs('/configs/eslint-config')
    expect(crumbs[0].href).toBe('/configs')
    expect(crumbs[1].href).toBe('/configs/eslint-config')
  })
})
