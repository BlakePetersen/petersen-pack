// ABOUTME: CalVer derivation utility for artifact versioning.
// ABOUTME: Generates calendar-based version strings (YYYY.MM.DD.N) from git commit dates.

import { execFileSync } from 'node:child_process'

/**
 * Derives a CalVer string from a date, tracking daily counters for uniqueness.
 * Pure function suitable for direct testing.
 */
export function calverFromDate(
  date: Date,
  dateCounters: Map<string, number>
): string {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  const dateKey = `${year}.${month}.${day}`

  const counter = dateCounters.get(dateKey) ?? 0
  dateCounters.set(dateKey, counter + 1)

  return `${dateKey}.${counter}`
}

/**
 * Derives a CalVer string for a file based on its git commit date.
 * Throws on git execution failure (not-a-repo, missing binary, shallow clone with no
 * usable history) — silently fabricating a date here gets persisted into the
 * .artifact-versions.json manifest and the hash gate locks the bogus version forever.
 * Returns today's date when git succeeds but the file is untracked (legitimate
 * freshly-added artifact path).
 */
export function deriveCalVer(
  filePath: string,
  dateCounters: Map<string, number>
): string {
  let lastModified: string
  try {
    lastModified = execFileSync(
      'git',
      ['log', '-1', '--follow', '--format=%cI', '--', filePath],
      { encoding: 'utf-8' }
    ).trim()
  } catch (err) {
    throw new Error(
      `deriveCalVer: git log failed for ${filePath}: ${err instanceof Error ? err.message : String(err)}`,
      { cause: err }
    )
  }
  const date = lastModified ? new Date(lastModified) : new Date()
  return calverFromDate(date, dateCounters)
}
