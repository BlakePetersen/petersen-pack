// ABOUTME: Tests for the /contributors page component.
// ABOUTME: Validates contributor grid, stats display, and bot labeling.

import React from 'react'

jest.mock('@/lib/github', () => ({
  getContributorStats: jest.fn(),
  getContributors: jest.fn(),
}))

jest.mock('@/components/content-shell', () => ({
  ContentShell: ({ children }: { children: unknown }) => children,
}))

jest.mock('@/components/sidebar', () => ({
  Sidebar: () => null,
}))

jest.mock('@/components/contributor-card', () => ({
  ContributorCard: ({ contributor }: { contributor: { login: string } }) => contributor.login,
}))

import ContributorsPage, { revalidate } from '@/app/contributors/page'
import { getContributorStats, getContributors } from '@/lib/github'

const mockGetContributorStats = getContributorStats as jest.Mock
const mockGetContributors = getContributors as jest.Mock

type JsxNode = React.ReactElement | string | number | boolean | null | undefined | JsxNode[]

function findAll(node: JsxNode, predicate: (n: React.ReactElement) => boolean): React.ReactElement[] {
  const results: React.ReactElement[] = []
  if (!node || typeof node !== 'object') return results
  if (Array.isArray(node)) {
    for (const child of node) {
      results.push(...findAll(child, predicate))
    }
    return results
  }
  if (predicate(node)) results.push(node)
  const children = (node as React.ReactElement).props?.children as JsxNode | undefined
  if (children != null) {
    results.push(...findAll(children, predicate))
  }
  return results
}

function serialize(node: JsxNode): string {
  if (node == null || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(serialize).join('')
  if (typeof node === 'object' && 'props' in node && node.props?.children != null) {
    return serialize(node.props.children as JsxNode)
  }
  return ''
}

describe('contributors page', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('renders contributor cards from getContributorStats()', async () => {
    mockGetContributorStats.mockResolvedValue([
      { login: 'alice', avatarUrl: '', htmlUrl: '', isBot: false, totalCommits: 10, totalAdditions: 100, totalDeletions: 50 },
      { login: 'bob', avatarUrl: '', htmlUrl: '', isBot: false, totalCommits: 5, totalAdditions: 40, totalDeletions: 20 },
    ])

    const tree = await ContributorsPage()
    const cards = findAll(tree, (n) => n?.props?.contributor)
    expect(cards).toHaveLength(2)
    expect(cards[0].props.contributor.login).toBe('alice')
    expect(cards[1].props.contributor.login).toBe('bob')
    expect(mockGetContributors).not.toHaveBeenCalled()
  })

  it('falls back to getContributors() when stats unavailable', async () => {
    mockGetContributorStats.mockResolvedValue([])
    mockGetContributors.mockResolvedValue([
      { login: 'carol', avatarUrl: '', htmlUrl: '', isBot: false, contributions: 7 },
    ])

    const tree = await ContributorsPage()
    const cards = findAll(tree, (n) => n?.props?.contributor)
    expect(cards).toHaveLength(1)
    expect(cards[0].props.contributor.login).toBe('carol')
    expect(mockGetContributors).toHaveBeenCalledTimes(1)
  })

  it('shows empty state when no contributors', async () => {
    mockGetContributorStats.mockResolvedValue([])
    mockGetContributors.mockResolvedValue([])

    const tree = await ContributorsPage()
    const text = serialize(tree)
    expect(text).toContain('No contributors found.')
  })

  it('displays bot badge for bot contributors', async () => {
    mockGetContributorStats.mockResolvedValue([
      { login: 'dependabot', avatarUrl: '', htmlUrl: '', isBot: true, totalCommits: 3, totalAdditions: 10, totalDeletions: 5 },
    ])

    const tree = await ContributorsPage()
    const cards = findAll(tree, (n) => n?.props?.contributor)
    expect(cards).toHaveLength(1)
    expect(cards[0].props.contributor.login).toBe('dependabot')
    expect(cards[0].props.contributor.isBot).toBe(true)
  })

  it('orders contributors by commit count descending', async () => {
    mockGetContributorStats.mockResolvedValue([
      { login: 'low', avatarUrl: '', htmlUrl: '', isBot: false, totalCommits: 2, totalAdditions: 5, totalDeletions: 1 },
      { login: 'high', avatarUrl: '', htmlUrl: '', isBot: false, totalCommits: 50, totalAdditions: 500, totalDeletions: 100 },
      { login: 'mid', avatarUrl: '', htmlUrl: '', isBot: false, totalCommits: 10, totalAdditions: 80, totalDeletions: 30 },
    ])

    const tree = await ContributorsPage()
    const cards = findAll(tree, (n) => n?.props?.contributor)
    expect(cards.map((c) => c.props.contributor.login)).toEqual(['high', 'mid', 'low'])
  })

  it('sets revalidate to 3600', () => {
    expect(revalidate).toBe(3600)
  })
})
