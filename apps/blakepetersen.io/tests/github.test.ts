// ABOUTME: Tests for the GitHub API client module.
// ABOUTME: Validates getReleases, getContributors, getContributorStats behavior.

import { getReleases, getContributors, getContributorStats } from '@/lib/github'

const mockListReleases = jest.fn()
const mockListContributors = jest.fn()
const mockGetContributorsStats = jest.fn()

jest.mock('@octokit/rest', () => ({
  Octokit: jest.fn().mockImplementation(() => ({
    rest: {
      repos: {
        listReleases: mockListReleases,
        listContributors: mockListContributors,
        getContributorsStats: mockGetContributorsStats,
      },
    },
  })),
}))

beforeEach(() => {
  process.env.GITHUB_TOKEN = 'test-token'
  jest.clearAllMocks()
})

afterEach(() => {
  jest.restoreAllMocks()
})

function makeRelease(overrides: Record<string, unknown> = {}) {
  return {
    tag_name: 'v1.0.0',
    name: 'Release 1.0.0',
    body: 'Release notes',
    published_at: '2026-01-01T00:00:00Z',
    html_url: 'https://github.com/blakepetersen/petersen-group/releases/tag/v1.0.0',
    prerelease: false,
    draft: false,
    ...overrides,
  }
}

function makeContributor(overrides: Record<string, unknown> = {}) {
  return {
    login: 'alice',
    avatar_url: 'https://avatars.example.com/alice',
    html_url: 'https://github.com/alice',
    contributions: 10,
    type: 'User',
    ...overrides,
  }
}

