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
  filterDrafts,
  validateCrossReferences,
  buildAndWriteGraphs,
  extractGitHistory,
  versionAndValidateArtifacts,
  writeRegistryFiles,
  type DxData,
} from './src/lib/velite-prepare'
import { ARTIFACT_TYPES, MERGE_STRATEGIES } from 'blink-registry'
import { dxFields } from './src/lib/velite-fields'

/**
 * Per-collection bare-slug uniqueness helper.
 *
 * Keeps `slug: s.path()` (path-shaped, e.g. 'skills/foo') rather than
 * `s.slug('<collection>')` (which returns a bare 'foo'): every consumer of
 * `.velite/<collection>.json` — plus `dxSchemaFor`'s category fallback below —
 * depends on the path shape, and swapping would force `slug:` frontmatter
 * onto every existing MDX file. Reproduces `s.slug()`'s per-namespace dedup
 * on just the bare-slug component, reusing Velite's own `meta.config.cache`
 * (Map<string,string>) — the same mechanism `s.slug()` uses internally (see
 * node_modules/velite/dist/index.js around the `s.slug` definition).
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
    type: s.enum([...ARTIFACT_TYPES]),
    merge: s.enum([...MERGE_STRATEGIES]),
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
      type: s.enum([...ARTIFACT_TYPES]),
      devDependencies: s.record(s.string(), s.string()).optional().default({}),
      files: s.array(
        s.object({
          path: s.string(),
          merge: s.enum([...MERGE_STRATEGIES]),
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

const config = defineConfig({
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
  prepare: (data: DxData) => {
    if (process.env.NODE_ENV === 'production') {
      filterDrafts(data)
    }

    validateCrossReferences(data)

    const outputDir = path.resolve(process.cwd(), '.velite')
    fs.mkdirSync(outputDir, { recursive: true })

    buildAndWriteGraphs(data, outputDir)

    const contentDir = path.resolve(process.cwd(), 'content')
    extractGitHistory(data, contentDir, outputDir)

    const allArtifacts = versionAndValidateArtifacts(data, contentDir)
    fs.writeFileSync(
      path.join(outputDir, 'artifacts.json'),
      JSON.stringify(allArtifacts, null, 2),
    )

    writeRegistryFiles(allArtifacts)
  },
})

export default config
