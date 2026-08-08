// ABOUTME: Build-time helpers for the Velite prepare hook.
// ABOUTME: Extracted from velite.config.ts so each phase is independently testable.

import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import {
  buildGraph,
  getLocalGraph,
  computeLayout,
  renderGraphSvg
} from './graph'
import type { ContentNode } from './graph'
import { getGitHistoryForFile } from './git-history'
import { deriveCalVer } from './calver'
import {
  SlugSchema,
  CalVerSchema,
  ArtifactTypeSchema,
  MergeStrategySchema,
  type Slug,
  type CalVer,
  type Sha256Hex
} from 'blink-registry'

// --- Types ---

// Post-Velite-transform shape. Velite guarantees:
//   - category: dxFields transform falls back to slug-prefix or 'uncategorized'.
//   - dependencies / related: `s.array(...).default([])` ensures arrays are present.
// Tests constructing DxItems must mirror these guarantees.
export type DxItem = {
  slug: string
  title: string
  category: string
  draft?: boolean
  dependencies: string[]
  related: string[]
}

export type PostItem = {
  slug: string
  draft?: boolean
  related: string[]
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
  singleArtifacts: SingleArtifactInput[]
  multiArtifacts: MultiArtifactInput[]
}

export type ValidatedArtifact = {
  slug: string
  name: string
  type: string
  version: string
  description: string
  /** Full content path (e.g. 'skills/claude-code/writing-custom-skills') — the site route. */
  pagePath: string
  files: Array<{ path: string; content: string; merge: string }>
  devDependencies?: Record<string, string>
}

type DxCollectionName = 'skills' | 'hooks' | 'configs' | 'guides'

// --- 1. Draft filtering (production only) ---

export function filterDrafts(data: DxData): void {
  data.skills = data.skills.filter(s => !s.draft)
  data.hooks = data.hooks.filter(h => !h.draft)
  data.configs = data.configs.filter(c => !c.draft)
  data.guides = data.guides.filter(g => !g.draft)
  data.posts = data.posts.filter(p => !p.draft)
}

// --- 2. Cross-reference integrity ---

// Caller must apply filterDrafts first in production so dev and prod
// validate the same set. Walks dependencies/related only — the `decisions`
// field holds {choice, rationale} objects with no slugs to resolve.
// Cross-collection refs are allowed (shipped content already relies on
// them); refs keep the `<collection>/<slug>` format and nested-slug refs
// compare against the path-shaped slug directly. Broken refs accumulate
// into one throw so authors fix the whole batch in a single pass instead
// of one rebuild per bad ref.
export function validateCrossReferences(data: DxData): void {
  const collectionSlugs: Record<DxCollectionName, Set<string>> = {
    skills: new Set(data.skills.map(i => i.slug)),
    hooks: new Set(data.hooks.map(i => i.slug)),
    configs: new Set(data.configs.map(i => i.slug)),
    guides: new Set(data.guides.map(i => i.slug))
  }

  const brokenRefs: string[] = []
  const allDx: DxItem[] = [
    ...data.skills,
    ...data.hooks,
    ...data.configs,
    ...data.guides
  ]

  for (const item of allDx) {
    for (const field of ['dependencies', 'related'] as const) {
      const refs = item[field]
      for (const ref of refs) {
        const slashIndex = ref.indexOf('/')
        if (slashIndex <= 0 || slashIndex === ref.length - 1) {
          brokenRefs.push(
            `  ${item.slug} ${field}: '${ref}' — invalid format (expected '<collection>/<slug>')`
          )
          continue
        }
        const coll = ref.slice(0, slashIndex)
        if (!(coll in collectionSlugs)) {
          brokenRefs.push(
            `  ${item.slug} ${field}: '${ref}' — unknown collection '${coll}'`
          )
          continue
        }
        if (!collectionSlugs[coll as DxCollectionName].has(ref)) {
          brokenRefs.push(
            `  ${item.slug} ${field}: '${ref}' — target not found in collection '${coll}'`
          )
        }
      }
    }
  }

  // Posts' `related` refs may target DX entries or other posts; they used to
  // bypass validation entirely and silently drop at render time.
  const postSlugs = new Set(data.posts.map(p => p.slug))
  for (const post of data.posts) {
    for (const ref of post.related) {
      const coll = ref.slice(0, ref.indexOf('/'))
      const known =
        coll === 'posts'
          ? postSlugs.has(ref)
          : coll in collectionSlugs &&
            collectionSlugs[coll as DxCollectionName].has(ref)
      if (!known) {
        brokenRefs.push(`  ${post.slug} related: '${ref}' — target not found`)
      }
    }
  }

  if (brokenRefs.length > 0) {
    const error = new Error(
      `Broken cross-references in content (${brokenRefs.length}):\n${brokenRefs.join('\n')}`
    )
    // Stable name for error tracking — a bare Error from inside Velite's
    // prepare hook is indistinguishable from any other build failure.
    error.name = 'BlinkCrossRefError'
    throw error
  }
}

