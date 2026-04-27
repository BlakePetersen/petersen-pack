// ABOUTME: Velite content pipeline configuration with typed schemas for all collections.
// ABOUTME: Defines content and artifact collections, merges artifacts in prepare hook into artifacts.json.

import fs from 'node:fs'
import path from 'node:path'
import { defineCollection, defineConfig, s } from 'velite'
import rehypeSlug from 'rehype-slug'
import rehypeShiki from '@shikijs/rehype'
import { transformerMetaHighlight } from '@shikijs/transformers'
import { terminalTheme } from './src/lib/shiki-theme'
import {
  buildGraph,
  getLocalGraph,
  computeLayout,
  renderGraphSvg,
} from './src/lib/graph'
import type { ContentNode } from './src/lib/graph'
import { getGitHistoryForFile } from './src/lib/git-history'
import { deriveCalVer } from './src/lib/calver'
import {
  SlugSchema,
  CalVerSchema,
  ArtifactTypeSchema,
  MergeStrategySchema,
} from 'blink-registry'

// Shared fields for DX content types (skills, hooks, configs, guides)
const dxFields = {
  title: s.string().max(120),
  description: s.string().max(260),
  applies_to: s.array(s.string()),
  dependencies: s.array(s.string()).default([]),
  order: s.number().optional(),
  draft: s.boolean().default(false),
  tags: s.array(s.string()).default([]),
  voice: s.array(s.enum(['author-note', 'decision-rationale'])).default([]),
  requires_artifact: s.boolean().default(false),
  category: s.string().optional(),
  decisions: s.array(s.object({ choice: s.string(), rationale: s.string() })).default([]),
  related: s.array(s.string()).default([]),
  updated_context: s.isodate().optional(),
}

/**
 * Per-collection bare-slug uniqueness helper for SCHEMA-03.
 *
 * Deviates from the literal D-19 wording ("swap to s.slug('<collection>')") to
 * preserve the path-shaped value of `entry.slug` that every consumer of
 * `.velite/<collection>.json` depends on. Same substance as `s.slug(by)`'s
 * dedup namespace, applied to the bare-slug component.
 *
 * Reuses Velite's own `meta.config.cache` (Map<string,string>) — the same
 * mechanism `s.slug()` uses internally. See node_modules/velite/dist/index.js
 * around the `s.slug` definition for the reference implementation.
 */
function pathSlugWithCollectionDedup(collection: string) {
  return s.path().superRefine((value, { meta, addIssue }) => {
    const bareSlug = value.split('/').pop() ?? value
    const key = `phase27:collection-slug:${collection}:${bareSlug}`
    const cache = (meta.config as { cache: Map<string, string> }).cache
    const prior = cache.get(key)
    if (prior) {
      addIssue({
        fatal: true,
        code: 'custom',
        message: `Duplicate slug '${bareSlug}' in collection '${collection}': '${meta.path}' conflicts with '${prior}'`,
      })
    } else {
      cache.set(key, meta.path)
    }
  })
}

function dxSchemaFor(collection: string) {
  return s
    .object({
      ...dxFields,
      slug: pathSlugWithCollectionDedup(collection),
      excerpt: s.excerpt(),
      metadata: s.metadata(),
      code: s.mdx(),
    })
    .transform(({ metadata, ...data }) => ({
      ...data,
      category: data.category || data.slug.split('/')[0] || 'uncategorized',
      readingTime: metadata.readingTime,
      wordCount: metadata.wordCount,
    }))
}

const skills = defineCollection({
  name: 'Skill',
  pattern: 'skills/**/*.mdx',
  schema: dxSchemaFor('skills'),
})

const hooks = defineCollection({
  name: 'Hook',
  pattern: 'hooks/**/*.mdx',
  schema: dxSchemaFor('hooks'),
})

const configs = defineCollection({
  name: 'Config',
  pattern: 'configs/**/*.mdx',
  schema: dxSchemaFor('configs'),
})

const guides = defineCollection({
  name: 'Guide',
  pattern: 'guides/**/*.mdx',
  schema: dxSchemaFor('guides'),
})

const posts = defineCollection({
  name: 'Post',
  pattern: 'posts/**/*.mdx',
  schema: s
    .object({
      title: s.string().max(120),
      description: s.string().max(260),
      date: s.isodate(),
      tags: s.array(s.string()).default([]),
      draft: s.boolean().default(false),
      related: s.array(s.string()).default([]),
      updated_context: s.isodate().optional(),
      slug: s.path(),
      excerpt: s.excerpt(),
      metadata: s.metadata(),
      code: s.mdx(),
    })
    .transform(({ metadata, ...data }) => ({
      ...data,
      category: 'posts',
      readingTime: metadata.readingTime,
      wordCount: metadata.wordCount,
    })),
})

const singleArtifacts = defineCollection({
  name: 'SingleArtifact',
  pattern: '**/*.artifact.md',
  schema: s.object({
    name: s.string(),
    description: s.string(),
    type: s.enum(['config', 'skill', 'hook', 'guide']),
    merge: s.enum(['replace', 'section']),
    destination: s.string(),
    devDependencies: s.record(s.string(), s.string()).optional().default({}),
    slug: s.path(),
    body: s.raw(),
  }),
})

