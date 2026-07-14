// ABOUTME: Artifact-version manifest invariants (hash format, version format, slug coverage).
// ABOUTME: Asserts on the real .artifact-versions.json after pnpm velite runs.

import fs from 'node:fs'
import path from 'node:path'

const manifestPath = path.resolve(__dirname, '..', 'content', '.artifact-versions.json')
const indexPath = path.resolve(__dirname, '..', 'public', 'r', 'index.json')

describe('SCHEMA-08: .artifact-versions.json shape', () => {
  it('exists at content/.artifact-versions.json', () => {
    expect(fs.existsSync(manifestPath)).toBe(true)
  })

  it('every entry has a 64-char hex hash and a CalVer version', () => {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8')) as Record<
      string,
      { hash: string; version: string }
    >
    expect(Object.keys(manifest).length).toBeGreaterThan(0)
    for (const [slug, entry] of Object.entries(manifest)) {
      expect(entry.hash).toMatch(/^[a-f0-9]{64}$/)
      expect(entry.version).toMatch(/^\d{4}\.\d{2}\.\d{2}\.\d+$/)
      expect(slug.length).toBeGreaterThan(0)
    }
  })

  it('emits keys in lexicographic order for consecutive-run determinism', () => {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8')) as Record<string, unknown>
    const keys = Object.keys(manifest)
    const sorted = [...keys].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
    expect(keys).toEqual(sorted)
  })

  it('every published artifact in public/r/index.json has a manifest entry', () => {
    if (!fs.existsSync(indexPath)) {
      // index.json is built during full pnpm build; skip if velite-only ran.
      return
    }
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8')) as Record<
      string,
      { hash: string; version: string }
    >
    const index = JSON.parse(fs.readFileSync(indexPath, 'utf-8')) as {
      items: Array<{ slug: string }>
    }
    for (const item of index.items) {
      expect(manifest).toHaveProperty(item.slug)
    }
  })
})