// --- 3. Build dependency graph SVGs and write graph.json ---

export function buildAndWriteGraphs(data: DxData, outputDir: string): void {
  const dxItems: ContentNode[] = [
    ...data.skills,
    ...data.hooks,
    ...data.configs,
    ...data.guides
  ].map(item => ({
    slug: item.slug,
    title: item.title,
    category: item.category,
    dependencies: item.dependencies
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
        basePath: '/dx'
      })
    }
  }

  fs.writeFileSync(
    path.join(outputDir, 'graph.json'),
    JSON.stringify({ fullGraphSvg, localGraphs }, null, 2)
  )
}

// --- 4. Git history extraction ---

export function extractGitHistory(
  data: DxData,
  contentDir: string,
  outputDir: string
): void {
  const allItems = [
    ...data.skills,
    ...data.hooks,
    ...data.configs,
    ...data.guides,
    ...data.posts
  ]

  const gitHistory: Record<
    string,
    { lastModified: string; commitCount: number }
  > = {}
  for (const item of allItems) {
    const mdxPath = path.join(contentDir, `${item.slug}.mdx`)
    gitHistory[item.slug] = getGitHistoryForFile(mdxPath)
  }

  fs.writeFileSync(
    path.join(outputDir, 'git-history.json'),
    JSON.stringify(gitHistory, null, 2)
  )
}

// --- 5. Artifact versioning + Zod validation ---

type VersionManifest = Record<Slug, { hash: Sha256Hex; version: CalVer }>

function deriveArtifactPaths(velitePath: string): {
  slug: string
  pagePath: string
} {
  const pagePath = velitePath
    .replace(/\.artifact\/manifest$/, '')
    .replace(/\.artifact$/, '')
  // Slug is the filename portion (SlugSchema forbids slashes); the full
  // pagePath is kept separately — registry URLs built from `<type>s/<slug>`
  // 404'd for every entry nested below its collection root.
  return { slug: pagePath.split('/').pop() || pagePath, pagePath }
}

function sha256Hex(payload: string): string {
  return createHash('sha256').update(payload).digest('hex')
}

