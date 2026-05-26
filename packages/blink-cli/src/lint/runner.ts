// ABOUTME: Lint orchestration — discovers content files, parses frontmatter, runs rules.
// ABOUTME: Supports both full-tree scan and --files mode for staged-only lint (LINT-05).

import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import matter from 'gray-matter'
import { frontmatterSchemaRule } from '@/lint/rules/frontmatter-schema'
import { artifactPairRule } from '@/lint/rules/artifact-pair'
import { voicePrimitiveRule } from '@/lint/rules/voice-primitive'
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

const rules: LintRule[] = [frontmatterSchemaRule, artifactPairRule, voicePrimitiveRule]

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

  const mdxFiles = specifiedFiles ?? discoverMdxFiles(contentRoot)

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
      contentRoot,
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
              body: fixResult.body ?? ctx.body,
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

  // Run orphan scan
  const orphanDiagnostics = artifactPairRule.checkOrphans(contentRoot)
  diagnostics.push(...orphanDiagnostics)

  const errorCount = diagnostics.filter((d) => d.severity === 'error').length
  const warningCount = diagnostics.filter((d) => d.severity === 'warning').length

  return { diagnostics, fixed, errorCount, warningCount }
}
