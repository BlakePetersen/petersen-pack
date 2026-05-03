// ABOUTME: CLI command for generating content scaffolds (MDX + companion .artifact.md).
// ABOUTME: Produces collection-specific body templates with frontmatter derived from DxFrontmatterSchema.

import { defineCommand } from 'citty'
import { consola } from 'consola'
import pc from 'picocolors'
import { resolve } from 'node:path'
import { formatActionLabel, formatDryRunHeader } from '@/output'
import { generateScaffold } from '@/scaffold/generator'

export default defineCommand({
  meta: {
    name: 'scaffold',
    description: 'Generate content scaffolds',
  },
  args: {
    collection: {
      type: 'positional',
      description: 'Collection type (skill, config, hook, guide)',
      required: true,
    },
    slug: {
      type: 'positional',
      description: 'Entry slug (e.g., my-new-skill)',
      required: true,
    },
    'dry-run': {
      type: 'boolean',
      description: 'Preview without writing',
      default: false,
    },
    force: {
      type: 'boolean',
      description: 'Overwrite existing files',
      default: false,
    },
    voice: {
      type: 'string',
      description:
        'Voice primitives to stub (comma-separated: author-note,decision-rationale)',
    },
    'content-root': {
      type: 'string',
      description: 'Path to content directory',
    },
  },
  async run({ args }) {
    const collection = args.collection as string
    const slug = args.slug as string
    const dryRun = args['dry-run']
    const force = args.force
    const voice = args.voice
      ? (args.voice as string).split(',').map((v) => v.trim())
      : undefined
    const contentRoot = args['content-root']
      ? resolve(args['content-root'] as string)
      : resolve(process.cwd(), 'apps/blakepetersen.io/content')

    const result = await generateScaffold({
      collection,
      slug,
      contentRoot,
      dryRun,
      force,
      voice,
    })

    const prefix = dryRun ? `${formatDryRunHeader()} ` : ''

    for (const file of result.files) {
      consola.success(
        `${prefix}${formatActionLabel('write')} ${pc.dim(file.path)}`,
      )
    }
  },
})
