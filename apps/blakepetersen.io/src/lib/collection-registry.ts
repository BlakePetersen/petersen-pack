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
