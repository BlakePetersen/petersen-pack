// ABOUTME: Velite content pipeline configuration with typed schemas for all collections.
// ABOUTME: Defines 5 collections (skills, hooks, configs, guides, posts) with Zod validation.

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

// Shared fields for DX content types (skills, hooks, configs, guides)
const dxFields = {
  title: s.string().max(120),
  description: s.string().max(260),
  applies_to: s.array(s.string()),
  dependencies: s.array(s.string()).default([]),
  order: s.number().optional(),
  draft: s.boolean().default(false),
  tags: s.array(s.string()).default([]),
  category: s.string().optional(),
  decisions: s.array(s.object({ choice: s.string(), rationale: s.string() })).default([]),
  related: s.array(s.string()).default([]),
  updated_context: s.isodate().optional(),
}

const dxSchema = s
  .object({
    ...dxFields,
    slug: s.path(),
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

const skills = defineCollection({
  name: 'Skill',
  pattern: 'skills/**/*.mdx',
  schema: dxSchema,
})

const hooks = defineCollection({
  name: 'Hook',
  pattern: 'hooks/**/*.mdx',
  schema: dxSchema,
})

const configs = defineCollection({
  name: 'Config',
  pattern: 'configs/**/*.mdx',
  schema: dxSchema,
})

const guides = defineCollection({
  name: 'Guide',
  pattern: 'guides/**/*.mdx',
  schema: dxSchema,
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
  collections: { skills, hooks, configs, guides, posts },
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
  },
})

export default config
