// ABOUTME: Tests for the frontmatter-schema lint rule (LINT-01).
// ABOUTME: Validates MDX frontmatter against JSON Schema derived from DxFrontmatterSchema.
import { frontmatterSchemaRule } from '@/lint/rules/frontmatter-schema'
import type { LintContext } from '@/lint/types'

function makeContext(frontmatter: Record<string, unknown>): LintContext {
  return {
    file: 'content/skills/test-skill.mdx',
    frontmatter,
    body: '## Overview\n\nSome content.',
    contentRoot: 'content',
  }
}

const VALID_FRONTMATTER = {
  title: 'Test Skill',
  description: 'A valid test skill.',
  applies_to: ['claude-code'],
}

describe('frontmatterSchemaRule', () => {
  it('returns empty array for valid skill frontmatter', () => {
    const ctx = makeContext(VALID_FRONTMATTER)
    const diagnostics = frontmatterSchemaRule.check(ctx)
    expect(diagnostics).toEqual([])
  })

  it('returns error diagnostic for missing required field title', () => {
    const ctx = makeContext({
      description: 'Missing title.',
      applies_to: ['claude-code'],
    })
    const diagnostics = frontmatterSchemaRule.check(ctx)
    expect(diagnostics.length).toBeGreaterThan(0)
    expect(diagnostics.some((d) => d.message.includes('title'))).toBe(true)
    expect(diagnostics[0].severity).toBe('error')
  })

  it('returns error diagnostic for missing required field applies_to', () => {
    const ctx = makeContext({
      title: 'Test',
      description: 'Missing applies_to.',
    })
    const diagnostics = frontmatterSchemaRule.check(ctx)
    expect(diagnostics.length).toBeGreaterThan(0)
    expect(diagnostics.some((d) => d.message.includes('applies_to'))).toBe(true)
    expect(diagnostics[0].severity).toBe('error')
  })

  it('returns error diagnostic for wrong type (title as number)', () => {
    const ctx = makeContext({
      title: 42,
      description: 'Wrong type.',
      applies_to: ['claude-code'],
    })
    const diagnostics = frontmatterSchemaRule.check(ctx)
    expect(diagnostics.length).toBeGreaterThan(0)
    expect(diagnostics.some((d) => d.message.includes('title') || d.message.includes('type'))).toBe(true)
    expect(diagnostics[0].severity).toBe('error')
  })

  it('applies defaults — omitted optional fields do not produce errors', () => {
    const ctx = makeContext({
      title: 'Minimal',
      description: 'Only required fields.',
      applies_to: ['vscode'],
    })
    const diagnostics = frontmatterSchemaRule.check(ctx)
    expect(diagnostics).toEqual([])
  })

  it('fix mode returns corrected frontmatter with defaults applied', () => {
    const ctx = makeContext({
      title: 'Fix Test',
      description: 'Needs defaults.',
      applies_to: ['cursor'],
    })
    const result = frontmatterSchemaRule.fix!(ctx)
    expect(result).not.toBeNull()
    expect(result!.frontmatter).toBeDefined()
    expect(result!.frontmatter!.tags).toEqual([])
    expect(result!.frontmatter!.voice).toEqual([])
    expect(result!.frontmatter!.draft).toBe(false)
    expect(result!.frontmatter!.requires_artifact).toBe(false)
  })

  it('all diagnostics have severity error and rule name frontmatter-schema', () => {
    const ctx = makeContext({})
    const diagnostics = frontmatterSchemaRule.check(ctx)
    expect(diagnostics.length).toBeGreaterThan(0)
    for (const d of diagnostics) {
      expect(d.severity).toBe('error')
      expect(d.rule).toBe('frontmatter-schema')
    }
  })
})
