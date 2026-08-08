// ABOUTME: Tests for the voice-primitive lint rule (LINT-03).
// ABOUTME: Validates voice[] frontmatter against component invocations in MDX body.
import { voicePrimitiveRule } from '@/lint/rules/voice-primitive'
import type { LintContext } from '@/lint/types'

function makeContext(
  frontmatter: Record<string, unknown>,
  body: string
): LintContext {
  return {
    file: 'content/skills/test-skill.mdx',
    frontmatter,
    body,
    contentRoot: 'content'
  }
}

describe('voicePrimitiveRule', () => {
  it('no diagnostic when voice=[author-note] and body contains <AuthorNote', () => {
    const ctx = makeContext(
      { voice: ['author-note'] },
      '## Overview\n\n<AuthorNote>\nSome note.\n</AuthorNote>'
    )
    const diagnostics = voicePrimitiveRule.check(ctx)
    expect(diagnostics).toEqual([])
  })

  it('error when voice=[author-note] but body does NOT contain <AuthorNote', () => {
    const ctx = makeContext(
      { voice: ['author-note'] },
      '## Overview\n\nNo author note here.'
    )
    const diagnostics = voicePrimitiveRule.check(ctx)
    expect(diagnostics.length).toBe(1)
    expect(diagnostics[0].severity).toBe('error')
    expect(diagnostics[0].message).toContain('author-note')
    expect(diagnostics[0].message).toContain('AuthorNote')
  })

  it('error when voice=[decision-rationale] but body does NOT contain <DecisionRationale', () => {
    const ctx = makeContext(
      { voice: ['decision-rationale'] },
      '## Overview\n\nNo rationale component.'
    )
    const diagnostics = voicePrimitiveRule.check(ctx)
    expect(diagnostics.length).toBe(1)
    expect(diagnostics[0].severity).toBe('error')
    expect(diagnostics[0].message).toContain('decision-rationale')
    expect(diagnostics[0].message).toContain('DecisionRationale')
  })

  it('no diagnostic when voice=[] regardless of body content', () => {
    const ctx = makeContext(
      { voice: [] },
      '## Why\n\nSome rationale heading with content.'
    )
    const diagnostics = voicePrimitiveRule.check(ctx)
    // voice=[] means no voice declared, so no missing-component check
    // However, advisory check for rationale-shaped heading may still fire
    // That's tested separately — this tests the "no voice = no missing component" path
    const missingComponentDiagnostics = diagnostics.filter(d =>
      d.message.includes('declared but')
    )
    expect(missingComponentDiagnostics).toEqual([])
  })

  it('warning when body contains rationale-shaped heading but voice does NOT include decision-rationale', () => {
    const ctx = makeContext(
      { voice: [] },
      '## Why\n\nWe chose this approach because...'
    )
    const diagnostics = voicePrimitiveRule.check(ctx)
    expect(diagnostics.length).toBe(1)
    expect(diagnostics[0].severity).toBe('warning')
    expect(diagnostics[0].message).toContain('decision-rationale')
    expect(diagnostics[0].message).toContain('heading')
  })

  it('declared-but-uninvoked diagnostics are errors; the heading advisory stays a warning', () => {
    // LINT-03 promoted warn→error per the Phase 29 delta report (20/20
    // organic invocation rate). The rationale-heading nudge remains advisory.
    const ctx = makeContext(
      { voice: ['author-note', 'decision-rationale'] },
      '## Overview\n\nNo components at all.'
    )
    const diagnostics = voicePrimitiveRule.check(ctx)
    expect(diagnostics.length).toBeGreaterThan(0)
    for (const d of diagnostics.filter(x =>
      x.message.includes('declared but')
    )) {
      expect(d.severity).toBe('error')
    }

    const advisory = voicePrimitiveRule.check(
      makeContext({ voice: [] }, '## Why\n\nBecause.')
    )
    expect(advisory.length).toBe(1)
    expect(advisory[0].severity).toBe('warning')
  })

  it('fix mode adds missing voice value when rationale-shaped heading detected', () => {
    const ctx = makeContext(
      { voice: [] },
      '## Decision\n\nWe decided to use X.'
    )
    const result = voicePrimitiveRule.fix!(ctx)
    expect(result).not.toBeNull()
    expect(result!.frontmatter).toBeDefined()
    expect(result!.frontmatter!.voice as string[]).toContain(
      'decision-rationale'
    )
    // Fix does NOT modify body
    expect(result!.body).toBeUndefined()
  })
})
