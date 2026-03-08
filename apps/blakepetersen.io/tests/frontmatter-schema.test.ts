// ABOUTME: Tests proving schema validation enforces correct frontmatter per collection type.
// ABOUTME: Validates CONT-03: DX content requires applies_to/dependencies, posts require date.

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

function readCollection(name: string) {
  const filePath = join(veliteDir, `${name}.json`)
  if (!existsSync(filePath)) return []
  return JSON.parse(readFileSync(filePath, 'utf-8'))
}

describe('Frontmatter Schema (CONT-03)', () => {
  test.each(['skills', 'hooks', 'configs', 'guides'])(
    'DX %s items have required applies_to field (array)',
    (collection) => {
      const items = readCollection(collection)
      for (const item of items) {
        expect(Array.isArray(item.applies_to)).toBe(true)
        expect(item.applies_to.length).toBeGreaterThan(0)
      }
    },
  )

  test.each(['skills', 'hooks', 'configs', 'guides'])(
    'DX %s items have dependencies field (array, may be empty)',
    (collection) => {
      const items = readCollection(collection)
      for (const item of items) {
        expect(Array.isArray(item.dependencies)).toBe(true)
      }
    },
  )

  test('posts do NOT have applies_to or dependencies fields', () => {
    const items = readCollection('posts')
    for (const item of items) {
      expect(item.applies_to).toBeUndefined()
      expect(item.dependencies).toBeUndefined()
    }
  })

  test('posts have required date field (ISO date string)', () => {
    const items = readCollection('posts')
    for (const item of items) {
      expect(typeof item.date).toBe('string')
      expect(new Date(item.date).toString()).not.toBe('Invalid Date')
    }
  })

  test.each(['skills', 'hooks', 'configs', 'guides', 'posts'])(
    'all %s items have title and description fields',
    (collection) => {
      const items = readCollection(collection)
      for (const item of items) {
        expect(typeof item.title).toBe('string')
        expect(item.title.length).toBeGreaterThan(0)
        expect(typeof item.description).toBe('string')
        expect(item.description.length).toBeGreaterThan(0)
      }
    },
  )
})
