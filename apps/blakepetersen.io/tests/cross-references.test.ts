// ABOUTME: Validates all frontmatter slug references resolve to existing content.
// ABOUTME: Tests bidirectionality of related/dependencies cross-references (DOCS-04).

import { execSync } from 'child_process'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

const appRoot = join(__dirname, '..')
const veliteDir = join(appRoot, '.velite')

beforeAll(() => {
  if (!existsSync(veliteDir)) {
    execSync('pnpm velite', { cwd: appRoot, stdio: 'pipe' })
  }
}, 30000)

interface ContentItem {
  slug: string
  related: string[]
  dependencies: string[]
}

function readCollection(name: string): ContentItem[] {
  const filePath = join(veliteDir, `${name}.json`)
  if (!existsSync(filePath)) return []
  return JSON.parse(readFileSync(filePath, 'utf-8'))
}

function getAllContent(): ContentItem[] {
  const collections = ['skills', 'hooks', 'configs', 'guides']
  return collections.flatMap((name) => readCollection(name))
}

describe('Cross-References (DOCS-04)', () => {
  let allContent: ContentItem[]
  let allSlugs: Set<string>

  beforeAll(() => {
    allContent = getAllContent()
    allSlugs = new Set(allContent.map((item) => item.slug))
  })

  test('all dependency slugs resolve to existing content', () => {
    const broken: string[] = []

    for (const item of allContent) {
      for (const dep of item.dependencies || []) {
        if (!allSlugs.has(dep)) {
          broken.push(`${item.slug} -> dependency "${dep}" not found`)
        }
      }
    }

    if (broken.length > 0) {
      console.error('Broken dependency references:\n' + broken.join('\n'))
    }
    expect(broken).toEqual([])
  })

  test('all related slugs resolve to existing content', () => {
    const broken: string[] = []

    for (const item of allContent) {
      for (const rel of item.related || []) {
        if (!allSlugs.has(rel)) {
          broken.push(`${item.slug} -> related "${rel}" not found`)
        }
      }
    }

    if (broken.length > 0) {
      console.error('Broken related references:\n' + broken.join('\n'))
    }
    expect(broken).toEqual([])
  })

  test('related references are bidirectional', () => {
    const missing: string[] = []

    for (const item of allContent) {
      for (const rel of item.related || []) {
        const target = allContent.find((c) => c.slug === rel)
        if (!target) continue // Handled by slug resolution test

        const targetRelated = target.related || []
        const targetDeps = target.dependencies || []
        const hasBackRef =
          targetRelated.includes(item.slug) ||
          targetDeps.includes(item.slug)

        if (!hasBackRef) {
          missing.push(
            `${item.slug} lists "${rel}" in related, but "${rel}" does not reference back`,
          )
        }
      }
    }

    if (missing.length > 0) {
      console.error(
        'Missing bidirectional references:\n' + missing.join('\n'),
      )
    }
    expect(missing).toEqual([])
  })
})
