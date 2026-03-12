// ABOUTME: Tests for the GitHub API client module.
// ABOUTME: Validates getReleases, getContributors, getContributorStats behavior.

describe('lib/github', () => {
  describe('getReleases', () => {
    it.todo('returns releases sorted newest first by publishedAt')
    it.todo('filters out pre-release entries')
    it.todo('filters out draft releases')
    it.todo('returns empty array when API call fails')
    it.todo('returns empty array when GITHUB_TOKEN is missing')
    it.todo('maps API response to Release type')
  })

  describe('getContributors', () => {
    it.todo('returns contributors sorted by contribution count')
    it.todo('detects bots via type field')
    it.todo('detects bots via [bot] suffix fallback')
    it.todo('returns empty array on API failure')
  })

  describe('getContributorStats', () => {
    it.todo('computes totalAdditions and totalDeletions from weekly data')
    it.todo('derives firstContribution and lastContribution dates')
    it.todo('retries on 202 response up to 3 times')
    it.todo('returns empty array after max retries')
  })
})
