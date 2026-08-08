// ABOUTME: CLI command for content linting (frontmatter schema, artifact-pair, voice primitives).
// ABOUTME: Reports ESLint-style output. Exits non-zero on errors, exit 0 on warnings-only per D-06.

import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { defineCommand } from 'citty'
import { consola } from 'consola'
import { runLint } from '@/lint/runner'
import { formatDiagnostics } from '@/lint/reporter'

/**
 * The command runs from the app dir (lint-staged, package scripts) or the
 * monorepo root (CI) — a fixed relative default silently pointed at a
 * nonexistent directory in one of the two, which the runner used to treat
 * as a clean run. Prefer `content/` beside the cwd, else the monorepo path.
 */
function defaultContentRoot(): string {
  if (existsSync(join(process.cwd(), 'content'))) return 'content'
  return 'apps/blakepetersen.io/content'
}

export default defineCommand({
  meta: {
    name: 'lint',
    description: 'Lint content files'
  },
  args: {
    files: {
      type: 'string',
      description: 'Lint only these files (comma-separated paths)',
      required: false
    },
    fix: {
      type: 'boolean',
      description: 'Auto-fix fixable violations',
      default: false
    },
    'content-root': {
      type: 'string',
      description:
        'Path to content directory (default: ./content if present, else apps/blakepetersen.io/content)',
      required: false
    }
  },
  async run({ args }) {
    const contentRoot = (args['content-root'] as string) || defaultContentRoot()
    const parsedFiles = args.files
      ? (args.files as string).split(',').map(f => f.trim())
      : undefined

    const result = await runLint({
      contentRoot,
      files: parsedFiles,
      fix: args.fix as boolean
    })

    if (result.diagnostics.length > 0) {
      consola.log(formatDiagnostics(result.diagnostics))
    }

    if (result.fixed.length > 0) {
      consola.success(`Fixed ${result.fixed.length} file(s)`)
    }

    if (result.errorCount > 0) {
      process.exit(1)
    }

    if (result.errorCount === 0 && result.warningCount > 0) {
      return
    }

    if (result.diagnostics.length === 0) {
      consola.success('No issues found')
    }
  }
})