describe('lib/github', () => {
  describe('getReleases', () => {
    it('returns releases sorted newest first by publishedAt', async () => {
      mockListReleases.mockResolvedValue({
        data: [
          makeRelease({ tag_name: 'v1.0.0', published_at: '2026-01-01T00:00:00Z' }),
          makeRelease({ tag_name: 'v3.0.0', published_at: '2026-03-01T00:00:00Z' }),
          makeRelease({ tag_name: 'v2.0.0', published_at: '2026-02-01T00:00:00Z' }),
        ],
      })

      const releases = await getReleases()

      expect(releases).toHaveLength(3)
      expect(releases[0].tagName).toBe('v3.0.0')
      expect(releases[1].tagName).toBe('v2.0.0')
      expect(releases[2].tagName).toBe('v1.0.0')
    })

    it('filters out pre-release entries', async () => {
      mockListReleases.mockResolvedValue({
        data: [
          makeRelease({ tag_name: 'v1.0.0' }),
          makeRelease({ tag_name: 'v2.0.0-beta', prerelease: true }),
        ],
      })

      const releases = await getReleases()

      expect(releases).toHaveLength(1)
      expect(releases[0].tagName).toBe('v1.0.0')
    })

    it('filters out draft releases', async () => {
      mockListReleases.mockResolvedValue({
        data: [
          makeRelease({ tag_name: 'v1.0.0' }),
          makeRelease({ tag_name: 'v2.0.0-draft', draft: true }),
        ],
      })

      const releases = await getReleases()

      expect(releases).toHaveLength(1)
      expect(releases[0].tagName).toBe('v1.0.0')
    })

    it('returns empty array when API call fails', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => {})
      mockListReleases.mockRejectedValue(new Error('API error'))

      const releases = await getReleases()

      expect(releases).toEqual([])
      expect(console.error).toHaveBeenCalledWith(
        '[github] Failed to fetch releases:',
        expect.any(Error),
      )
    })

    it('returns empty array when GITHUB_TOKEN is missing', async () => {
      jest.spyOn(console, 'warn').mockImplementation(() => {})
      delete process.env.GITHUB_TOKEN

      const releases = await getReleases()

      expect(releases).toEqual([])
      expect(console.warn).toHaveBeenCalledWith(
        '[github] GITHUB_TOKEN is not set — API calls will return empty results',
      )
    })

    it('maps API response to Release type', async () => {
      mockListReleases.mockResolvedValue({
        data: [
          makeRelease({
            tag_name: 'v5.0.0',
            name: 'Fifth Release',
            body: 'Big update',
            published_at: '2026-05-15T12:00:00Z',
            html_url: 'https://github.com/blakepetersen/petersen-group/releases/tag/v5.0.0',
          }),
        ],
      })

      const releases = await getReleases()

      expect(releases).toHaveLength(1)
      expect(releases[0]).toEqual({
        tagName: 'v5.0.0',
        name: 'Fifth Release',
        body: 'Big update',
        publishedAt: '2026-05-15T12:00:00Z',
        htmlUrl: 'https://github.com/blakepetersen/petersen-group/releases/tag/v5.0.0',
      })
    })
  })

  describe('getContributors', () => {
    it('returns contributors sorted by contribution count', async () => {
      mockListContributors.mockResolvedValue({
        data: [
          makeContributor({ login: 'alice', contributions: 5 }),
          makeContributor({ login: 'charlie', contributions: 50 }),
          makeContributor({ login: 'bob', contributions: 20 }),
        ],
      })

      const contributors = await getContributors()

      expect(contributors).toHaveLength(3)
      expect(contributors[0].login).toBe('charlie')
      expect(contributors[1].login).toBe('bob')
      expect(contributors[2].login).toBe('alice')
    })

    it('detects bots via type field', async () => {
      mockListContributors.mockResolvedValue({
        data: [
          makeContributor({ login: 'dependabot', type: 'Bot', contributions: 10 }),
        ],
      })

      const contributors = await getContributors()

      expect(contributors).toHaveLength(1)
      expect(contributors[0].isBot).toBe(true)
    })

    it('detects bots via [bot] suffix fallback', async () => {
      mockListContributors.mockResolvedValue({
        data: [
          makeContributor({ login: 'renovate[bot]', type: 'User', contributions: 8 }),
        ],
      })

      const contributors = await getContributors()

      expect(contributors).toHaveLength(1)
      expect(contributors[0].isBot).toBe(true)
    })

    it('returns empty array on API failure', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => {})
      mockListContributors.mockRejectedValue(new Error('Network error'))

      const contributors = await getContributors()

      expect(contributors).toEqual([])
      expect(console.error).toHaveBeenCalledWith(
        '[github] Failed to fetch contributors:',
        expect.any(Error),
      )
    })
  })

  describe('getContributorStats', () => {
    function setupContributorStatsTest() {
      mockListContributors.mockResolvedValue({
        data: [
          makeContributor({ login: 'alice', contributions: 30 }),
        ],
      })
    }

    it('computes totalAdditions and totalDeletions from weekly data', async () => {
      setupContributorStatsTest()
      mockGetContributorsStats.mockResolvedValue({
        status: 200,
        data: [
          {
            author: { login: 'alice' },
            total: 30,
            weeks: [
              { w: 1704067200, a: 100, d: 20, c: 5 },
              { w: 1704672000, a: 200, d: 30, c: 10 },
              { w: 1705276800, a: 50, d: 10, c: 0 },
            ],
          },
        ],
      })

      const stats = await getContributorStats()

      expect(stats).toHaveLength(1)
      expect(stats[0].totalAdditions).toBe(350)
      expect(stats[0].totalDeletions).toBe(60)
    })

    it('derives firstContribution and lastContribution dates', async () => {
      setupContributorStatsTest()
      const week1Timestamp = 1704067200 // 2024-01-01T00:00:00Z
      const week2Timestamp = 1704672000 // 2024-01-08T00:00:00Z
      const week3Timestamp = 1705276800 // 2024-01-15T00:00:00Z

      mockGetContributorsStats.mockResolvedValue({
        status: 200,
        data: [
          {
            author: { login: 'alice' },
            total: 10,
            weeks: [
              { w: week1Timestamp, a: 0, d: 0, c: 0 },
              { w: week2Timestamp, a: 50, d: 10, c: 3 },
              { w: week3Timestamp, a: 20, d: 5, c: 7 },
            ],
          },
        ],
      })

      const stats = await getContributorStats()

      expect(stats).toHaveLength(1)
      expect(stats[0].firstContribution).toBe(new Date(week2Timestamp * 1000).toISOString())
      expect(stats[0].lastContribution).toBe(new Date(week3Timestamp * 1000).toISOString())
    })

    it('retries on 202 response up to 3 times', async () => {
      jest.useFakeTimers()
      jest.spyOn(console, 'warn').mockImplementation(() => {})
      setupContributorStatsTest()

      mockGetContributorsStats.mockResolvedValue({ status: 202, data: [] })

      const promise = getContributorStats()

      // Advance through all 3 retry sleep(2000) calls
      for (let i = 0; i < 3; i++) {
        await jest.advanceTimersByTimeAsync(2000)
      }

      const stats = await promise

      expect(mockGetContributorsStats).toHaveBeenCalledTimes(3)
      expect(stats).toEqual([])

      jest.useRealTimers()
    })

    it('returns empty array after max retries', async () => {
      jest.useFakeTimers()
      jest.spyOn(console, 'warn').mockImplementation(() => {})
      setupContributorStatsTest()

      mockGetContributorsStats.mockResolvedValue({ status: 202, data: [] })

      const promise = getContributorStats()

      for (let i = 0; i < 3; i++) {
        await jest.advanceTimersByTimeAsync(2000)
      }

      const stats = await promise

      expect(stats).toEqual([])
      expect(console.warn).toHaveBeenCalledWith(
        '[github] Contributor stats still computing after 3 retries',
      )

      jest.useRealTimers()
    })
  })
})
