// ABOUTME: Tests for CalVer derivation utility.
// ABOUTME: Validates date-based versioning with daily counter support.

import { calverFromDate, deriveCalVer } from '../src/lib/calver'

describe('calverFromDate', () => {
  it('formats a date as YYYY.MM.DD.0 for first artifact of the day', () => {
    const counters = new Map<string, number>()
    const result = calverFromDate(new Date('2026-03-14T12:00:00Z'), counters)
    expect(result).toBe('2026.03.14.0')
  })

  it('increments daily counter for multiple artifacts on same day', () => {
    const counters = new Map<string, number>()
    const date = new Date('2026-03-14T12:00:00Z')

    const first = calverFromDate(date, counters)
    const second = calverFromDate(date, counters)
    const third = calverFromDate(date, counters)

    expect(first).toBe('2026.03.14.0')
    expect(second).toBe('2026.03.14.1')
    expect(third).toBe('2026.03.14.2')
  })

  it('tracks counters independently per date', () => {
    const counters = new Map<string, number>()
    const day1 = new Date('2026-03-14T12:00:00Z')
    const day2 = new Date('2026-03-15T12:00:00Z')

    calverFromDate(day1, counters)
    calverFromDate(day1, counters)
    const day2First = calverFromDate(day2, counters)

    expect(day2First).toBe('2026.03.15.0')
  })

  it('pads single-digit months and days with zeroes', () => {
    const counters = new Map<string, number>()
    const result = calverFromDate(new Date('2026-01-05T12:00:00Z'), counters)
    expect(result).toBe('2026.01.05.0')
  })
})

describe('deriveCalVer', () => {
  it('falls back to current date when git history has no meaningful date', () => {
    const counters = new Map<string, number>()
    // Pass a non-existent file path - should fall back gracefully
    const result = deriveCalVer(
      'nonexistent-file-that-does-not-exist.ts',
      counters
    )
    const today = new Date()
    const year = today.getUTCFullYear().toString()
    expect(result).toMatch(new RegExp(`^${year}\\.\\d{2}\\.\\d{2}\\.\\d+$`))
  })
})
