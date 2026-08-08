// ABOUTME: Tests for the centralized collection registry.
// ABOUTME: Validates required fields, visibility filtering, and unknown slug handling.

import {
  getAllCollections,
  getVisibleCollections,
  getCollection
} from '@/lib/collection-registry'

// Mock the content module so tests don't depend on Velite build output
jest.mock('@/lib/content', () => ({
  getSkills: () => [{ slug: 'skills/a', title: 'Skill A' }],
  getHooks: () => [{ slug: 'hooks/a', title: 'Hook A' }],
  getConfigs: () => [{ slug: 'configs/a', title: 'Config A' }],
  getGuides: () => [{ slug: 'guides/a', title: 'Guide A' }],
  getPosts: () => [{ slug: 'posts/a', title: 'Post A' }]
}))

describe('collection-registry', () => {
  describe('getAllCollections', () => {
    it('returns all five content collections', () => {
      const all = getAllCollections()
      expect(all).toHaveLength(5)
      expect(all.map(c => c.slug)).toEqual([
        'skills',
        'hooks',
        'configs',
        'guides',
        'posts'
      ])
    })

    it('every collection has all required fields', () => {
      for (const c of getAllCollections()) {
        expect(c.slug).toBeTruthy()
        expect(c.label).toBeTruthy()
        expect(c.color).toMatch(/^#[0-9A-Fa-f]{6}$/)
        expect(typeof c.showInNav).toBe('boolean')
        expect(typeof c.showInSitemap).toBe('boolean')
        expect(typeof c.showInFeed).toBe('boolean')
        expect(c.href).toMatch(/^\//)
        expect(typeof c.getter).toBe('function')
      }
    })

    it('each getter returns an array', () => {
      for (const c of getAllCollections()) {
        expect(Array.isArray(c.getter())).toBe(true)
      }
    })
  })

  describe('getVisibleCollections', () => {
    it('returns only collections with showInNav=true', () => {
      const visible = getVisibleCollections()
      for (const c of visible) {
        expect(c.showInNav).toBe(true)
      }
    })

    it('returns a subset of all collections', () => {
      const visible = getVisibleCollections()
      const all = getAllCollections()
      expect(visible.length).toBeLessThanOrEqual(all.length)
      for (const c of visible) {
        expect(all).toContainEqual(c)
      }
    })
  })

  describe('getCollection', () => {
    it('returns the correct collection for a known slug', () => {
      const skills = getCollection('skills')
      expect(skills.slug).toBe('skills')
      expect(skills.label).toBe('Skills')
      expect(skills.color).toBe('#F59E0B')
    })

    it('throws on unknown slug', () => {
      expect(() => getCollection('nonexistent')).toThrow(
        'Unknown collection: nonexistent'
      )
    })
  })
})