const multiArtifacts = defineCollection({
  name: 'MultiArtifact',
  pattern: '**/*.artifact/manifest.json',
  schema: s
    .object({
      name: s.string(),
      description: s.string(),
      type: s.enum(['config', 'skill', 'hook', 'guide']),
      devDependencies: s.record(s.string(), s.string()).optional().default({}),
      files: s.array(
        s.object({
          path: s.string(),
          merge: s.enum(['replace', 'section']),
        }),
      ),
      slug: s.path(),
    })
    .transform((data, { meta }) => {
      const manifestDir = path.dirname(meta.path)
      const resolvedFiles = data.files.map((f) => {
        const filePath = path.join(manifestDir, f.path)
        const content = fs.readFileSync(filePath, 'utf-8')
        return { path: f.path, content, merge: f.merge }
      })
      return { ...data, files: resolvedFiles }
    }),
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const config: any = defineConfig({
  root: 'content',
  output: {
    data: '.velite',
    assets: 'public/static',
    base: '/static/',
    clean: true,
  },
  mdx: {
    rehypePlugins: [
      rehypeSlug,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [rehypeShiki as any, {
        theme: terminalTheme,
        transformers: [transformerMetaHighlight()],
      }],
    ],
  },
  collections: { skills, hooks, configs, guides, posts, singleArtifacts, multiArtifacts },
  strict: true,
  prepare: (data) => {
    const isProduction = process.env.NODE_ENV === 'production'
    if (isProduction) {
      data.skills = data.skills.filter((s) => !s.draft)
      data.hooks = data.hooks.filter((h) => !h.draft)
      data.configs = data.configs.filter((c) => !c.draft)
      data.guides = data.guides.filter((g) => !g.draft)
      data.posts = data.posts.filter((p) => !p.draft)
    }

    // Collect all DX content items (not posts) for dependency graph
    const dxItems: ContentNode[] = [
      ...data.skills,
      ...data.hooks,
      ...data.configs,
      ...data.guides,
    ].map((item) => ({
      slug: item.slug,
      title: item.title,
      category: item.category,
      dependencies: item.dependencies,
    }))

    // SCHEMA-04: cross-reference integrity check (D-01..D-04).
    // Runs against post-draft-filter data so dev = prod for valid published
    // content. Walks `dependencies` and `related` only — `decisions` is wrong
    // shape (no slugs) per D-01. Cross-collection refs allowed per D-02.
    // Format is `<collection>/<slug>` per D-03; bare slug may itself contain
    // slashes (nested skills), so we compare against the path-shaped slug
    // directly rather than splitting again. Accumulator-then-throw per D-04.
    type DxCollectionName = 'skills' | 'hooks' | 'configs' | 'guides'
    const collectionSlugs: Record<DxCollectionName, Set<string>> = {
      skills: new Set(data.skills.map((i) => i.slug)),
      hooks: new Set(data.hooks.map((i) => i.slug)),
      configs: new Set(data.configs.map((i) => i.slug)),
      guides: new Set(data.guides.map((i) => i.slug)),
    }

    const brokenRefs: string[] = []
    const allDx: Array<{ slug: string; dependencies?: string[]; related?: string[] }> = [
      ...data.skills,
      ...data.hooks,
      ...data.configs,
      ...data.guides,
    ]

    for (const item of allDx) {
      for (const field of ['dependencies', 'related'] as const) {
        const refs = (item[field] ?? []) as string[]
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
          // ref is the full path-shaped slug (e.g. 'skills/claude-code/writing-custom-skills');
          // collection's Set stores the same path-shaped value, so compare directly.
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

    const graphData = { fullGraphSvg, localGraphs }
    const outputDir = path.resolve(process.cwd(), '.velite')
    fs.mkdirSync(outputDir, { recursive: true })
    fs.writeFileSync(
      path.join(outputDir, 'graph.json'),
      JSON.stringify(graphData, null, 2),
    )

    // Extract git history for all content items
    const contentDir = path.resolve(process.cwd(), 'content')
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

    // Merge single-file and multi-file artifacts into unified artifacts.json
    function deriveArtifactSlug(velitePath: string): string {
      const cleaned = velitePath
        .replace(/\.artifact\/manifest$/, '')
        .replace(/\.artifact$/, '')
      // Extract just the filename portion to produce a valid slug (no slashes)
      return cleaned.split('/').pop() || cleaned
    }

    const dateCounters = new Map<string, number>()

    const singles = (data.singleArtifacts ?? []).map((artifact) => {
      const slug = deriveArtifactSlug(artifact.slug)
      const filePath = path.join(contentDir, `${artifact.slug}.md`)
      const version = deriveCalVer(filePath, dateCounters)

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

    const multis = (data.multiArtifacts ?? []).map((artifact) => {
      const slug = deriveArtifactSlug(artifact.slug)
      const manifestPath = path.join(contentDir, `${artifact.slug}.json`)
      const version = deriveCalVer(manifestPath, dateCounters)

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

    fs.writeFileSync(
      path.join(outputDir, 'artifacts.json'),
      JSON.stringify(allArtifacts, null, 2),
    )

    // Generate static registry JSON files for CLI and HTTP consumption
    writeRegistryFiles(allArtifacts)
  },
})

function writeRegistryFiles(
  allArtifacts: Array<{
    slug: string
    name: string
    type: string
    version: string
    description: string
    files: Array<{ path: string; content: string; merge: string }>
    devDependencies?: Record<string, string>
    dependencies?: string[]
  }>,
) {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || 'https://blakepetersen.io'
  const registryDir = path.resolve(process.cwd(), 'public', 'r')

  // Clean stale files
  fs.rmSync(registryDir, { recursive: true, force: true })
  fs.mkdirSync(registryDir, { recursive: true })

  // Build index with url per item
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

  // Write per-artifact detail files
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

export default config
