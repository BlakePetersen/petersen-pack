// ABOUTME: Typed content query helpers for Velite-processed collections.
// ABOUTME: Provides sorted access to skills, hooks, configs, guides, posts, and graph data.

import fs from 'node:fs'
import path from 'node:path'
import { skills, hooks, configs, guides, posts } from '#content'

type CollectionItem = { slug: string; title: string; description: string }

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

export function resolveRelatedSlugs(slugs: string[]): { title: string; href: string; description: string }[] {
  const allContent: CollectionItem[] = [
    ...getSkills(), ...getHooks(), ...getConfigs(), ...getGuides(), ...getPosts(),
  ]
  return slugs
    .map((slug) => {
      const item = allContent.find((c) => c.slug === slug)
      if (!item) return null
      return { title: item.title, href: `/${slug}`, description: item.description }
    })
    .filter((item): item is { title: string; href: string; description: string } => item !== null)
}

type GraphJson = {
  fullGraphSvg: string
  localGraphs: Record<string, string>
}

function readGraphJson(): GraphJson {
  const filePath = path.resolve(process.cwd(), '.velite/graph.json')
  const raw = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(raw) as GraphJson
}

export function getGraphData(): GraphJson {
  return readGraphJson()
}

export function getLocalGraphSvg(slug: string): string | undefined {
  const data = readGraphJson()
  return data.localGraphs[slug]
}

export function getFullGraphSvg(): string {
  const data = readGraphJson()
  return data.fullGraphSvg
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
