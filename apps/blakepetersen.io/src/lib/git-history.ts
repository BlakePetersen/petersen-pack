// ABOUTME: Git history extraction and content freshness label computation.
// ABOUTME: Provides build-time git log queries and pure functions for freshness display.

import { execSync } from 'node:child_process'

type GitHistory = {
  lastModified: string
  commitCount: number
}

/**
 * Extracts git history for a file path. Uses --follow to track renames.
 * Returns fallback values if git commands fail.
 */
export function getGitHistoryForFile(filePath: string): GitHistory {
  try {
    const lastModified = execSync(
      `git log -1 --follow --format=%cI -- "${filePath}"`,
      { encoding: 'utf-8' },
    ).trim()

    const commitCount = parseInt(
      execSync(
        `git rev-list --count --follow HEAD -- "${filePath}"`,
        { encoding: 'utf-8' },
      ).trim(),
      10,
    )

    if (!lastModified || isNaN(commitCount)) {
      return { lastModified: new Date().toISOString(), commitCount: 1 }
    }

    return { lastModified, commitCount }
  } catch {
    return { lastModified: new Date().toISOString(), commitCount: 1 }
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
