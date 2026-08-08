// ABOUTME: Lint orchestration — discovers content files, parses frontmatter, runs rules.
// ABOUTME: Supports both full-tree scan and --files mode for staged-only lint (LINT-05).

import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { join, relative, resolve, sep } from 'node:path'
import matter from 'gray-matter'
import { DX_COLLECTIONS } from 'blink-registry'
import { frontmatterSchemaRule } from '@/lint/rules/frontmatter-schema'
import { artifactPairRule } from '@/lint/rules/artifact-pair'
import { voicePrimitiveRule } from '@/lint/rules/voice-primitive'
import { noInlineArtifactBodyRule } from '@/lint/rules/no-inline-artifact-body'
import type { LintDiagnostic, LintContext, LintRule } from '@/lint/types'

export interface LintOptions {
  contentRoot: string
  files?: string[]
  fix?: boolean
}

export interface LintResult {
  diagnostics: LintDiagnostic[]
  fixed: string[]
  errorCount: number
  warningCount: number
}

const rules: LintRule[] = [
  frontmatterSchemaRule,
  artifactPairRule,
  voicePrimitiveRule,
  noInlineArtifactBodyRule
]

/**
 * Lint targets are `.mdx` entries inside DX collections. `posts/` (and any
 * future non-DX collection) has its own schema in velite.config.ts — running
 * the DX frontmatter schema against it produced 2 false errors per post.
 * `.artifact.md` siblings are validated transitively via the artifact-pair
 * rule on their parent entry, never as standalone lint targets.
 */
function isDxEntry(contentRoot: string, file: string): boolean {
  if (!file.endsWith('.mdx')) return false
  const rel = relative(resolve(contentRoot), resolve(file))
  if (rel.startsWith('..')) return false
  const collection = rel.split(sep)[0]
  return (DX_COLLECTIONS as readonly string[]).includes(collection)
}

function discoverMdxFiles(dir: string): string[] {
  const files: string[] = []

  const scan = (currentDir: string) => {
    let entries: string[]
    try {
      entries = readdirSync(currentDir)
    } catch {
      return
    }

    for (const name of entries) {
      if (name === 'node_modules' || name === '.git') continue
      const fullPath = join(currentDir, name)
      try {
        const s = statSync(fullPath)
        if (s.isDirectory()) {
          scan(fullPath)
        } else if (s.isFile() && name.endsWith('.mdx')) {
          files.push(fullPath)
        }
      } catch {
        continue
      }
    }
  }

  scan(dir)
  return files
}

export async function runLint(options: LintOptions): Promise<LintResult> {
  const { contentRoot, files: specifiedFiles, fix = false } = options
  const diagnostics: LintDiagnostic[] = []
  const fixed: string[] = []

  const candidates = specifiedFiles ?? discoverMdxFiles(contentRoot)
  const mdxFiles = candidates.filter(f => isDxEntry(contentRoot, f))

  // A missing or empty content root must never read as a clean run — that
  // exact silence let the pre-commit gate no-op for a whole phase. Explicit
  // --files selections may legitimately filter to nothing (e.g. a commit
  // touching only posts), so only full-tree scans get this guard.
  if (!specifiedFiles && mdxFiles.length === 0) {
    return {
      diagnostics: [
        {
          file: contentRoot,
          severity: 'error',
          rule: 'content-root',
          message: `no lintable DX entries found under '${contentRoot}' — wrong --content-root?`
        }
      ],
      fixed: [],
      errorCount: 1,
      warningCount: 0
    }
  }

  for (const file of mdxFiles) {
    let content: string
    try {
      content = readFileSync(file, 'utf-8')
    } catch {
      continue
    }

    const parsed = matter(content)
    let ctx: LintContext = {
      file,
      frontmatter: parsed.data,
      body: parsed.content,
      contentRoot
    }

    for (const rule of rules) {
      const ruleDiagnostics = rule.check(ctx)
      diagnostics.push(...ruleDiagnostics)

      if (fix && rule.fix && ruleDiagnostics.length > 0) {
        const fixResult = rule.fix(ctx)
        if (fixResult) {
          // Write sibling files if the fix creates them (e.g., artifact stubs)
          if (fixResult.siblingFiles) {
            for (const sf of fixResult.siblingFiles) {
              try {
                writeFileSync(sf.path, sf.content, 'utf-8')
                fixed.push(sf.path)
              } catch {
                // Write failed — skip
              }
            }
          }

          // Update ctx for subsequent rules if frontmatter or body changed
          if (fixResult.frontmatter || fixResult.body) {
            ctx = {
              ...ctx,
              frontmatter: fixResult.frontmatter ?? ctx.frontmatter,
              body: fixResult.body ?? ctx.body
            }
            const output = matter.stringify(ctx.body, ctx.frontmatter)
            try {
              writeFileSync(file, output, 'utf-8')
              fixed.push(file)
            } catch {
              // Write failed — skip
            }
          }
        }
      }
    }
  }

  // Orphan scan sweeps the whole tree — full-tree runs only. In --files mode
  // (staged-only lint per LINT-05) it would report pre-existing orphans
  // unrelated to the commit being checked.
  if (!specifiedFiles) {
    const orphanDiagnostics = artifactPairRule.checkOrphans(contentRoot)
    diagnostics.push(...orphanDiagnostics)
  }

  const errorCount = diagnostics.filter(d => d.severity === 'error').length
  const warningCount = diagnostics.filter(d => d.severity === 'warning').length

  return { diagnostics, fixed, errorCount, warningCount }
}
