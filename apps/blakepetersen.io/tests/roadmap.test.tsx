// ABOUTME: Tests for the /roadmap page component.
// ABOUTME: Validates Projects board link and milestone summary.

import React from 'react'
import { getReleases } from '@/lib/github'
import RoadmapPage, { revalidate } from '@/app/roadmap/page'

jest.mock('@/lib/github', () => ({
  getReleases: jest.fn()
}))

jest.mock('@/components/content-shell', () => ({
  ContentShell: ({ children }: { children: React.ReactNode }) => children
}))

jest.mock('@/components/sidebar', () => ({
  Sidebar: () => null
}))

const mockedGetReleases = getReleases as jest.MockedFunction<typeof getReleases>

describe('roadmap page', () => {
  beforeEach(() => {
    mockedGetReleases.mockReset()
  })

  it('renders link to GitHub Projects board', async () => {
    mockedGetReleases.mockResolvedValue([])

    const tree = await RoadmapPage()
    const html = JSON.stringify(tree)

    expect(html).toContain('https://github.com/users/blakepetersen/projects')
    expect(html).toContain('GitHub Projects Board')
  })

  it('shows milestone history from releases', async () => {
    mockedGetReleases.mockResolvedValue([
      {
        tagName: 'v1.0.0',
        name: 'Initial Release',
        publishedAt: '2025-01-01T00:00:00Z',
        body: ''
      },
      {
        tagName: 'v1.1.0',
        name: 'v1.1.0',
        publishedAt: '2025-02-01T00:00:00Z',
        body: ''
      },
      {
        tagName: 'v2.0.0',
        name: 'Major Update',
        publishedAt: '2025-06-01T00:00:00Z',
        body: ''
      }
    ])

    const tree = await RoadmapPage()
    const html = JSON.stringify(tree)

    expect(html).toContain('v1.x')
    expect(html).toContain('v2.x')
    expect(html).toContain('v1.0.0')
    expect(html).toContain('v1.1.0')
    expect(html).toContain('v2.0.0')
  })

  it('shows empty state when no releases', async () => {
    mockedGetReleases.mockResolvedValue([])

    const tree = await RoadmapPage()
    const html = JSON.stringify(tree)

    expect(html).toContain('No milestones recorded yet.')
  })

  it('sets revalidate to 3600', () => {
    expect(revalidate).toBe(3600)
  })
})
