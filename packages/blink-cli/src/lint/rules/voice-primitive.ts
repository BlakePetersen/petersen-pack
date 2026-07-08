// ABOUTME: LINT-03 — checks voice-primitive invocation in MDX body matches voice[] frontmatter.
// ABOUTME: Declared-but-uninvoked is an error (promoted on a 20/20 organic pass rate); heading advisory stays warning.

import type { LintDiagnostic, LintRule, LintContext } from '@/lint/types'

const VOICE_COMPONENT_MAP: Record<string, { component: string; pattern: RegExp }> = {
  'author-note': { component: 'AuthorNote', pattern: /<AuthorNote[\s>]/ },
  'decision-rationale': { component: 'DecisionRationale', pattern: /<DecisionRationale[\s>]/ },
}

const RATIONALE_HEADING_PATTERN = /^##\s+(Why|Decision|Trade-?off|Rationale|Reasoning)/mi

export const voicePrimitiveRule: LintRule = {
  name: 'voice-primitive',

  check(ctx: LintContext): LintDiagnostic[] {
    const diagnostics: LintDiagnostic[] = []
    const voice = Array.isArray(ctx.frontmatter.voice) ? ctx.frontmatter.voice as string[] : []

    // Check declared voice values have matching components in body
    for (const value of voice) {
      const mapping = VOICE_COMPONENT_MAP[value]
      if (!mapping) continue

      if (!mapping.pattern.test(ctx.body)) {
        diagnostics.push({
          file: ctx.file,
          severity: 'error',
          rule: 'voice-primitive',
          message: `voice '${value}' declared but <${mapping.component}> not found in body`,
        })
      }
    }

    // Advisory: detect rationale-shaped headings without voice declaration
    if (!voice.includes('decision-rationale')) {
      const match = ctx.body.match(RATIONALE_HEADING_PATTERN)
      if (match) {
        diagnostics.push({
          file: ctx.file,
          severity: 'warning',
          rule: 'voice-primitive',
          message: `heading '## ${match[1]}' looks like a decision rationale — consider adding voice: ['decision-rationale'] to frontmatter`,
        })
      }
    }

    return diagnostics
  },

  fix(ctx: LintContext): { frontmatter?: Record<string, unknown>; body?: string } | null {
    const voice = Array.isArray(ctx.frontmatter.voice) ? [...ctx.frontmatter.voice as string[]] : []

    // If rationale-shaped heading detected and voice missing 'decision-rationale', add it
    if (!voice.includes('decision-rationale')) {
      const match = ctx.body.match(RATIONALE_HEADING_PATTERN)
      if (match) {
        voice.push('decision-rationale')
        return { frontmatter: { ...ctx.frontmatter, voice } }
      }
    }

    return null
  },
}
