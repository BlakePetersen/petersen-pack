// ABOUTME: Git history extraction and content freshness label computation.
// ABOUTME: Provides build-time git log queries and pure functions for freshness display.

import { execFileSync } from 'node:child_process'

type GitHistory = {
  lastModified: string
  commitCount: number
}

/**
 * Extracts git history for a file path. Uses --follow to track renames.
 * Returns fallback values if git commands fail.
 */
function fallbackHistory(filePath: string, reason: string): GitHistory {
  // Shallow clones and non-git checkouts land here. The fabricated value
  // labels the entry "New (today)" — say so instead of lying silently.
  console.warn(
    `[git-history] no history for ${filePath} (${reason}) — using fallback freshness (today, 1 commit)`,
  )
  return { lastModified: new Date().toISOString(), commitCount: 1 }
}

export function getGitHistoryForFile(filePath: string): GitHistory {
  try {
    // One dated line per commit: first line is lastModified, line count is
    // commitCount — a single subprocess per file (was two plus a shell pipe).
    const dates = execFileSync(
      'git',
      ['log', '--follow', '--format=%cI', '--', filePath],
      { encoding: 'utf-8' },
    )
      .trim()
      .split('\n')
      .filter(Boolean)

    if (dates.length === 0) {
      return fallbackHistory(filePath, 'no commits found')
    }

    return { lastModified: dates[0], commitCount: dates.length }
  } catch (err) {
    return fallbackHistory(filePath, err instanceof Error ? err.message : 'git failed')
  }
}

/**
 * Returns a human-readable freshness label based on commit history.
 * - "New": single commit (just created)
 * - "Actively maintained": 3+ commits and updated within 30 days
 * - "Recently updated": updated within 90 days
 * - "Stable": not updated recently
 */
export function getFreshnessLabel(commitCount: number, lastModified: string): string {
  if (commitCount <= 1) return 'New'

  const daysSince = Math.floor(
    (Date.now() - new Date(lastModified).getTime()) / 86400000,
  )

  if (daysSince <= 30 && commitCount >= 3) return 'Actively maintained'
  if (daysSince <= 90) return 'Recently updated'
  return 'Stable'
}

/**
 * Formats an ISO date string as a relative time description.
 * Returns "today", "yesterday", "N days ago", "N months ago", or "N years ago".
 */
export function formatRelativeDate(isoDate: string): string {
  const days = Math.floor(
    (Date.now() - new Date(isoDate).getTime()) / 86400000,
  )

  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 30) return `${days} days ago`

  const months = Math.floor(days / 30)
  if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`

  const years = Math.floor(days / 365)
  return `${years} year${years === 1 ? '' : 's'} ago`
}
