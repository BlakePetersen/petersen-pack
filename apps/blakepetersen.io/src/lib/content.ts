// ABOUTME: Typed content query helpers for Velite-processed collections.
// ABOUTME: Provides sorted access to skills, hooks, configs, guides, and posts.

import { skills, hooks, configs, guides, posts } from '#content'

type CollectionItem = { slug: string }

export function getSkills() {
  return [...skills].sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity))
}

export function getHooks() {
  return [...hooks].sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity))
}

export function getConfigs() {
  return [...configs].sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity))
}

export function getGuides() {
  return [...guides].sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity))
}

export function getPosts() {
  return [...posts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )
}

const collections: Record<string, CollectionItem[]> = {
  skills,
  hooks,
  configs,
  guides,
  posts,
}

export function getContentBySlug(collection: string, slug: string) {
  const items = collections[collection]
  if (!items) return undefined
  return items.find((item) => item.slug === slug)
}
