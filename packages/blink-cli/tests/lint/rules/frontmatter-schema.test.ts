// ABOUTME: Tests for the frontmatter-schema lint rule (LINT-01).
// ABOUTME: Validates MDX frontmatter directly against DxFrontmatterSchema (Zod v4).
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

  it('surfaces the offending field path for missing required field title', () => {
    const ctx = makeContext({
      description: 'Missing title.',
      applies_to: ['claude-code'],
    })
    const diagnostics = frontmatterSchemaRule.check(ctx)
    expect(diagnostics.length).toBeGreaterThan(0)
    expect(diagnostics.some((d) => d.message.startsWith('/title:'))).toBe(true)
    expect(diagnostics[0].severity).toBe('error')
  })

  it('surfaces the offending field path for missing required field applies_to', () => {
    const ctx = makeContext({
      title: 'Test',
      description: 'Missing applies_to.',
    })
    const diagnostics = frontmatterSchemaRule.check(ctx)
    expect(diagnostics.length).toBeGreaterThan(0)
    expect(diagnostics.some((d) => d.message.startsWith('/applies_to:'))).toBe(true)
    expect(diagnostics[0].severity).toBe('error')
  })

  it('reports a type mismatch under the field path (title as number)', () => {
    const ctx = makeContext({
      title: 42,
      description: 'Wrong type.',
      applies_to: ['claude-code'],
    })
    const diagnostics = frontmatterSchemaRule.check(ctx)
    expect(diagnostics.length).toBeGreaterThan(0)
    const titleDiag = diagnostics.find((d) => d.message.startsWith('/title:'))
    expect(titleDiag).toBeDefined()
    expect(titleDiag!.message).toContain('expected string')
  })

  it('reports a non-ISO updated_context under its field path (registry tightened to z.iso.date)', () => {
    const ctx = makeContext({
      ...VALID_FRONTMATTER,
      updated_context: 'last week',
    })
    const diagnostics = frontmatterSchemaRule.check(ctx)
    expect(diagnostics.some((d) => d.message.startsWith('/updated_context:'))).toBe(true)
    expect(diagnostics[0].severity).toBe('error')
  })

  it('omitted optional fields do not produce errors', () => {
    const ctx = makeContext({
      title: 'Minimal',
      description: 'Only required fields.',
      applies_to: ['vscode'],
    })
    const diagnostics = frontmatterSchemaRule.check(ctx)
    expect(diagnostics).toEqual([])
  })

  it('fix mode returns normalized frontmatter with Zod defaults applied', () => {
    const ctx = makeContext({
      title: 'Fix Test',
      description: 'Needs defaults.',
      applies_to: ['cursor'],
    })
    const result = frontmatterSchemaRule.fix!(ctx)
    expect(result).not.toBeNull()
    expect(result!.frontmatter).toBeDefined()
    expect(result!.frontmatter!.dependencies).toEqual([])
    expect(result!.frontmatter!.tags).toEqual([])
    expect(result!.frontmatter!.voice).toEqual([])
    expect(result!.frontmatter!.draft).toBe(false)
    expect(result!.frontmatter!.requires_artifact).toBe(false)
    expect(result!.frontmatter!.decisions).toEqual([])
    expect(result!.frontmatter!.related).toEqual([])
  })

  it('fix mode returns null for already-complete frontmatter (no change)', () => {
    const ctx = makeContext({
      title: 'Complete',
      description: 'Nothing to default.',
      applies_to: ['claude-code'],
      dependencies: [],
      draft: false,
      tags: [],
      voice: [],
      requires_artifact: false,
      decisions: [],
      related: [],
    })
    const result = frontmatterSchemaRule.fix!(ctx)
    expect(result).toBeNull()
  })

  it('fix mode returns null for structurally-invalid frontmatter (cannot default)', () => {
    const ctx = makeContext({
      description: 'Missing title.',
      applies_to: ['claude-code'],
    })
    const result = frontmatterSchemaRule.fix!(ctx)
    expect(result).toBeNull()
  })

  it('all diagnostics have severity error and rule name frontmatter-schema', () => {
    const ctx = makeContext({})
    const diagnostics = frontmatterSchemaRule.check(ctx)
    expect(diagnostics.length).toBeGreaterThan(0)
    for (const d of diagnostics) {
      expect(d.severity).toBe('error')
      expect(d.rule).toBe('frontmatter-schema')
      expect(d.message.startsWith('/')).toBe(true)
    }
  })
})
