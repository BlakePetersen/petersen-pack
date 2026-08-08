// ABOUTME: Unit tests for searchContent dev-mode fallback and result shaping.
// ABOUTME: Verifies Pagefind lazy loading, error handling, and result cap behavior.

import { searchContent, type SearchResult } from '@/lib/search'

// Mock the dynamic import of pagefind
let mockPagefind: {
  search: jest.Mock
} | null = null

jest.mock(
  '/pagefind/pagefind.js',
  () => {
    if (!mockPagefind) {
      throw new Error('Pagefind not available')
    }
    return mockPagefind
  },
  { virtual: true }
)

describe('searchContent', () => {
  beforeEach(() => {
    mockPagefind = null
    // Reset the cached pagefind instance between tests
    jest.resetModules()
  })

  it('returns empty array when Pagefind is unavailable (dev-mode fallback)', async () => {
    mockPagefind = null
    const { searchContent: search } = await import('@/lib/search')
    const results = await search('test query')
    expect(results).toEqual([])
  })

  it('returns shaped SearchResult[] when Pagefind resolves results', async () => {
    mockPagefind = {
      search: jest.fn().mockResolvedValue({
        results: [
          {
            id: '1',
            data: jest.fn().mockResolvedValue({
              url: '/skills/typescript',
              title: 'TypeScript',
              excerpt: 'A <mark>typed</mark> language',
              meta: { category: 'skills' }
            })
          },
          {
            id: '2',
            data: jest.fn().mockResolvedValue({
              url: '/hooks/use-state',
              title: 'useState',
              excerpt: 'React <mark>state</mark> hook',
              meta: { category: 'hooks' }
            })
          }
        ]
      })
    }

    const { searchContent: search } = await import('@/lib/search')
    const results = await search('test')

    expect(results).toHaveLength(2)
    expect(results[0]).toEqual({
      url: '/skills/typescript',
      title: 'TypeScript',
      excerpt: 'A <mark>typed</mark> language',
      meta: { category: 'skills' }
    })
    expect(results[1]).toEqual({
      url: '/hooks/use-state',
      title: 'useState',
      excerpt: 'React <mark>state</mark> hook',
      meta: { category: 'hooks' }
    })
  })

  it('SearchResult type has url, title, excerpt, meta fields', async () => {
    const result: SearchResult = {
      url: '/test',
      title: 'Test',
      excerpt: 'excerpt',
      meta: { key: 'value' }
    }
    expect(result.url).toBe('/test')
    expect(result.title).toBe('Test')
    expect(result.excerpt).toBe('excerpt')
    expect(result.meta).toEqual({ key: 'value' })
  })

  it('limits results to top 20', async () => {
    const manyResults = Array.from({ length: 30 }, (_, i) => ({
      id: String(i),
      data: jest.fn().mockResolvedValue({
        url: `/page-${i}`,
        title: `Page ${i}`,
        excerpt: `Excerpt ${i}`,
        meta: {}
      })
    }))

    mockPagefind = {
      search: jest.fn().mockResolvedValue({ results: manyResults })
    }

    const { searchContent: search } = await import('@/lib/search')
    const results = await search('test')

    expect(results).toHaveLength(20)
  })
})
