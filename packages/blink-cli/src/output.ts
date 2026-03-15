// ABOUTME: Shared CLI output formatting helpers for tables and labels.
// ABOUTME: Provides consistent styling for list, status, and dry-run output.
import pc from 'picocolors'
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
