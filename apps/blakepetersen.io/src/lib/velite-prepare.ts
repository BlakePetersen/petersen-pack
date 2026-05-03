// ABOUTME: Build-time helpers for the Velite prepare hook.
// ABOUTME: Extracted from velite.config.ts so each phase is independently testable.

import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import {
  buildGraph,
  getLocalGraph,
  computeLayout,
  renderGraphSvg,
} from './graph'
import type { ContentNode } from './graph'
import { getGitHistoryForFile } from './git-history'
import { deriveCalVer } from './calver'
import {
  SlugSchema,
  CalVerSchema,
  ArtifactTypeSchema,
  MergeStrategySchema,
} from 'blink-registry'

// --- Types ---

export type DxItem = {
  slug: string
  title: string
  category?: string
  draft?: boolean
  dependencies?: string[]
  related?: string[]
}

export type PostItem = {
  slug: string
  draft?: boolean
}

type SingleArtifactInput = {
  slug: string
  name: string
  type: string
  description: string
  destination: string
  body: string
  merge: 'replace' | 'section'
  devDependencies?: Record<string, string>
}

type MultiArtifactInput = {
  slug: string
  name: string
  type: string
  description: string
  files: Array<{ path: string; content: string; merge: 'replace' | 'section' }>
  devDependencies?: Record<string, string>
}

export type DxData = {
  skills: DxItem[]
  hooks: DxItem[]
  configs: DxItem[]
  guides: DxItem[]
  posts: PostItem[]
  singleArtifacts?: SingleArtifactInput[]
  multiArtifacts?: MultiArtifactInput[]
}

export type ValidatedArtifact = {
  slug: string
  name: string
  type: string
  version: string
  description: string
  files: Array<{ path: string; content: string; merge: string }>
  devDependencies?: Record<string, string>
}

type DxCollectionName = 'skills' | 'hooks' | 'configs' | 'guides'

// --- 1. Draft filtering (production only) ---

export function filterDrafts(data: DxData): void {
  data.skills = data.skills.filter((s) => !s.draft)
  data.hooks = data.hooks.filter((h) => !h.draft)
  data.configs = data.configs.filter((c) => !c.draft)
  data.guides = data.guides.filter((g) => !g.draft)
  data.posts = data.posts.filter((p) => !p.draft)
}

// --- 2. Cross-reference integrity (SCHEMA-04 / D-01..D-04) ---

// Walks `dependencies` and `related` only — `decisions` is wrong shape (no
// slugs) per D-01. Cross-collection refs allowed per D-02. Format is
// `<collection>/<slug>` per D-03; bare slug may itself contain slashes
// (nested skills), so we compare against the path-shaped slug directly rather
// than splitting again. Accumulator-then-throw per D-04.
export function validateCrossReferences(data: DxData): void {
  const collectionSlugs: Record<DxCollectionName, Set<string>> = {
    skills: new Set(data.skills.map((i) => i.slug)),
    hooks: new Set(data.hooks.map((i) => i.slug)),
    configs: new Set(data.configs.map((i) => i.slug)),
    guides: new Set(data.guides.map((i) => i.slug)),
  }

  const brokenRefs: string[] = []
  const allDx: DxItem[] = [
    ...data.skills,
    ...data.hooks,
    ...data.configs,
    ...data.guides,
  ]

  for (const item of allDx) {
    for (const field of ['dependencies', 'related'] as const) {
      const refs = item[field] ?? []
      for (const ref of refs) {
        const slashIndex = ref.indexOf('/')
        if (slashIndex <= 0 || slashIndex === ref.length - 1) {
          brokenRefs.push(
            `  ${item.slug} ${field}: '${ref}' — invalid format (expected '<collection>/<slug>')`,
          )
          continue
        }
        const coll = ref.slice(0, slashIndex)
        if (!(coll in collectionSlugs)) {
          brokenRefs.push(
            `  ${item.slug} ${field}: '${ref}' — unknown collection '${coll}'`,
          )
          continue
        }
        if (!collectionSlugs[coll as DxCollectionName].has(ref)) {
          brokenRefs.push(
            `  ${item.slug} ${field}: '${ref}' — target not found in collection '${coll}'`,
          )
        }
      }
    }
  }

  if (brokenRefs.length > 0) {
    throw new Error(
      `Broken cross-references in DX content (${brokenRefs.length}):\n${brokenRefs.join('\n')}`,
    )
  }
}

