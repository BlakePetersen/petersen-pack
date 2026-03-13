// ABOUTME: Tests for sitemap generation and metadata helper functions.
// ABOUTME: Validates SITE-05: sitemap covers all content URLs with canonical domain.

jest.mock('@/lib/content', () => ({
  getSkills: () => [
    { slug: 'skills/ai-prompting', title: 'AI Prompting', order: 1 },
    { slug: 'skills/cursor-rules', title: 'Cursor Rules', order: 2 },
  ],
  getHooks: () => [
    { slug: 'hooks/pre-commit', title: 'Pre-Commit Hook', order: 1 },
  ],
  getConfigs: () => [
    { slug: 'configs/eslint', title: 'ESLint Config', order: 1 },
  ],
  getGuides: () => [
    { slug: 'guides/monorepo-setup', title: 'Monorepo Setup', order: 1 },
  ],
  getPosts: () => [
    { slug: 'posts/newer-post', title: 'Newer Post', date: '2025-06-15' },
    { slug: 'posts/older-post', title: 'Older Post', date: '2025-01-01' },
  ],
  getAllGitHistory: () => ({
    'skills/ai-prompting': { lastModified: '2025-06-01T00:00:00Z' },
    'skills/cursor-rules': { lastModified: '2025-05-15T00:00:00Z' },
    'hooks/pre-commit': { lastModified: '2025-04-20T00:00:00Z' },
    'configs/eslint': { lastModified: '2025-03-10T00:00:00Z' },
    'guides/monorepo-setup': { lastModified: '2025-02-28T00:00:00Z' },
    'posts/newer-post': { lastModified: '2025-06-15T00:00:00Z' },
    'posts/older-post': { lastModified: '2025-01-01T00:00:00Z' },
  }),
}))

import sitemap from '@/app/sitemap'
import { buildMetadata } from '@/lib/metadata'

describe('sitemap', () => {
  test('returns entries for homepage and 5 listing pages', () => {
    const entries = sitemap()
    const urls = entries.map((e) => e.url)
    expect(urls).toContain('https://blakepetersen.io')
    expect(urls).toContain('https://blakepetersen.io/skills')
    expect(urls).toContain('https://blakepetersen.io/hooks')
    expect(urls).toContain('https://blakepetersen.io/configs')
    expect(urls).toContain('https://blakepetersen.io/guides')
    expect(urls).toContain('https://blakepetersen.io/posts')
  })

  test('returns entries for all content items', () => {
    const entries = sitemap()
    // 6 static pages + 7 content items = 13
    expect(entries.length).toBe(13)
  })

  test('all URLs use https://blakepetersen.io canonical domain', () => {
    const entries = sitemap()
    for (const entry of entries) {
      expect(entry.url).toMatch(/^https:\/\/blakepetersen\.io/)
    }
  })

  test('entries have lastModified dates', () => {
    const entries = sitemap()
    for (const entry of entries) {
      expect(entry.lastModified).toBeInstanceOf(Date)
    }
  })
})

describe('metadata helpers', () => {
  test('produces correct title, description, canonical URL from content item', () => {
    const item = {
      title: 'My Skill',
      description: 'A great skill',
      excerpt: 'Short excerpt',
      slug: 'skills/my-skill',
      seo_title: 'SEO Title Override',
      seo_description: 'SEO description override',
    }
    const result = buildMetadata(item, 'skills')
    expect(result.title).toBe('SEO Title Override')
    expect(result.description).toBe('SEO description override')
    expect(result.alternates.canonical).toBe('https://blakepetersen.io/skills/my-skill')
  })

  test('falls back to content title when seo_title not present', () => {
    const item = {
      title: 'My Skill',
      description: 'A great skill',
      excerpt: 'Short excerpt',
      slug: 'skills/my-skill',
    }
    const result = buildMetadata(item, 'skills')
    expect(result.title).toBe('My Skill')
    expect(result.description).toBe('Short excerpt')
  })
})
