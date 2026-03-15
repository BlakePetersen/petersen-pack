// ABOUTME: Tests for dependency resolution with topological sorting.
// ABOUTME: Covers linear chains, diamonds, cycles, and missing dependency detection.
import { topologicalSort, findMissingDeps } from '@/deps'

describe('topologicalSort', () => {
  it('returns items in input order when no dependencies', () => {
    const nodes = new Map<string, string[]>([
      ['a', []],
      ['b', []],
      ['c', []],
    ])

    const result = topologicalSort(nodes)
    expect(result).toEqual(['a', 'b', 'c'])
  })

  it('returns dependency before dependent in linear chain', () => {
    const nodes = new Map<string, string[]>([
      ['c', ['b']],
      ['b', ['a']],
      ['a', []],
    ])

    const result = topologicalSort(nodes)
    const indexA = result.indexOf('a')
    const indexB = result.indexOf('b')
    const indexC = result.indexOf('c')
    expect(indexA).toBeLessThan(indexB)
    expect(indexB).toBeLessThan(indexC)
  })

  it('resolves diamond dependency correctly', () => {
    // d depends on b and c, both depend on a
    const nodes = new Map<string, string[]>([
      ['d', ['b', 'c']],
      ['b', ['a']],
      ['c', ['a']],
      ['a', []],
    ])

    const result = topologicalSort(nodes)
    const indexA = result.indexOf('a')
    const indexB = result.indexOf('b')
    const indexC = result.indexOf('c')
    const indexD = result.indexOf('d')
    expect(indexA).toBeLessThan(indexB)
    expect(indexA).toBeLessThan(indexC)
    expect(indexB).toBeLessThan(indexD)
    expect(indexC).toBeLessThan(indexD)
  })

  it('throws on circular dependencies', () => {
    const nodes = new Map<string, string[]>([
      ['a', ['b']],
      ['b', ['a']],
    ])

    expect(() => topologicalSort(nodes)).toThrow(/[Cc]ircular/)
  })

  it('handles single node with no dependencies', () => {
    const nodes = new Map<string, string[]>([['only', []]])
    expect(topologicalSort(nodes)).toEqual(['only'])
  })

  it('handles empty input', () => {
    const nodes = new Map<string, string[]>()
    expect(topologicalSort(nodes)).toEqual([])
  })
})

describe('findMissingDeps', () => {
  it('returns slugs not present in installed list', () => {
    const result = findMissingDeps(['a', 'b', 'c'], ['a'])
    expect(result).toEqual(['b', 'c'])
  })

  it('returns empty array when all deps installed', () => {
    const result = findMissingDeps(['a', 'b'], ['a', 'b', 'c'])
    expect(result).toEqual([])
  })

  it('returns empty array when no deps required', () => {
    const result = findMissingDeps([], ['a', 'b'])
    expect(result).toEqual([])
  })

  it('returns all deps when none installed', () => {
    const result = findMissingDeps(['a', 'b'], [])
    expect(result).toEqual(['a', 'b'])
  })
})