// --- 3. Build dependency graph SVGs and write graph.json ---

export function buildAndWriteGraphs(data: DxData, outputDir: string): void {
  const dxItems: ContentNode[] = [
    ...data.skills,
    ...data.hooks,
    ...data.configs,
    ...data.guides,
  ].map((item) => ({
    slug: item.slug,
    title: item.title,
    category: item.category as string,
    dependencies: item.dependencies ?? [],
  }))

  const fullGraph = buildGraph(dxItems)
  const fullLayout = computeLayout(fullGraph)
  const fullGraphSvg = renderGraphSvg(fullLayout, { basePath: '/dx' })

  const localGraphs: Record<string, string> = {}
  for (const item of dxItems) {
    const local = getLocalGraph(fullGraph, item.slug)
    if (local.edges.length > 0) {
      const localLayout = computeLayout(local)
      localGraphs[item.slug] = renderGraphSvg(localLayout, {
        currentSlug: item.slug,
        basePath: '/dx',
      })
    }
  }

  fs.writeFileSync(
    path.join(outputDir, 'graph.json'),
    JSON.stringify({ fullGraphSvg, localGraphs }, null, 2),
  )
}

// --- 4. Git history extraction ---

export function extractGitHistory(
  data: DxData,
  contentDir: string,
  outputDir: string,
): void {
  const allItems = [
    ...data.skills,
    ...data.hooks,
    ...data.configs,
    ...data.guides,
    ...data.posts,
  ]

  const gitHistory: Record<string, { lastModified: string; commitCount: number }> = {}
  for (const item of allItems) {
    const mdxPath = path.join(contentDir, `${item.slug}.mdx`)
    gitHistory[item.slug] = getGitHistoryForFile(mdxPath)
  }

  fs.writeFileSync(
    path.join(outputDir, 'git-history.json'),
    JSON.stringify(gitHistory, null, 2),
  )
}

// --- 5. Artifact versioning + Zod validation (SCHEMA-08 / D-05..D-07) ---

type VersionManifest = Record<string, { hash: string; version: string }>

function deriveArtifactSlug(velitePath: string): string {
  const cleaned = velitePath
    .replace(/\.artifact\/manifest$/, '')
    .replace(/\.artifact$/, '')
  // Extract just the filename portion to produce a valid slug (no slashes)
  return cleaned.split('/').pop() || cleaned
}

function sha256Hex(payload: string): string {
  return createHash('sha256').update(payload).digest('hex')
}

