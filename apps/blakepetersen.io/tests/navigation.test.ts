// ABOUTME: Tests for navigation data helpers used by sidebar and prev/next links.
// ABOUTME: Validates section building, item ordering, and prev/next boundary behavior.

import { buildNavSections, getPrevNext, type NavItem } from '@/lib/navigation'

// Mock the content module
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
    { slug: 'configs/prettier', title: 'Prettier Config', order: 2 },
  ],
  getGuides: () => [
    { slug: 'guides/monorepo-setup', title: 'Monorepo Setup', order: 1 },
  ],
  getPosts: () => [
    { slug: 'posts/newer-post', title: 'Newer Post', date: '2025-06-15' },
    { slug: 'posts/older-post', title: 'Older Post', date: '2025-01-01' },
  ],
}))

describe('buildNavSections', () => {
  it('returns 6 sections with correct labels and hrefs', () => {
    const sections = buildNavSections()

    expect(sections).toHaveLength(6)
    expect(sections.map((s) => s.label)).toEqual([
      'Skills',
      'Hooks',
      'Configs',
      'Guides',
      'Posts',
      'Project',
    ])
    expect(sections.map((s) => s.href)).toEqual([
      '/skills',
      '/hooks',
      '/configs',
      '/guides',
      '/posts',
      '/changelog',
    ])
  })

  it('strips collection prefix from item href', () => {
    const sections = buildNavSections()
    const skills = sections[0]

    // Items should have href like /skills/ai-prompting, not /skills/skills/ai-prompting
    expect(skills.items[0].href).toBe('/skills/ai-prompting')
    expect(skills.items[1].href).toBe('/skills/cursor-rules')
  })

  it('preserves DX collection order from content.ts', () => {
    const sections = buildNavSections()
    const skills = sections[0]

    // content.ts already sorts by order, so buildNavSections preserves that
    expect(skills.items[0].title).toBe('AI Prompting')
    expect(skills.items[1].title).toBe('Cursor Rules')
  })

  it('sorts posts newest first', () => {
    const sections = buildNavSections()
    const posts = sections[4]

    // getPosts() already returns newest first
    expect(posts.items[0].title).toBe('Newer Post')
    expect(posts.items[1].title).toBe('Older Post')
  })
})

describe('getPrevNext', () => {
  const items: NavItem[] = [
    { title: 'First', slug: 'a', href: '/skills/a' },
    { title: 'Second', slug: 'b', href: '/skills/b' },
    { title: 'Third', slug: 'c', href: '/skills/c' },
  ]

  it('returns prev and next for a middle item', () => {
    const result = getPrevNext(items, '/skills/b')
    expect(result.prev).toEqual(items[0])
    expect(result.next).toEqual(items[2])
  })

  it('returns prev=null for the first item', () => {
    const result = getPrevNext(items, '/skills/a')
    expect(result.prev).toBeNull()
    expect(result.next).toEqual(items[1])
  })

  it('returns next=null for the last item', () => {
    const result = getPrevNext(items, '/skills/c')
    expect(result.prev).toEqual(items[1])
    expect(result.next).toBeNull()
  })

  it('returns both null when href not found', () => {
    const result = getPrevNext(items, '/skills/unknown')
    expect(result.prev).toBeNull()
    expect(result.next).toBeNull()
  })
})
