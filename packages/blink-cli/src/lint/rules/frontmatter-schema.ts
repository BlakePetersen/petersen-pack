// ABOUTME: LINT-01 — validates MDX frontmatter against DxFrontmatterSchema (Zod v4) directly.
// ABOUTME: Supersedes the Ajv + z.toJSONSchema path (Blake 2026-07-12). Severity: error (blocks CI).
import { DxFrontmatterSchema } from 'blink-registry'
import type { LintDiagnostic, LintRule, LintContext } from '@/lint/types'

export const frontmatterSchemaRule: LintRule = {
  name: 'frontmatter-schema',

  check(ctx: LintContext): LintDiagnostic[] {
    const result = DxFrontmatterSchema.safeParse(ctx.frontmatter)
    if (result.success) return []

    return result.error.issues.map(issue => ({
      file: ctx.file,
      severity: 'error' as const,
      rule: 'frontmatter-schema',
      message: `${issue.path.length ? '/' + issue.path.join('/') : '/'}: ${issue.message}`
    }))
  },

  fix(
    ctx: LintContext
  ): { frontmatter?: Record<string, unknown>; body?: string } | null {
    const result = DxFrontmatterSchema.safeParse(ctx.frontmatter)
    if (!result.success) return null // cannot apply defaults to structurally-invalid frontmatter

    const normalized = result.data as Record<string, unknown>
    const changed =
      JSON.stringify(normalized) !== JSON.stringify(ctx.frontmatter)
    return changed ? { frontmatter: normalized } : null
  }
}