// Version each artifact via the SCHEMA-08 hash gate (D-05/D-07): unchanged
// distributed-payload bytes preserve the prior CalVer, so prose-only edits
// don't bump version. Manifest is git-tracked per D-06 for cross-machine
// determinism. Single-process serial build (Risk #3) — no atomic write.
export function versionAndValidateArtifacts(
  data: { singleArtifacts?: SingleArtifactInput[]; multiArtifacts?: MultiArtifactInput[] },
  contentDir: string,
): ValidatedArtifact[] {
  const versionManifestPath = path.resolve(contentDir, '.artifact-versions.json')
  const priorVersionManifest: VersionManifest = fs.existsSync(versionManifestPath)
    ? JSON.parse(fs.readFileSync(versionManifestPath, 'utf-8'))
    : {}
  const updatedVersionManifest: VersionManifest = {}
  const dateCounters = new Map<string, number>()

  const singles: ValidatedArtifact[] = (data.singleArtifacts ?? []).map((artifact) => {
    const slug = deriveArtifactSlug(artifact.slug)
    // D-05: hash the distributed-payload bytes only (single-file = body).
    const hash = sha256Hex(artifact.body)
    const prior = priorVersionManifest[slug]
    let version: string
    if (prior && prior.hash === hash) {
      version = prior.version
    } else {
      const filePath = path.join(contentDir, `${artifact.slug}.md`)
      version = deriveCalVer(filePath, dateCounters)
    }
    updatedVersionManifest[slug] = { hash, version }

    return {
      slug,
      name: artifact.name,
      type: artifact.type,
      version,
      description: artifact.description,
      files: [
        {
          path: artifact.destination,
          content: artifact.body,
          merge: artifact.merge,
        },
      ],
      devDependencies: artifact.devDependencies,
    }
  })

  const multis: ValidatedArtifact[] = (data.multiArtifacts ?? []).map((artifact) => {
    const slug = deriveArtifactSlug(artifact.slug)
    // D-05: hash concatenated file.content in declared order (no separator —
    // boundaries are immaterial to the consumer-facing payload).
    const concatenated = artifact.files.map((f) => f.content).join('')
    const hash = sha256Hex(concatenated)
    const prior = priorVersionManifest[slug]
    let version: string
    if (prior && prior.hash === hash) {
      version = prior.version
    } else {
      const manifestFilePath = path.join(contentDir, `${artifact.slug}.json`)
      version = deriveCalVer(manifestFilePath, dateCounters)
    }
    updatedVersionManifest[slug] = { hash, version }

    return {
      slug,
      name: artifact.name,
      type: artifact.type,
      version,
      description: artifact.description,
      files: artifact.files,
      devDependencies: artifact.devDependencies,
    }
  })

  const allArtifacts = [...singles, ...multis]

  // Validate artifact shape at build time (fail-fast)
  for (const artifact of allArtifacts) {
    if (!SlugSchema.safeParse(artifact.slug).success) {
      throw new Error(`Invalid artifact slug: "${artifact.slug}"`)
    }
    if (!CalVerSchema.safeParse(artifact.version).success) {
      throw new Error(`Invalid artifact version: "${artifact.version}" for ${artifact.slug}`)
    }
    if (!ArtifactTypeSchema.safeParse(artifact.type).success) {
      throw new Error(`Invalid artifact type: "${artifact.type}" for ${artifact.slug}`)
    }
    for (const file of artifact.files) {
      if (!MergeStrategySchema.safeParse(file.merge).success) {
        throw new Error(`Invalid merge strategy: "${file.merge}" in ${artifact.slug}`)
      }
      if (!file.content) {
        throw new Error(`Empty file content for "${file.path}" in ${artifact.slug}`)
      }
    }
  }

  // Sort top-level keys so consecutive runs are byte-identical (D-06: diffable in PRs).
  const sortedVersionManifest = Object.fromEntries(
    Object.entries(updatedVersionManifest).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)),
  )
  fs.writeFileSync(
    versionManifestPath,
    JSON.stringify(sortedVersionManifest, null, 2) + '\n',
  )

  return allArtifacts
}

// --- 6. Static registry JSON files for CLI/HTTP consumption ---

export function writeRegistryFiles(allArtifacts: ValidatedArtifact[]): void {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || 'https://blakepetersen.io'
  const registryDir = path.resolve(process.cwd(), 'public', 'r')

  // Clean stale files
  fs.rmSync(registryDir, { recursive: true, force: true })
  fs.mkdirSync(registryDir, { recursive: true })

  const items = allArtifacts.map((artifact) => ({
    slug: artifact.slug,
    name: artifact.name,
    type: artifact.type,
    version: artifact.version,
    description: artifact.description,
    url: `${baseUrl}/${artifact.type}s/${artifact.slug}`,
  }))

  // Use max CalVer version as generatedAt (avoids noisy git diffs from wall-clock time)
  const maxVersion =
    allArtifacts.length > 0
      ? allArtifacts
          .map((a) => a.version)
          .sort()
          .pop()!
      : new Date().toISOString()

  // CalVer versions aren't ISO datetimes, so convert to a stable ISO timestamp
  // Format: YYYY.MM.DD.N -> YYYY-MM-DDT00:00:00Z
  const generatedAt = maxVersion.match(/^\d{4}\.\d{2}\.\d{2}\.\d+$/)
    ? `${maxVersion.split('.').slice(0, 3).join('-')}T00:00:00Z`
    : maxVersion

  const index = { items, generatedAt }

  fs.writeFileSync(
    path.join(registryDir, 'index.json'),
    JSON.stringify(index, null, 2),
  )

  for (const artifact of allArtifacts) {
    const typeDir = path.join(registryDir, artifact.type)
    fs.mkdirSync(typeDir, { recursive: true })

    const detail = {
      ...artifact,
      url: `${baseUrl}/${artifact.type}s/${artifact.slug}`,
    }

    fs.writeFileSync(
      path.join(typeDir, `${artifact.slug}.json`),
      JSON.stringify(detail, null, 2),
    )
  }
}
