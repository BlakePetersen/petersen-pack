// ABOUTME: Velite content pipeline configuration with typed schemas for all collections.
// ABOUTME: Defines 5 collections (skills, hooks, configs, guides, posts) with Zod validation.

import { defineCollection, defineConfig, s } from 'velite'

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
}

// Computed fields shared across DX collections
const withComputedFields = (data: Record<string, unknown>, { meta }: { meta: { path?: string } }) => ({
  ...data,
  category: (data.category as string) ?? meta.path?.split('/')[0] ?? 'uncategorized',
  readingTime: (data.metadata as { readingTime: number }).readingTime,
  wordCount: (data.metadata as { wordCount: number }).wordCount,
})

const dxSchema = s
  .object({
    ...dxFields,
    slug: s.path(),
    excerpt: s.excerpt(),
    metadata: s.metadata(),
    code: s.mdx(),
  })
  .transform(withComputedFields)

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
      slug: s.path(),
      excerpt: s.excerpt(),
      metadata: s.metadata(),
      code: s.mdx(),
    })
    .transform((data) => ({
      ...data,
      category: 'posts',
      readingTime: data.metadata.readingTime,
      wordCount: data.metadata.wordCount,
    })),
})

export default defineConfig({
  root: 'content',
  output: {
    data: '.velite',
    assets: 'public/static',
    base: '/static/',
    clean: true,
  },
  collections: { skills, hooks, configs, guides, posts },
  strict: true,
  prepare: ({ skills, hooks, configs, guides, posts }) => {
    const isProduction = process.env.NODE_ENV === 'production'
    if (isProduction) {
      return {
        skills: skills.filter((s) => !s.draft),
        hooks: hooks.filter((h) => !h.draft),
        configs: configs.filter((c) => !c.draft),
        guides: guides.filter((g) => !g.draft),
        posts: posts.filter((p) => !p.draft),
      }
    }
  },
})
