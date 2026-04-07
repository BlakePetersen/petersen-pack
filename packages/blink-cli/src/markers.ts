// ABOUTME: Section marker engine for parsing, injecting, and managing blink-managed regions in files.
// ABOUTME: Provides parse-once model via MarkerEngine/ParsedFile and pluggable comment styles.

import { extname } from 'node:path'

// --- Types ---

export interface CommentStyle {
  open: string
  close: string
}

export interface MarkerBounds {
  slug: string
  startLine: number
  endLine: number
  content: string
}

export interface MarkerValidation {
  valid: boolean
  errors: string[]
}

// --- Comment Style Registry ---

export class CommentStyleRegistry {
  private styles = new Map<string, CommentStyle>()

  static default(): CommentStyleRegistry {
    const registry = new CommentStyleRegistry()
    registry.register('.md', { open: '<!--', close: '-->' })
    registry.register('.html', { open: '<!--', close: '-->' })
    registry.register('.svg', { open: '<!--', close: '-->' })
    registry.register('.css', { open: '/*', close: '*/' })
    registry.register('.scss', { open: '/*', close: '*/' })
    registry.register('.yaml', { open: '#', close: '' })
    registry.register('.yml', { open: '#', close: '' })
    registry.register('.toml', { open: '#', close: '' })
    registry.register('.sh', { open: '#', close: '' })
    registry.register('.bash', { open: '#', close: '' })
    registry.register('.zsh', { open: '#', close: '' })
    return registry
  }

  register(ext: string, style: CommentStyle): void {
    this.styles.set(ext, style)
  }

  forExtension(ext: string): CommentStyle {
    return this.styles.get(ext) ?? { open: '//', close: '' }
  }
}

// --- Parsed File (parse-once, operate many) ---

const MARKER_START = /blink:start\s+([\w-]+)/
const MARKER_END = /blink:end\s+([\w-]+)/

interface LineInfo {
  text: string
  startSlug: string | null
  endSlug: string | null
}

function parseLines(fileContent: string): LineInfo[] {
  return fileContent.split('\n').map((text) => {
    const startMatch = text.match(MARKER_START)
    const endMatch = text.match(MARKER_END)
    return {
      text,
      startSlug: startMatch ? startMatch[1] : null,
      endSlug: endMatch ? endMatch[1] : null,
    }
  })
}

export class ParsedFile {
  readonly sections: MarkerBounds[]
  private readonly lines: LineInfo[]
  private readonly raw: string

  constructor(fileContent: string) {
    this.raw = fileContent
    this.lines = parseLines(fileContent)
    this.sections = this.buildSections()
  }

  private buildSections(): MarkerBounds[] {
    const sections: MarkerBounds[] = []
    const openStarts = new Map<string, number>()

    for (let i = 0; i < this.lines.length; i++) {
      const { startSlug, endSlug } = this.lines[i]

      if (startSlug) {
        openStarts.set(startSlug, i)
        continue
      }

      if (endSlug && openStarts.has(endSlug)) {
        const startLine = openStarts.get(endSlug)!
        const contentLines = this.lines
          .slice(startLine + 1, i)
          .map((l) => l.text)
        const content = contentLines.join('\n').replace(/\n+$/, '')

        sections.push({ slug: endSlug, startLine, endLine: i, content })
        openStarts.delete(endSlug)
      }
    }

    return sections
  }

  sectionsForSlug(slug: string): MarkerBounds[] {
    return this.sections.filter((s) => s.slug === slug)
  }

  replace(slug: string, newContent: string): string {
    const slugSections = this.sectionsForSlug(slug)
    if (slugSections.length === 0) {
      throw new Error(`No managed section found for slug "${slug}"`)
    }

    const result: string[] = []
    let skip = false

    for (const line of this.lines) {
      if (line.startSlug === slug) {
        result.push(line.text)
        result.push(newContent)
        skip = true
        continue
      }

      if (line.endSlug === slug) {
        result.push(line.text)
        skip = false
        continue
      }

      if (!skip) {
        result.push(line.text)
      }
    }

    return result.join('\n')
  }

  strip(slug: string): string {
    return this.lines
      .filter((line) => line.startSlug !== slug && line.endSlug !== slug)
      .map((line) => line.text)
      .join('\n')
  }

  validate(): MarkerValidation {
    const errors: string[] = []
    const openSlugs = new Map<string, number>()

    for (let i = 0; i < this.lines.length; i++) {
      const { startSlug, endSlug } = this.lines[i]

      if (startSlug) {
        if (openSlugs.has(startSlug)) {
          errors.push(
            `Nested blink:start for "${startSlug}" at line ${i + 1} (already opened at line ${openSlugs.get(startSlug)! + 1})`
          )
        }
        openSlugs.set(startSlug, i)
        continue
      }

      if (endSlug) {
        if (!openSlugs.has(endSlug)) {
          errors.push(
            `blink:end for "${endSlug}" at line ${i + 1} without matching blink:start`
          )
        } else {
          openSlugs.delete(endSlug)
        }
      }
    }

    for (const [slug, line] of openSlugs) {
      errors.push(
        `blink:start for "${slug}" at line ${line + 1} without matching blink:end`
      )
    }

    return { valid: errors.length === 0, errors }
  }
}

// --- Marker Engine ---

export class MarkerEngine {
  readonly styles: CommentStyleRegistry

  constructor(styles?: CommentStyleRegistry) {
    this.styles = styles ?? CommentStyleRegistry.default()
  }

  inject(content: string, slug: string, filePath: string): string {
    const ext = extname(filePath).toLowerCase()
    const { open, close } = this.styles.forExtension(ext)

    const startMarker = `${open} blink:start ${slug} ${close}`.trimEnd()
    const endMarker = `${open} blink:end ${slug} ${close}`.trimEnd()

    return `${startMarker}\n${content}\n${endMarker}`
  }

  parse(fileContent: string): ParsedFile {
    return new ParsedFile(fileContent)
  }
}

// --- Backward-compatible free functions ---

const defaultEngine = new MarkerEngine()

export function getCommentStyle(ext: string): CommentStyle {
  return defaultEngine.styles.forExtension(ext)
}

export function injectMarkers(content: string, slug: string, filePath: string): string {
  return defaultEngine.inject(content, slug, filePath)
}

export function findManagedSections(fileContent: string, slug: string): MarkerBounds[] {
  return defaultEngine.parse(fileContent).sectionsForSlug(slug)
}

export function replaceManagedContent(fileContent: string, slug: string, newContent: string): string {
  return defaultEngine.parse(fileContent).replace(slug, newContent)
}

export function stripMarkers(fileContent: string, slug: string): string {
  return defaultEngine.parse(fileContent).strip(slug)
}

export function validateMarkers(fileContent: string): MarkerValidation {
  return defaultEngine.parse(fileContent).validate()
}
