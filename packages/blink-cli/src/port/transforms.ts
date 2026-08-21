// ABOUTME: Pure transform functions for converting Obsidian markdown to MDX.
// ABOUTME: Handles callout->component, wikilink->cross-ref, frontmatter normalization, dataview strip.

/**
 * D-08: Callout type to MDX component mapping.
 * - note, tip -> AuthorNote
 * - warning, important -> DecisionRationale
 * - info -> plain blockquote (no component)
 * - unknown -> AuthorNote (fallback)
 */

type CalloutMapping = 'AuthorNote' | 'DecisionRationale' | 'blockquote'

function getCalloutComponent(type: string): CalloutMapping {
  switch (type.toLowerCase()) {
    case 'note':
    case 'tip':
      return 'AuthorNote'
    case 'warning':
    case 'important':
      return 'DecisionRationale'
    case 'info':
      return 'blockquote'
    default:
      return 'AuthorNote'
  }
}

/**
 * Transform Obsidian callout blocks to MDX voice primitive components.
 *
 * Input format:
 *   > [!type] Optional Title
 *   > Content line 1
 *   > Content line 2
 *
 * Output depends on type mapping (D-08).
 */
export function transformCallouts(content: string): string {
  // Match callout blocks: starts with > [!type], followed by continuation lines starting with >
  const calloutRegex = /^> \[!([a-z]+)\][^\n]*\n((?:> [^\n]*(?:\n|$))*)/gm

  return content.replace(
    calloutRegex,
    (match, type: string, bodyRaw: string) => {
      const component = getCalloutComponent(type)

      // Strip > prefix from each body line
      const bodyLines = bodyRaw
        .split('\n')
        .filter(line => line.startsWith('> '))
        .map(line => line.slice(2))

      const body = bodyLines.join('\n')

      if (component === 'blockquote') {
        // Keep as plain blockquote with body only (strip the [!info] header line)
        return bodyLines.map(line => `> ${line}`).join('\n')
      }

      return `<${component}>\n${body}\n</${component}>`
    }
  )
}

/**
 * D-09: Transform Obsidian wikilinks to MDX cross-ref links.
 *
 * Input: [[slug]] or [[slug|display text]]
 * Output (resolved): [title or display text](/path/to/slug)
 * Output (unresolved): bareSlug{/* TODO: resolve wikilink *\/}
 */
export function transformWikilinks(
  content: string,
  contentSlugs: Map<string, { title: string; href: string }>
): string {
  const wikilinkRegex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g

  return content.replace(
    wikilinkRegex,
    (_match, bareSlug: string, displayText?: string) => {
      const entry = contentSlugs.get(bareSlug)
      if (entry) {
        const text = displayText || entry.title
        return `[${text}](${entry.href})`
      }
      const text = displayText || bareSlug
      return `${text}{/* TODO: resolve wikilink */}`
    }
  )
}

/**
 * D-10: Transform Obsidian frontmatter to dxFields-compatible shape.
 *
 * Known keys map directly: title, description, tags
 * Additional: aliases -> ignored, date -> updated_context
 * Unknown keys preserved in MDX comment block.
 */


export function transformFrontmatter(data: Record<string, unknown>): {
  mapped: Record<string, unknown>
  unknownComment: string
} {
  const mapped: Record<string, unknown> = {
    draft: true,
    applies_to: []
  }

  const unknownPairs: string[] = []

  for (const [key, value] of Object.entries(data)) {
    if (key === 'title') {
      mapped.title = value
    } else if (key === 'description') {
      mapped.description = value
    } else if (key === 'tags') {
      mapped.tags = Array.isArray(value) ? value : [value]
    } else if (key === 'aliases') {
      // Obsidian-only — ignore
    } else if (key === 'date') {
      // Map to updated_context if ISO-parseable
      const parsed = Date.parse(String(value))
      if (!isNaN(parsed)) {
        mapped.updated_context = String(value)
      }
    } else {
      unknownPairs.push(`${key}: ${value}`)
    }
  }

  const unknownComment =
    unknownPairs.length > 0
      ? `{/* Obsidian meta (review + delete): ${unknownPairs.join(', ')} */}`
      : ''

  return { mapped, unknownComment }
}

/**
 * Strip Dataview code blocks from content.
 * Preserves non-dataview code blocks.
 */
export function transformDataviewBlocks(content: string): string {
  const dataviewRegex = /```dataview\n[\s\S]*?```/g
  const stripped = content.replace(dataviewRegex, '')
  // Collapse triple+ blank lines to double
  return stripped.replace(/\n{3,}/g, '\n\n')
}
