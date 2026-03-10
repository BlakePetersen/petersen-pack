// ABOUTME: Unit tests for git history freshness label and relative date formatting.
// ABOUTME: Tests pure functions with fixed dates for deterministic results.

import { getFreshnessLabel, formatRelativeDate } from '../src/lib/git-history'

const MOCK_NOW = new Date('2026-03-10T12:00:00Z').getTime()

beforeEach(() => {
  jest.spyOn(Date, 'now').mockReturnValue(MOCK_NOW)
})

afterEach(() => {
  jest.restoreAllMocks()
})

function daysAgo(days: number): string {
  return new Date(MOCK_NOW - days * 86400000).toISOString()
}

describe('getFreshnessLabel', () => {
  it('returns "New" for single-commit content', () => {
    expect(getFreshnessLabel(1, daysAgo(5))).toBe('New')
  })

  it('returns "Actively maintained" for frequent recent updates', () => {
    expect(getFreshnessLabel(3, daysAgo(5))).toBe('Actively maintained')
  })

  it('returns "Recently updated" for content updated within 90 days', () => {
    expect(getFreshnessLabel(2, daysAgo(60))).toBe('Recently updated')
  })

  it('returns "Stable" for content not updated in a long time', () => {
    expect(getFreshnessLabel(5, daysAgo(180))).toBe('Stable')
  })

  it('returns "Actively maintained" for many commits and recent update', () => {
    expect(getFreshnessLabel(10, daysAgo(15))).toBe('Actively maintained')
  })
})

describe('formatRelativeDate', () => {
  it('returns "today" for current date', () => {
    expect(formatRelativeDate(daysAgo(0))).toBe('today')
  })

  it('returns "yesterday" for one day ago', () => {
    expect(formatRelativeDate(daysAgo(1))).toBe('yesterday')
  })

  it('returns "N days ago" for recent dates', () => {
    expect(formatRelativeDate(daysAgo(15))).toBe('15 days ago')
  })

  it('returns "1 month ago" for ~45 days', () => {
    expect(formatRelativeDate(daysAgo(45))).toBe('1 month ago')
  })

  it('returns "N months ago" for multiple months', () => {
    expect(formatRelativeDate(daysAgo(150))).toBe('5 months ago')
  })

  it('returns "1 year ago" for ~400 days', () => {
    expect(formatRelativeDate(daysAgo(400))).toBe('1 year ago')
  })

  it('returns "N years ago" for multiple years', () => {
    expect(formatRelativeDate(daysAgo(800))).toBe('2 years ago')
  })
})
