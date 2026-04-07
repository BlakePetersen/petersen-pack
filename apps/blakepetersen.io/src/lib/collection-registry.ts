// ABOUTME: Single source of truth for content collection metadata (slugs, labels, colors, visibility).
// ABOUTME: Eliminates hardcoded collection data scattered across components and routes.

import {
  getSkills,
  getHooks,
  getConfigs,
  getGuides,
  getPosts,
} from './content'
import type { DxContent, PostContent } from './content'

export type CollectionDefinition = {
  slug: string
  label: string
  color: string
  layout: 'dx' | 'post'
  indexDescription: (count: number) => string
  showInNav: boolean
  showInSitemap: boolean
  showInFeed: boolean
  href: string
  getter: () => (DxContent | PostContent)[]
}

const collections: Record<string, CollectionDefinition> = {
  skills: {
    slug: 'skills',
    label: 'Skills',
    color: '#F59E0B',
    layout: 'dx',
    indexDescription: (n) => `Browse ${n} Claude Code skills for AI-first development`,
    showInNav: true,
    showInSitemap: true,
    showInFeed: true,
    href: '/skills',
    getter: getSkills,
  },
  hooks: {
    slug: 'hooks',
    label: 'Hooks',
    color: '#06B6D4',
    layout: 'dx',
    indexDescription: (n) => `Browse ${n} Git hooks for automated code quality`,
    showInNav: true,
    showInSitemap: true,
    showInFeed: true,
    href: '/hooks',
    getter: getHooks,
  },
  configs: {
    slug: 'configs',
    label: 'Configs',
    color: '#10B981',
    layout: 'dx',
    indexDescription: (n) => `Browse ${n} tool configurations for consistent development environments`,
    showInNav: true,
    showInSitemap: true,
    showInFeed: true,
    href: '/configs',
    getter: getConfigs,
  },
  guides: {
    slug: 'guides',
    label: 'Guides',
    color: '#9CA3AF',
    layout: 'dx',
    indexDescription: (n) => `Browse ${n} development guides for AI-first workflows`,
    showInNav: true,
    showInSitemap: true,
    showInFeed: true,
    href: '/guides',
    getter: getGuides,
  },
  posts: {
    slug: 'posts',
    label: 'Posts',
    color: '#6B7280',
    layout: 'post',
    indexDescription: (n) => `Browse ${n} blog posts on software engineering and AI-first development`,
    showInNav: true,
    showInSitemap: true,
    showInFeed: true,
    href: '/posts',
    getter: getPosts,
  },
}

export function getCollection(slug: string): CollectionDefinition {
  const collection = collections[slug]
  if (!collection) {
    throw new Error(`Unknown collection: ${slug}`)
  }
  return collection
}

export function getAllCollections(): CollectionDefinition[] {
  return Object.values(collections)
}

export function getVisibleCollections(): CollectionDefinition[] {
  return Object.values(collections).filter((c) => c.showInNav)
}
