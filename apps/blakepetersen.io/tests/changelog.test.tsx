// ABOUTME: Tests for the /changelog page component.
// ABOUTME: Validates timeline rendering, empty states, and release display.

import React from 'react'

jest.mock('@/lib/github', () => ({
  getReleases: jest.fn(),
}))

jest.mock('@/components/content-shell', () => ({
  ContentShell: ({ children }: { children: React.ReactNode }) => children,
}))

jest.mock('@/components/sidebar', () => ({
  Sidebar: () => null,
}))

jest.mock('@/components/release-body', () => ({
  ReleaseBody: ({ body }: { body: string }) => <pre>{body}</pre>,
}))

import { getReleases } from '@/lib/github'
import { ReleaseBody } from '@/components/release-body'
import ChangelogPage, { revalidate } from '@/app/changelog/page'

const mockGetReleases = getReleases as jest.MockedFunction<typeof getReleases>

function findInTree(element: React.ReactElement, predicate: (el: React.ReactElement) => boolean): React.ReactElement[] {
  const results: React.ReactElement[] = []
  if (predicate(element)) results.push(element)
  const children = element.props?.children
  if (Array.isArray(children)) {
    for (const child of children) {
      if (React.isValidElement(child)) results.push(...findInTree(child, predicate))
    }
  } else if (React.isValidElement(children)) {
    results.push(...findInTree(children, predicate))
  }
  return results
}

function findTextInTree(element: React.ReactElement, text: string): boolean {
  const json = JSON.stringify(element)
  return json.includes(text)
}

const fakeReleases = [
  {
    tagName: 'v1.2.0',
    name: 'Big Feature Release',
    body: '## Changes\n- Added feature A',
    publishedAt: '2026-01-15T12:00:00Z',
    htmlUrl: 'https://github.com/example/repo/releases/tag/v1.2.0',
  },
  {
    tagName: 'v1.1.0',
    name: 'v1.1.0',
    body: '## Fixes\n- Fixed bug B',
    publishedAt: '2025-12-01T12:00:00Z',
    htmlUrl: 'https://github.com/example/repo/releases/tag/v1.1.0',
  },
]

describe('changelog page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders timeline with releases from getReleases()', async () => {
    mockGetReleases.mockResolvedValue(fakeReleases)
    const tree = await ChangelogPage()
    expect(findTextInTree(tree, 'v1.2.0')).toBe(true)
    expect(findTextInTree(tree, 'v1.1.0')).toBe(true)
  })

  it('shows empty state when no releases exist', async () => {
    mockGetReleases.mockResolvedValue([])
    const tree = await ChangelogPage()
    expect(findTextInTree(tree, 'No releases found.')).toBe(true)
  })

  it('displays version tag and date for each release', async () => {
    mockGetReleases.mockResolvedValue(fakeReleases)
    const tree = await ChangelogPage()
    expect(findTextInTree(tree, 'v1.2.0')).toBe(true)
    expect(findTextInTree(tree, 'Jan 15, 2026')).toBe(true)
    expect(findTextInTree(tree, 'v1.1.0')).toBe(true)
    expect(findTextInTree(tree, 'Dec 1, 2025')).toBe(true)
  })

  it('renders ReleaseBody component for each entry', async () => {
    mockGetReleases.mockResolvedValue(fakeReleases)
    const tree = await ChangelogPage()
    const releaseBodies = findInTree(tree, (el) => el.type === ReleaseBody)
    expect(releaseBodies).toHaveLength(2)
    expect(releaseBodies[0].props.body).toBe('## Changes\n- Added feature A')
    expect(releaseBodies[1].props.body).toBe('## Fixes\n- Fixed bug B')
  })

  it('sets revalidate to 3600', () => {
    expect(revalidate).toBe(3600)
  })
})
