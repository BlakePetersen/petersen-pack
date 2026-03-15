// ABOUTME: Section marker engine for parsing, injecting, and managing blink-managed regions in files.
// ABOUTME: Supports comment-style detection by file extension and line-based marker parsing.
import { extname } from 'node:path'

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

const MARKER_START = /blink:start\s+([\w-]+)/
const MARKER_END = /blink:end\s+([\w-]+)/

export function getCommentStyle(ext: string): { open: string; close: string } {
  switch (ext) {
    case '.md':
    case '.html':
    case '.svg':
      return { open: '<!--', close: '-->' }
    case '.css':
    case '.scss':
      return { open: '/*', close: '*/' }
    case '.yaml':
    case '.yml':
    case '.toml':
    case '.sh':
    case '.bash':
    case '.zsh':
      return { open: '#', close: '' }
    default:
      return { open: '//', close: '' }
  }
}

export function injectMarkers(
  content: string,
  slug: string,
  filePath: string
): string {
  const ext = extname(filePath).toLowerCase()
  const { open, close } = getCommentStyle(ext)

  const startMarker = `${open} blink:start ${slug} ${close}`.trimEnd()
  const endMarker = `${open} blink:end ${slug} ${close}`.trimEnd()

  return `${startMarker}\n${content}\n${endMarker}`
}

export function findManagedSections(
  fileContent: string,
  slug: string
): MarkerBounds[] {
  const lines = fileContent.split('\n')
  const sections: MarkerBounds[] = []
  let startLine: number | null = null

  for (let i = 0; i < lines.length; i++) {
    const startMatch = lines[i].match(MARKER_START)
    if (startMatch && startMatch[1] === slug) {
      startLine = i
      continue
    }

    const endMatch = lines[i].match(MARKER_END)
    if (endMatch && endMatch[1] === slug && startLine !== null) {
      const contentLines = lines.slice(startLine + 1, i)
      const content = contentLines.join('\n').replace(/\n+$/, '')

      sections.push({
        slug,
        startLine,
        endLine: i,
        content,
      })
      startLine = null
    }
  }

  return sections
}

export function replaceManagedContent(
  fileContent: string,
  slug: string,
  newContent: string
): string {
  const sections = findManagedSections(fileContent, slug)

  if (sections.length === 0) {
    throw new Error(`No managed section found for slug "${slug}"`)
  }

  const lines = fileContent.split('\n')
  const result: string[] = []
  let skip = false

  for (let i = 0; i < lines.length; i++) {
    const startMatch = lines[i].match(MARKER_START)
    if (startMatch && startMatch[1] === slug) {
      result.push(lines[i])
      result.push(newContent)
      skip = true
      continue
    }

    const endMatch = lines[i].match(MARKER_END)
    if (endMatch && endMatch[1] === slug) {
      result.push(lines[i])
      skip = false
      continue
    }

    if (!skip) {
      result.push(lines[i])
    }
  }

  return result.join('\n')
}

export function stripMarkers(fileContent: string, slug: string): string {
  const lines = fileContent.split('\n')
  const result: string[] = []

  for (const line of lines) {
    const startMatch = line.match(MARKER_START)
    if (startMatch && startMatch[1] === slug) {
      continue
    }

    const endMatch = line.match(MARKER_END)
    if (endMatch && endMatch[1] === slug) {
      continue
    }

    result.push(line)
  }

  return result.join('\n')
}

export function validateMarkers(fileContent: string): MarkerValidation {
  const lines = fileContent.split('\n')
  const errors: string[] = []
  const openSlugs = new Map<string, number>()

  for (let i = 0; i < lines.length; i++) {
    const startMatch = lines[i].match(MARKER_START)
    if (startMatch) {
      const slug = startMatch[1]
      if (openSlugs.has(slug)) {
        errors.push(
          `Nested blink:start for "${slug}" at line ${i + 1} (already opened at line ${openSlugs.get(slug)! + 1})`
        )
      }
      openSlugs.set(slug, i)
      continue
    }

    const endMatch = lines[i].match(MARKER_END)
    if (endMatch) {
      const slug = endMatch[1]
      if (!openSlugs.has(slug)) {
        errors.push(
          `blink:end for "${slug}" at line ${i + 1} without matching blink:start`
        )
      } else {
        openSlugs.delete(slug)
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
