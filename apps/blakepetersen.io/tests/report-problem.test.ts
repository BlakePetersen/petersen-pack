// ABOUTME: Tests for the report-problem-link URL builder.
// ABOUTME: Validates COMM-04: pre-filled GitHub issue URL with correct template and parameters.

import { buildReportUrl } from '@/components/report-problem-link'

describe('buildReportUrl (COMM-04)', () => {
  const pageTitle = 'My Cool Skill'
  const pageUrl = 'https://blakepetersen.io/skills/my-cool-skill'

  test('returns URL starting with GitHub issues/new endpoint', () => {
    const url = buildReportUrl(pageTitle, pageUrl)
    expect(url).toMatch(
      /^https:\/\/github\.com\/BlakePetersen\/petersen-pack\/issues\/new/,
    )
  })

  test('URL contains template=content-issue.yml parameter', () => {
    const url = buildReportUrl(pageTitle, pageUrl)
    const parsed = new URL(url)
    expect(parsed.searchParams.get('template')).toBe('content-issue.yml')
  })

  test('URL contains title with "Content issue: {pageTitle}" format', () => {
    const url = buildReportUrl(pageTitle, pageUrl)
    const parsed = new URL(url)
    expect(parsed.searchParams.get('title')).toBe(
      `Content issue: ${pageTitle}`,
    )
  })

  test('URL contains page-url parameter matching provided pageUrl', () => {
    const url = buildReportUrl(pageTitle, pageUrl)
    const parsed = new URL(url)
    expect(parsed.searchParams.get('page-url')).toBe(pageUrl)
  })

  test('URL contains labels=content parameter', () => {
    const url = buildReportUrl(pageTitle, pageUrl)
    const parsed = new URL(url)
    expect(parsed.searchParams.get('labels')).toBe('content')
  })
})
