// ABOUTME: Typed content query helpers for Velite-processed collections.
// ABOUTME: Provides sorted access to skills, hooks, configs, guides, posts, and graph data.

import fs from 'node:fs'
import path from 'node:path'
import { skills, hooks, configs, guides, posts } from '#content'

// Centralized content types matching the Velite schema output.
// Velite's .transform() rest-spread loses type precision (_output fields become any),
// so we declare these explicitly as the single source of truth for the component layer.

export type DxContent = {
  title: string
  description: string
  slug: string
  excerpt: string
  code: string
  readingTime: number
  wordCount: number
  order?: number
  draft: boolean
  category: string
  applies_to: string[]
  dependencies: string[]
  tags: string[]
  decisions: { choice: string; rationale: string }[]
  related: string[]
  updated_context?: string
}

export type PostContent = {
  title: string
  description: string
  slug: string
  excerpt: string
  code: string
  date: string
  readingTime: number
  wordCount: number
  draft: boolean
  category: string
  tags: string[]
  related: string[]
  updated_context?: string
}

type CollectionItem = { slug: string; title: string }

type GraphJson = {
  fullGraphSvg: string
  localGraphs: Record<string, string>
}

export function getSkills() {
  return [...skills].sort(
    (a, b) => (a.order ?? Infinity) - (b.order ?? Infinity)
  )
}

export function getHooks() {
  return [...hooks].sort(
    (a, b) => (a.order ?? Infinity) - (b.order ?? Infinity)
  )
}

export function getConfigs() {
  return [...configs].sort(
    (a, b) => (a.order ?? Infinity) - (b.order ?? Infinity)
  )
}

export function getGuides() {
  return [...guides].sort(
    (a, b) => (a.order ?? Infinity) - (b.order ?? Infinity)
  )
}

export function getPosts() {
  return [...posts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}

export function resolveRelatedSlugs(
  slugs: string[]
): { title: string; href: string }[] {
  const allContent: CollectionItem[] = [
    ...getSkills(),
    ...getHooks(),
    ...getConfigs(),
    ...getGuides(),
    ...getPosts()
  ]
  return slugs
    .map(slug => {
      const item = allContent.find(c => c.slug === slug)
      if (!item) return null
      return { title: item.title, href: `/${slug}` }
    })
    .filter((item): item is { title: string; href: string } => item !== null)
}

function readGraphJson(): GraphJson {
  const filePath = path.resolve(process.cwd(), '.velite/graph.json')
  const raw = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(raw) as GraphJson
}

export function getLocalGraphSvg(slug: string): string | undefined {
  const data = readGraphJson()
  return data.localGraphs[slug]
}

type GitHistoryEntry = {
  lastModified: string
  commitCount: number
}

type GitHistoryJson = Record<string, GitHistoryEntry>

function readGitHistoryJson(): GitHistoryJson {
  const filePath = path.resolve(process.cwd(), '.velite/git-history.json')
  const raw = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(raw) as GitHistoryJson
}

export function getGitHistory(slug: string): GitHistoryEntry | undefined {
  const data = readGitHistoryJson()
  return data[slug]
}

export function getAllGitHistory(): GitHistoryJson {
  return readGitHistoryJson()
}
