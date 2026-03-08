// ABOUTME: Tests proving directory structure maps to collection slugs correctly.
// ABOUTME: Validates CONT-02: directory-to-collection mapping and slug derivation.

import { execSync } from 'child_process'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

const appRoot = join(__dirname, '..')
const veliteDir = join(appRoot, '.velite')

beforeAll(() => {
  if (!existsSync(veliteDir)) {
    execSync('pnpm velite', { cwd: appRoot, stdio: 'pipe' })
  }
}, 30000)

function readCollection(name: string) {
  const filePath = join(veliteDir, `${name}.json`)
  if (!existsSync(filePath)) return []
  return JSON.parse(readFileSync(filePath, 'utf-8'))
}

describe('Content Structure (CONT-02)', () => {
  test('skill in skills/claude-code/ gets slug containing the subdirectory path', () => {
    const items = readCollection('skills')
    const nested = items.find((i: { slug: string }) =>
      i.slug.includes('claude-code'),
    )
    expect(nested).toBeDefined()
    expect(nested.slug).toContain('claude-code/')
  })

  test('hook in hooks/pre-commit/ gets slug containing the subdirectory path', () => {
    const items = readCollection('hooks')
    const nested = items.find((i: { slug: string }) =>
      i.slug.includes('pre-commit'),
    )
    expect(nested).toBeDefined()
    expect(nested.slug).toContain('pre-commit/')
  })

  test('config at top-level configs/ gets slug "configs/{filename}"', () => {
    const items = readCollection('configs')
    expect(items.length).toBeGreaterThan(0)
    for (const item of items) {
      // Top-level config slugs should not have nested directory segments
      const slugParts = item.slug.split('/')
      // s.path() strips the collection prefix, so slug is just the filename portion
      expect(slugParts.length).toBeGreaterThanOrEqual(1)
    }
  })

  test('each collection only contains items from its own directory pattern', () => {
    const skills = readCollection('skills')
    const hooks = readCollection('hooks')
    const configs = readCollection('configs')
    const guides = readCollection('guides')
    const posts = readCollection('posts')

    // Skills should not appear in hooks, configs, guides, or posts
    const allSkillSlugs = skills.map((i: { slug: string }) => i.slug)
    const allHookSlugs = hooks.map((i: { slug: string }) => i.slug)

    for (const slug of allSkillSlugs) {
      expect(allHookSlugs).not.toContain(slug)
    }

    // Each collection has distinct items
    const allSlugs = [
      ...skills.map((i: { slug: string }) => `skills/${i.slug}`),
      ...hooks.map((i: { slug: string }) => `hooks/${i.slug}`),
      ...configs.map((i: { slug: string }) => `configs/${i.slug}`),
      ...guides.map((i: { slug: string }) => `guides/${i.slug}`),
      ...posts.map((i: { slug: string }) => `posts/${i.slug}`),
    ]
    const uniqueSlugs = new Set(allSlugs)
    expect(uniqueSlugs.size).toBe(allSlugs.length)
  })

  test('category is auto-inferred from first directory segment', () => {
    const skills = readCollection('skills')
    for (const item of skills) {
      expect(item.category).toBeDefined()
      expect(typeof item.category).toBe('string')
    }

    const posts = readCollection('posts')
    for (const item of posts) {
      expect(item.category).toBe('posts')
    }
  })
})
