// ABOUTME: Tests for the lint reporter (ESLint-style diagnostic output formatter).
// ABOUTME: Validates grouping by file, severity coloring, and summary footer.
import { formatDiagnostics } from '@/lint/reporter'
import type { LintDiagnostic } from '@/lint/types'

describe('formatDiagnostics', () => {
  it('groups diagnostics by file path with file header', () => {
    const diagnostics: LintDiagnostic[] = [
      { file: 'content/skills/a.mdx', severity: 'error', rule: 'frontmatter-schema', message: 'missing title' },
      { file: 'content/skills/a.mdx', severity: 'warning', rule: 'voice-primitive', message: 'voice not used' },
      { file: 'content/configs/b.mdx', severity: 'error', rule: 'frontmatter-schema', message: 'missing applies_to' },
    ]
    const output = formatDiagnostics(diagnostics)
    expect(output).toContain('content/skills/a.mdx')
    expect(output).toContain('content/configs/b.mdx')
  })

  it('indents each violation under file header with severity, message, and rule name', () => {
    const diagnostics: LintDiagnostic[] = [
      { file: 'content/skills/a.mdx', severity: 'error', rule: 'frontmatter-schema', message: 'missing title', line: 3, column: 1 },
    ]
    const output = formatDiagnostics(diagnostics)
    expect(output).toContain('missing title')
    expect(output).toContain('frontmatter-schema')
    expect(output).toContain('3:1')
  })

  it('includes summary footer with error count and warning count', () => {
    const diagnostics: LintDiagnostic[] = [
      { file: 'a.mdx', severity: 'error', rule: 'r1', message: 'm1' },
      { file: 'a.mdx', severity: 'warning', rule: 'r2', message: 'm2' },
      { file: 'b.mdx', severity: 'error', rule: 'r1', message: 'm3' },
    ]
    const output = formatDiagnostics(diagnostics)
    expect(output).toContain('2 error')
    expect(output).toContain('1 warning')
  })

  it('returns empty string for zero diagnostics', () => {
    const output = formatDiagnostics([])
    expect(output).toBe('')
  })

  it('handles mixed error and warning severities in output', () => {
    const diagnostics: LintDiagnostic[] = [
      { file: 'content/a.mdx', severity: 'error', rule: 'frontmatter-schema', message: 'type error' },
      { file: 'content/a.mdx', severity: 'warning', rule: 'voice-primitive', message: 'missing voice' },
    ]
    const output = formatDiagnostics(diagnostics)
    expect(output).toContain('error')
    expect(output).toContain('warning')
    expect(output).toContain('type error')
    expect(output).toContain('missing voice')
  })

  it('runLint on directory with valid MDX returns zero diagnostics', async () => {
    // Integration test — deferred to runner implementation
    const { runLint } = await import('@/lint/runner')
    const { mkdtempSync, writeFileSync, mkdirSync } = await import('node:fs')
    const { join } = await import('node:path')
    const { tmpdir } = await import('node:os')

    const dir = mkdtempSync(join(tmpdir(), 'blink-lint-runner-'))
    // Lint targets live inside DX collections — files at the content root
    // are not dispatched to any schema.
    mkdirSync(join(dir, 'skills'))
    writeFileSync(
      join(dir, 'skills', 'valid.mdx'),
      [
        '---',
        'title: Valid Skill',
        'description: A valid skill for testing.',
        'applies_to:',
        '  - claude-code',
        '---',
        '',
        '## Overview',
        '',
        'Content here.',
      ].join('\n'),
    )

    const result = await runLint({ contentRoot: dir })
    expect(result.diagnostics).toEqual([])
    expect(result.errorCount).toBe(0)
  })

  it('runLint on directory with invalid MDX returns frontmatter-schema error', async () => {
    const { runLint } = await import('@/lint/runner')
    const { mkdtempSync, writeFileSync, mkdirSync } = await import('node:fs')
    const { join } = await import('node:path')
    const { tmpdir } = await import('node:os')

    const dir = mkdtempSync(join(tmpdir(), 'blink-lint-runner-'))
    mkdirSync(join(dir, 'skills'))
    writeFileSync(
      join(dir, 'skills', 'invalid.mdx'),
      [
        '---',
        'description: Missing title field.',
        'applies_to:',
        '  - claude-code',
        '---',
        '',
        '## Content',
      ].join('\n'),
    )

    const result = await runLint({ contentRoot: dir })
    expect(result.diagnostics.length).toBeGreaterThan(0)
    expect(result.diagnostics.some((d) => d.rule === 'frontmatter-schema')).toBe(true)
    expect(result.errorCount).toBeGreaterThan(0)
  })
})
