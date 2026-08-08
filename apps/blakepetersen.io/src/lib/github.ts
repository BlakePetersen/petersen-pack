// ABOUTME: Shared GitHub API client with typed functions for release, contributor, and stats data.
// ABOUTME: Centralizes authentication, error handling, and response mapping for all GitHub data pages.

import { Octokit } from '@octokit/rest'

const OWNER = 'blakepetersen'
const REPO = 'petersen-group'

function getOctokit(): Octokit | null {
  const token = process.env.GITHUB_TOKEN
  if (!token) {
    console.warn(
      '[github] GITHUB_TOKEN is not set — API calls will return empty results'
    )
    return null
  }
  return new Octokit({ auth: token })
}

export type Release = {
  tagName: string
  name: string | null
  body: string
  publishedAt: string
  htmlUrl: string
}

export type Contributor = {
  login: string
  avatarUrl: string
  htmlUrl: string
  contributions: number
  isBot: boolean
}

export type ContributorStats = {
  login: string
  avatarUrl: string
  htmlUrl: string
  totalCommits: number
  totalAdditions: number
  totalDeletions: number
  isBot: boolean
  firstContribution: string | null
  lastContribution: string | null
}

export async function getReleases(): Promise<Release[]> {
  const octokit = getOctokit()
  if (!octokit) return []

  try {
    const { data } = await octokit.rest.repos.listReleases({
      owner: OWNER,
      repo: REPO,
      per_page: 100
    })

    return data
      .filter(r => !r.prerelease && !r.draft)
      .sort((a, b) => {
        const dateA = a.published_at ?? ''
        const dateB = b.published_at ?? ''
        return dateB.localeCompare(dateA)
      })
      .map(r => ({
        tagName: r.tag_name,
        name: r.name,
        body: r.body ?? '',
        publishedAt: r.published_at ?? '',
        htmlUrl: r.html_url
      }))
  } catch (error) {
    console.error('[github] Failed to fetch releases:', error)
    return []
  }
}

function isBot(login: string, type?: string): boolean {
  if (type === 'Bot') return true
  return login.endsWith('[bot]')
}

export async function getContributors(): Promise<Contributor[]> {
  const octokit = getOctokit()
  if (!octokit) return []

  try {
    const { data } = await octokit.rest.repos.listContributors({
      owner: OWNER,
      repo: REPO,
      per_page: 100
    })

    return data
      .sort((a, b) => (b.contributions ?? 0) - (a.contributions ?? 0))
      .map(c => ({
        login: c.login ?? '',
        avatarUrl: c.avatar_url ?? '',
        htmlUrl: c.html_url ?? '',
        contributions: c.contributions ?? 0,
        isBot: isBot(c.login ?? '', c.type ?? undefined)
      }))
  } catch (error) {
    console.error('[github] Failed to fetch contributors:', error)
    return []
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function getContributorStats(): Promise<ContributorStats[]> {
  const octokit = getOctokit()
  if (!octokit) return []

  const contributors = await getContributors()
  const contributorMap = new Map(contributors.map(c => [c.login, c]))

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await octokit.rest.repos.getContributorsStats({
        owner: OWNER,
        repo: REPO
      })

      // GitHub returns 202 while computing stats — retry after delay
      if (response.status === 202) {
        await sleep(2000)
        continue
      }

      const data = response.data as Array<{
        author: { login: string }
        total: number
        weeks: Array<{ w: number; a: number; d: number; c: number }>
      }>

      return data
        .map(entry => {
          const login = entry.author.login
          const contributor = contributorMap.get(login)
          const nonZeroWeeks = entry.weeks.filter(w => w.c > 0)
          const firstWeek = nonZeroWeeks.length > 0 ? nonZeroWeeks[0] : null
          const lastWeek =
            nonZeroWeeks.length > 0
              ? nonZeroWeeks[nonZeroWeeks.length - 1]
              : null

          return {
            login,
            avatarUrl: contributor?.avatarUrl ?? '',
            htmlUrl: contributor?.htmlUrl ?? '',
            totalCommits: entry.total,
            totalAdditions: entry.weeks.reduce((sum, w) => sum + w.a, 0),
            totalDeletions: entry.weeks.reduce((sum, w) => sum + w.d, 0),
            isBot: contributor?.isBot ?? isBot(login),
            firstContribution: firstWeek
              ? new Date(firstWeek.w * 1000).toISOString()
              : null,
            lastContribution: lastWeek
              ? new Date(lastWeek.w * 1000).toISOString()
              : null
          }
        })
        .sort((a, b) => b.totalCommits - a.totalCommits)
    } catch (error) {
      console.error('[github] Failed to fetch contributor stats:', error)
      return []
    }
  }

  console.warn('[github] Contributor stats still computing after 3 retries')
  return []
}
