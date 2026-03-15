// ABOUTME: Shared CLI output formatting helpers for tables, labels, and diffs.
// ABOUTME: Provides consistent styling for list, status, dry-run, and diff output.
import pc from 'picocolors'
import { createPatch } from 'diff'
import type { RegistryItem, ManifestEntry } from 'blink-registry'

export function formatListTable(items: RegistryItem[]): string {
  if (items.length === 0) return ''

  const grouped = items.reduce<Record<string, RegistryItem[]>>((acc, item) => {
    const group = acc[item.type] || []
    group.push(item)
    acc[item.type] = group
    return acc
  }, {})

  const lines: string[] = []

  for (const [type, groupItems] of Object.entries(grouped)) {
    lines.push(pc.bold(type))
    for (const item of groupItems) {
      lines.push(`  ${pc.bold(item.name)} ${pc.dim(item.version)} ${item.description}`)
    }
    lines.push('')
  }

  return lines.join('\n').trimEnd()
}

export function formatStatusTable(
  entries: ManifestEntry[],
  registryItems: RegistryItem[]
): string {
  if (entries.length === 0) return ''

  const lines: string[] = []

  for (const entry of entries) {
    const registryItem = registryItems.find((r) => r.slug === entry.slug)
    const isOutdated = registryItem && registryItem.version !== entry.version
    const indicator = isOutdated ? pc.yellow('\u2191') : pc.green('\u2713')

    lines.push(
      `  ${indicator} ${pc.bold(entry.name)} ${pc.dim(entry.version)} ${entry.scope}`
    )
  }

  return lines.join('\n')
}

export function formatDryRunHeader(): string {
  return pc.dim('[dry run]')
}

export function formatActionLabel(
  action: 'write' | 'install' | 'manifest'
): string {
  return pc.dim(`[${action}]`)
}

export function formatColoredDiff(
  oldContent: string,
  newContent: string,
  filename: string
): string {
  const patch = createPatch(filename, oldContent, newContent, 'installed', 'upstream')

  return patch
    .split('\n')
    .map((line) => {
      if (line.startsWith('+++') || line.startsWith('---')) return pc.dim(line)
      if (line.startsWith('+')) return pc.green(line)
      if (line.startsWith('-')) return pc.red(line)
      if (line.startsWith('@@')) return pc.cyan(line)
      return line
    })
    .join('\n')
}
