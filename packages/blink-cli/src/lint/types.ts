// ABOUTME: Shared types for the blink lint subsystem.
// ABOUTME: Defines LintDiagnostic, LintRule, and severity constants.

export type Severity = 'error' | 'warning'

export interface LintDiagnostic {
  file: string
  line?: number
  column?: number
  severity: Severity
  rule: string
  message: string
}

export interface LintContext {
  file: string
  frontmatter: Record<string, unknown>
  body: string
  contentRoot: string
}

export interface LintRule {
  name: string
  check(ctx: LintContext): LintDiagnostic[]
  fix?(ctx: LintContext): { frontmatter?: Record<string, unknown>; body?: string } | null
}
