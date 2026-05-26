// ABOUTME: CLI command for porting Obsidian markdown to MDX content.
// ABOUTME: Two-step pipeline: 'stage' transforms to staging dir, 'commit' moves to content path.

import { defineCommand } from 'citty'
import { consola } from 'consola'
import { existsSync } from 'node:fs'
import { stageEntry, commitEntry } from '@/port/staging'

export default defineCommand({
  meta: {
    name: 'port',
    description: 'Port Obsidian markdown to MDX content',
  },
  args: {
    action: {
      type: 'positional',
      description: 'Action: stage or commit',
      required: true,
    },
    target: {
      type: 'positional',
      description: 'Input directory (stage) or slug (commit)',
      required: true,
    },
    collection: {
      type: 'string',
      description: 'Target collection for commit (e.g., skills)',
      required: false,
    },
    'content-root': {
      type: 'string',
      description: 'Path to content directory',
      default: 'apps/blakepetersen.io/content',
    },
  },
  async run({ args }) {
    const contentRoot = args['content-root'] as string
    const action = args.action as string
    const target = args.target as string

    if (action === 'stage') {
      if (!existsSync(target)) {
        consola.error(`Input directory not found: ${target}`)
        process.exit(1)
      }

      const result = await stageEntry({ inputDir: target, contentRoot })
      consola.success(
        `Staged ${result.staged.length} file(s) to .obsidian-port-staging/`,
      )
      for (const file of result.staged) {
        consola.info(`  ${file.slug} -> ${file.path}`)
      }
    } else if (action === 'commit') {
      if (!args.collection) {
        consola.error(
          'The --collection flag is required for commit (e.g., --collection skills)',
        )
        process.exit(1)
      }

      await commitEntry({
        slug: target,
        collection: args.collection as string,
        contentRoot,
      })
      consola.success(
        `Committed ${target} to content/${args.collection}/${target}.mdx`,
      )
    } else {
      consola.error('Unknown action. Use "stage" or "commit".')
      process.exit(1)
    }
  },
})
