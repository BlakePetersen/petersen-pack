// ABOUTME: LINT-02 — enforces artifact-pair sync (requires_artifact <-> sibling .artifact.md).
// ABOUTME: Missing artifact = error; orphan artifact = warning. Fix generates stub .artifact.md per D-07.

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, basename, dirname } from 'node:path'
import matter from 'gray-matter'
import type { LintDiagnostic, LintRule, LintContext } from '@/lint/types'

function getSiblingArtifactPath(mdxFile: string): string {
  return mdxFile.replace(/\.mdx$/, '.artifact.md')
}

function getSiblingArtifactDirPath(mdxFile: string): string {
  return mdxFile.replace(/\.mdx$/, '.artifact')
}

function hasArtifactSibling(mdxFile: string): boolean {
  return existsSync(getSiblingArtifactPath(mdxFile)) || existsSync(getSiblingArtifactDirPath(mdxFile))
}

export const artifactPairRule: LintRule & {
  checkOrphans(contentRoot: string): LintDiagnostic[]
} = {
  name: 'artifact-pair',

  check(ctx: LintContext): LintDiagnostic[] {
    const requiresArtifact = ctx.frontmatter.requires_artifact === true

    if (!requiresArtifact) return []

    if (hasArtifactSibling(ctx.file)) return []

    return [{
      file: ctx.file,
      severity: 'error',
      rule: 'artifact-pair',
      message: 'requires_artifact is true but sibling .artifact.md is missing',
    }]
  },

  fix(ctx: LintContext): { frontmatter?: Record<string, unknown>; body?: string } | null {
    const requiresArtifact = ctx.frontmatter.requires_artifact === true

    if (!requiresArtifact) return null
    if (hasArtifactSibling(ctx.file)) return null

    const title = (ctx.frontmatter.title as string) || 'Untitled'
    const description = (ctx.frontmatter.description as string) || ''

    const stubContent = [
      `# ${title}`,
      '',
      description ? `${description}` : '',
      description ? '' : '',
      '<!-- TODO: Add artifact content -->',
      '',
    ].filter((line, i, arr) => !(line === '' && arr[i - 1] === '')).join('\n')

    return { body: stubContent }
  },

  checkOrphans(contentRoot: string): LintDiagnostic[] {
    const diagnostics: LintDiagnostic[] = []

    const scanDir = (dir: string) => {
      let entries: ReturnType<typeof readdirSync>
      try {
        entries = readdirSync(dir, { withFileTypes: true })
      } catch {
        return
      }

      for (const entry of entries) {
        const fullPath = join(dir, entry.name)

        if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.git') {
          scanDir(fullPath)
          continue
        }

        if (!entry.isFile() || !entry.name.endsWith('.artifact.md')) continue

        // Check for sibling .mdx
        const mdxSibling = fullPath.replace(/\.artifact\.md$/, '.mdx')

        if (!existsSync(mdxSibling)) {
          diagnostics.push({
            file: fullPath,
            severity: 'warning',
            rule: 'artifact-pair',
            message: 'orphan .artifact.md — no sibling .mdx found',
          })
          continue
        }

        // Sibling .mdx exists — check if requires_artifact is set
        try {
          const mdxContent = readFileSync(mdxSibling, 'utf-8')
          const { data } = matter(mdxContent)
          if (data.requires_artifact !== true) {
            diagnostics.push({
              file: fullPath,
              severity: 'warning',
              rule: 'artifact-pair',
              message: 'sibling .mdx has requires_artifact: false — consider setting to true or removing .artifact.md',
            })
          }
        } catch {
          // Cannot parse sibling — skip
        }
      }
    }

    scanDir(contentRoot)
    return diagnostics
  },
}
