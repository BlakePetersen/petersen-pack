// ABOUTME: Tests for buildMetadata helper used by route-level generateMetadata.
// ABOUTME: Validates SEO title/description fallbacks and canonical URL generation.

import { buildMetadata } from '@/lib/metadata'

describe('buildMetadata', () => {
  test('returns seo_title when present', () => {
    const item = {
      title: 'My Skill',
      description: 'A great skill',
      excerpt: 'Short excerpt',
      slug: 'skills/my-skill',
      seo_title: 'SEO Title Override',
    }
    const result = buildMetadata(item, 'skills')
    expect(result.title).toBe('SEO Title Override')
  })

  test('falls back to title when seo_title not present', () => {
    const item = {
      title: 'My Skill',
      description: 'A great skill',
      excerpt: 'Short excerpt',
      slug: 'skills/my-skill',
    }
    const result = buildMetadata(item, 'skills')
    expect(result.title).toBe('My Skill')
  })

  test('returns seo_description when present', () => {
    const item = {
      title: 'My Skill',
      description: 'A great skill',
      excerpt: 'Short excerpt',
      slug: 'skills/my-skill',
      seo_description: 'SEO description override',
    }
    const result = buildMetadata(item, 'skills')
    expect(result.description).toBe('SEO description override')
  })

  test('falls back to excerpt when seo_description not present', () => {
    const item = {
      title: 'My Skill',
      description: 'A great skill',
      excerpt: 'Short excerpt',
      slug: 'skills/my-skill',
    }
    const result = buildMetadata(item, 'skills')
    expect(result.description).toBe('Short excerpt')
  })

  test('includes canonical URL with collection prefix in slug', () => {
    const item = {
      title: 'My Skill',
      description: 'A great skill',
      slug: 'skills/my-skill',
    }
    const result = buildMetadata(item, 'skills')
    expect(result.alternates.canonical).toBe(
      'https://blakepetersen.io/skills/my-skill',
    )
  })

  test('handles posts collection slug', () => {
    const item = {
      title: 'My Post',
      description: 'A post',
      slug: 'posts/hello-world',
      date: '2025-01-01',
    }
    const result = buildMetadata(item, 'posts')
    expect(result.alternates.canonical).toBe(
      'https://blakepetersen.io/posts/hello-world',
    )
  })
})
