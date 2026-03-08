// ABOUTME: Tests for RSS 2.0 feed generation at /feed.xml.
// ABOUTME: Validates SITE-06: feed contains all content types with proper XML escaping.

jest.mock('@/lib/content', () => ({
  getSkills: () => [
    {
      slug: 'skills/ai-prompting',
      title: 'AI Prompting',
      excerpt: 'Learn AI prompting techniques for better results',
      order: 1,
    },
  ],
  getHooks: () => [
    {
      slug: 'hooks/pre-commit',
      title: 'Pre-Commit Hook',
      excerpt: 'Git pre-commit hook for code quality',
      order: 1,
    },
  ],
  getConfigs: () => [
    {
      slug: 'configs/eslint',
      title: 'ESLint Config',
      excerpt: 'Opinionated ESLint configuration',
      order: 1,
    },
  ],
  getGuides: () => [
    {
      slug: 'guides/monorepo-setup',
      title: 'Monorepo Setup',
      excerpt: 'Setting up a Turborepo monorepo',
      order: 1,
    },
  ],
  getPosts: () => [
    {
      slug: 'posts/newer-post',
      title: 'Newer Post',
      excerpt: 'A newer blog post about things',
      date: '2025-06-15',
    },
    {
      slug: 'posts/older-post',
      title: 'Older Post',
      excerpt: 'An older blog post about stuff',
      date: '2025-01-01',
    },
  ],
}))

import { GET } from '@/app/feed.xml/route'

describe('RSS feed', () => {
  let xml: string

  beforeAll(async () => {
    const response = await GET()
    xml = await response.text()
  })

  test('contains valid RSS channel with title, link, description', () => {
    expect(xml).toContain('<title>Blake Petersen</title>')
    expect(xml).toContain('<link>https://blakepetersen.io</link>')
    expect(xml).toContain('<description>AI-first DX practices, documented and applied</description>')
  })

  test('contains atom:self link', () => {
    expect(xml).toContain('atom:link')
    expect(xml).toContain('href="https://blakepetersen.io/feed.xml"')
  })

  test('contains items from all 5 content types', () => {
    expect(xml).toContain('AI Prompting')
    expect(xml).toContain('Pre-Commit Hook')
    expect(xml).toContain('ESLint Config')
    expect(xml).toContain('Monorepo Setup')
    expect(xml).toContain('Newer Post')
    expect(xml).toContain('Older Post')
  })

  test('each item has title, link, guid, description', () => {
    // Check one item has all required elements
    expect(xml).toContain('<link>https://blakepetersen.io/skills/ai-prompting</link>')
    expect(xml).toContain('<guid>https://blakepetersen.io/skills/ai-prompting</guid>')
    expect(xml).toContain('Learn AI prompting')
  })

  test('items are sorted with posts by date first, then DX content', () => {
    const newerIdx = xml.indexOf('Newer Post')
    const olderIdx = xml.indexOf('Older Post')
    const skillIdx = xml.indexOf('AI Prompting')
    // Posts sorted by date descending come first
    expect(newerIdx).toBeLessThan(olderIdx)
    // DX content comes after posts
    expect(olderIdx).toBeLessThan(skillIdx)
  })

  test('XML entities in title/description are properly escaped', async () => {
    // Test escapeXml directly
    const { escapeXml } = await import('@/lib/metadata')
    expect(escapeXml('Tom & Jerry')).toBe('Tom &amp; Jerry')
    expect(escapeXml('<script>')).toBe('&lt;script&gt;')
    expect(escapeXml('"quoted"')).toBe('&quot;quoted&quot;')
  })

  test('response has correct content type', async () => {
    const response = await GET()
    expect(response.headers.get('Content-Type')).toBe('application/rss+xml; charset=utf-8')
  })
})
