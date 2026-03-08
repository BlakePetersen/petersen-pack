// ABOUTME: Tests for JSON-LD structured data generation helpers.
// ABOUTME: Validates TechArticle and BreadcrumbList schema.org output.

jest.mock('@/components/breadcrumbs', () => ({
  buildBreadcrumbs: (pathname: string) => {
    const segments = pathname.split('/').filter(Boolean)
    if (segments.length < 2) return []
    return segments.map((segment: string, index: number) => ({
      label: segment.replace(/-/g, ' '),
      href: '/' + segments.slice(0, index + 1).join('/'),
    }))
  },
}))

import { buildArticleJsonLd, buildBreadcrumbJsonLd } from '@/lib/metadata'

describe('buildArticleJsonLd', () => {
  test('returns TechArticle with correct headline', () => {
    const item = {
      title: 'My Skill',
      description: 'A great skill',
      slug: 'skills/my-skill',
    }
    const result = buildArticleJsonLd(item, 'skills')
    expect(result['@type']).toBe('TechArticle')
    expect(result.headline).toBe('My Skill')
  })

  test('includes author as Person with name', () => {
    const item = {
      title: 'My Skill',
      description: 'A great skill',
      slug: 'skills/my-skill',
    }
    const result = buildArticleJsonLd(item, 'skills')
    expect(result.author).toEqual({
      '@type': 'Person',
      name: 'Blake Petersen',
    })
  })

  test('includes datePublished when date is present', () => {
    const item = {
      title: 'My Post',
      description: 'A post',
      slug: 'posts/hello-world',
      date: '2025-06-15',
    }
    const result = buildArticleJsonLd(item, 'posts')
    expect(result.datePublished).toBe('2025-06-15')
  })

  test('omits datePublished when date is not present', () => {
    const item = {
      title: 'My Skill',
      description: 'A great skill',
      slug: 'skills/my-skill',
    }
    const result = buildArticleJsonLd(item, 'skills')
    expect(result).not.toHaveProperty('datePublished')
  })

  test('uses excerpt for description when available', () => {
    const item = {
      title: 'My Skill',
      description: 'Full description',
      excerpt: 'Short excerpt',
      slug: 'skills/my-skill',
    }
    const result = buildArticleJsonLd(item, 'skills')
    expect(result.description).toBe('Short excerpt')
  })
})

describe('buildBreadcrumbJsonLd', () => {
  test('returns BreadcrumbList type', () => {
    const result = buildBreadcrumbJsonLd('/skills/my-skill')
    expect(result['@type']).toBe('BreadcrumbList')
    expect(result['@context']).toBe('https://schema.org')
  })

  test('generates correct list items from pathname', () => {
    const result = buildBreadcrumbJsonLd('/skills/my-skill')
    const items = result.itemListElement
    expect(Array.isArray(items)).toBe(true)
    const arr = items as Array<{
      '@type': string
      position: number
      name: string
      item: string
    }>
    expect(arr).toHaveLength(2)
    expect(arr[0]).toMatchObject({
      '@type': 'ListItem',
      position: 1,
      name: 'skills',
      item: 'https://blakepetersen.io/skills',
    })
    expect(arr[1]).toMatchObject({
      '@type': 'ListItem',
      position: 2,
      name: 'my skill',
      item: 'https://blakepetersen.io/skills/my-skill',
    })
  })
})
