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
  },
})

export default config
