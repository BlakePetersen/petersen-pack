// ABOUTME: CalVer derivation utility for artifact versioning.
// ABOUTME: Generates calendar-based version strings (YYYY.MM.DD.N) from git commit dates.

import { getGitHistoryForFile } from './git-history'

/**
 * Derives a CalVer string from a date, tracking daily counters for uniqueness.
 * Pure function suitable for direct testing.
 */
export function calverFromDate(date: Date, dateCounters: Map<string, number>): string {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  const dateKey = `${year}.${month}.${day}`

  const counter = dateCounters.get(dateKey) ?? 0
  dateCounters.set(dateKey, counter + 1)

  return `${dateKey}.${counter}`
}

/**
 * Derives a CalVer string for a file based on its git history.
 * Falls back to the current date if the file has no git history.
 */
export function deriveCalVer(filePath: string, dateCounters: Map<string, number>): string {
  const history = getGitHistoryForFile(filePath)
  const date = new Date(history.lastModified)
  return calverFromDate(date, dateCounters)
}