// Version each artifact by hashing its distributed-payload bytes: an
// unchanged hash preserves the prior CalVer, so prose-only frontmatter
// edits don't bump the version (the daily `.N` counter only advances when
// the payload hash changes). The manifest is git-tracked so versions are
// deterministic across machines, survive clean checkouts, and diff in PRs.
// Throws on the first artifact that fails Zod shape validation, before
// persisting the manifest, so a bad artifact never corrupts the hash gate.
export function versionAndValidateArtifacts(
  data: DxData,
  contentDir: string
): ValidatedArtifact[] {
  const versionManifestPath = path.resolve(
    contentDir,
    '.artifact-versions.json'
  )
  let priorVersionManifest: VersionManifest = {}
  if (fs.existsSync(versionManifestPath)) {
    try {
      priorVersionManifest = JSON.parse(
        fs.readFileSync(versionManifestPath, 'utf-8')
      )
    } catch (cause) {
      // Merge conflicts are the usual culprit — a raw SyntaxError from inside
      // Velite's prepare hook gave no path and no recovery step.
      throw new Error(
        `Version manifest corrupted at ${versionManifestPath} — fix or delete it to regenerate (versions will re-derive from git dates)`,
        { cause }
      )
    }
  }
  const updatedVersionManifest: VersionManifest = {}
  const dateCounters = new Map<string, number>()

  const singles: ValidatedArtifact[] = data.singleArtifacts.map(artifact => {
    const { slug, pagePath } = deriveArtifactPaths(artifact.slug)
    // Hash the distributed-payload bytes only (single-file artifact = the body).
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
      pagePath,
      files: [
        {
          path: artifact.destination,
          content: artifact.body,
          merge: artifact.merge
        }
      ],
      devDependencies: artifact.devDependencies
    }
  })

  const multis: ValidatedArtifact[] = data.multiArtifacts.map(artifact => {
    const { slug, pagePath } = deriveArtifactPaths(artifact.slug)
    // Hash the concatenated file contents in declared order (no separator —
    // file boundaries are immaterial to the consumer-facing payload).
    const concatenated = artifact.files.map(f => f.content).join('')
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
      pagePath,
      files: artifact.files,
      devDependencies: artifact.devDependencies
    }
  })

  const allArtifacts = [...singles, ...multis]

  // Duplicate derived slugs and duplicate replace-merge destinations used
  // to be a silent last-write-wins clobber. Fail the build instead.
  const slugSources = new Map<string, string>()
  const replaceDestinations = new Map<string, string>()
  for (const artifact of allArtifacts) {
    const priorSlugSource = slugSources.get(artifact.slug)
    if (priorSlugSource) {
      throw new Error(
        `Duplicate artifact slug '${artifact.slug}' derived from both '${priorSlugSource}' and '${artifact.pagePath}'`
      )
    }
    slugSources.set(artifact.slug, artifact.pagePath)

    for (const file of artifact.files) {
      if (file.merge !== 'replace') continue
      const priorDest = replaceDestinations.get(file.path)
      if (priorDest) {
        throw new Error(
          `Duplicate replace-merge destination '${file.path}' declared by both '${priorDest}' and '${artifact.slug}' — the second silently clobbers the first on apply`
        )
      }
      replaceDestinations.set(file.path, artifact.slug)
    }
  }

  for (const artifact of allArtifacts) {
    if (!SlugSchema.safeParse(artifact.slug).success) {
      throw new Error(`Invalid artifact slug: "${artifact.slug}"`)
    }
    if (!CalVerSchema.safeParse(artifact.version).success) {
      throw new Error(
        `Invalid artifact version: "${artifact.version}" for ${artifact.slug}`
      )
    }
    if (!ArtifactTypeSchema.safeParse(artifact.type).success) {
      throw new Error(
        `Invalid artifact type: "${artifact.type}" for ${artifact.slug}`
      )
    }
    for (const file of artifact.files) {
      if (!MergeStrategySchema.safeParse(file.merge).success) {
        throw new Error(
          `Invalid merge strategy: "${file.merge}" in ${artifact.slug}`
        )
      }
      if (!file.content) {
        throw new Error(
          `Empty file content for "${file.path}" in ${artifact.slug}`
        )
      }
    }
  }

  // Sort top-level keys so consecutive runs produce a byte-identical manifest.
  // Velite's prepare hook runs serially in a single build process (no
  // parallel builds), so a plain write is safe — no write-temp-then-rename.
  const sortedVersionManifest = Object.fromEntries(
    Object.entries(updatedVersionManifest).sort(([a], [b]) =>
      a < b ? -1 : a > b ? 1 : 0
    )
  )
  fs.writeFileSync(
    versionManifestPath,
    JSON.stringify(sortedVersionManifest, null, 2) + '\n'
  )

  return allArtifacts
}

// --- 6. Static registry JSON files for CLI/HTTP consumption ---

export function writeRegistryFiles(
  allArtifacts: ValidatedArtifact[],
  registryDirOverride?: string
): void {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://blakepetersen.io'
  const registryDir =
    registryDirOverride ?? path.resolve(process.cwd(), 'public', 'r')

  // Clean stale files
  fs.rmSync(registryDir, { recursive: true, force: true })
  fs.mkdirSync(registryDir, { recursive: true })

  const items = allArtifacts.map(artifact => ({
    slug: artifact.slug,
    name: artifact.name,
    type: artifact.type,
    version: artifact.version,
    description: artifact.description,
    // pagePath is the real site route — `<type>s/<slug>` 404'd for nested entries
    url: `${baseUrl}/${artifact.pagePath}`
  }))

  // Use max CalVer version as generatedAt (avoids noisy git diffs from wall-clock time)
  const maxVersion =
    allArtifacts.length > 0
      ? allArtifacts
          .map(a => a.version)
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
    JSON.stringify(index, null, 2)
  )

  for (const artifact of allArtifacts) {
    const typeDir = path.join(registryDir, artifact.type)
    fs.mkdirSync(typeDir, { recursive: true })

    // pagePath is site-internal; the published detail carries the resolved url
    const { pagePath, ...publishable } = artifact
    const detail = {
      ...publishable,
      url: `${baseUrl}/${pagePath}`
    }

    fs.writeFileSync(
      path.join(typeDir, `${artifact.slug}.json`),
      JSON.stringify(detail, null, 2)
    )
  }
}
