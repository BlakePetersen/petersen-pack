// ABOUTME: Tests verifying component count accuracy derived from artax-ui exports.
// ABOUTME: Snapshot-style assertions that fail if artax-ui adds/removes components.

import { getComponentCounts } from '@/lib/component-counts'

describe('getComponentCounts', () => {
  const counts = getComponentCounts()

  it('returns atoms count of 6', () => {
    expect(counts.atoms).toBe(6)
  })

  it('returns molecules count of 9', () => {
    expect(counts.molecules).toBe(9)
  })

  it('returns organisms count of 4', () => {
    expect(counts.organisms).toBe(4)
  })

  it('returns total equal to sum of all tiers', () => {
    expect(counts.total).toBe(counts.atoms + counts.molecules + counts.organisms)
  })

  it('returns total of 19', () => {
    expect(counts.total).toBe(19)
  })
})
