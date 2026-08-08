// ABOUTME: ESLint-style diagnostic output formatter for blink lint.
// ABOUTME: Groups violations by file with colored severity, rule names, and summary footer (D-05).

import pc from 'picocolors'
import type { LintDiagnostic } from '@/lint/types'

export function formatDiagnostics(diagnostics: LintDiagnostic[]): string {
  if (diagnostics.length === 0) return ''

  const grouped = new Map<string, LintDiagnostic[]>()
  for (const d of diagnostics) {
    const group = grouped.get(d.file) ?? []
    group.push(d)
    grouped.set(d.file, group)
  }

  let errorCount = 0
  let warningCount = 0
  const lines: string[] = []

  for (const [file, fileDiagnostics] of grouped) {
    lines.push(pc.bold(file))

    for (const d of fileDiagnostics) {
      const pos = d.line ? `${d.line}:${d.column ?? 0}` : ''
      const severity =
        d.severity === 'error' ? pc.red('error') : pc.yellow('warning')

      lines.push(`  ${pos}  ${severity}  ${d.message}  ${pc.dim(d.rule)}`)

      if (d.severity === 'error') errorCount++
      else warningCount++
    }

    lines.push('')
  }

  lines.push(`${errorCount} error(s), ${warningCount} warning(s)`)

  return lines.join('\n').trimEnd()
}
