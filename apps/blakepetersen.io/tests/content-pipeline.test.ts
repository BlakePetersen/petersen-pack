// ABOUTME: Integration tests proving Velite builds MDX to JSON with computed fields.
// ABOUTME: Validates CONT-01: content pipeline processes all collections end-to-end.

import { execSync } from 'child_process'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

const appRoot = join(__dirname, '..')
const veliteDir = join(appRoot, '.velite')

beforeAll(() => {
  execSync('pnpm velite', { cwd: appRoot, stdio: 'pipe' })
}, 30000)

function readCollection(name: string) {
  const filePath = join(veliteDir, `${name}.json`)
  if (!existsSync(filePath)) return []
  return JSON.parse(readFileSync(filePath, 'utf-8'))
}

describe('Content Pipeline (CONT-01)', () => {
  test('Velite build produces output files in .velite/ directory', () => {
    expect(existsSync(veliteDir)).toBe(true)
  })

  test.each(['skills', 'hooks', 'configs', 'guides', 'posts'])(
    '%s collection produces a non-empty JSON array',
    (collection) => {
      const items = readCollection(collection)
      expect(Array.isArray(items)).toBe(true)
      expect(items.length).toBeGreaterThan(0)
    },
  )

  test.each(['skills', 'hooks', 'configs', 'guides', 'posts'])(
    'each %s item has compiled MDX code field',
    (collection) => {
      const items = readCollection(collection)
      for (const item of items) {
        expect(typeof item.code).toBe('string')
        expect(item.code.length).toBeGreaterThan(0)
      }
    },
  )

  test.each(['skills', 'hooks', 'configs', 'guides', 'posts'])(
    'each %s item has computed fields: excerpt, readingTime, wordCount',
    (collection) => {
      const items = readCollection(collection)
      for (const item of items) {
        expect(typeof item.excerpt).toBe('string')
        expect(typeof item.readingTime).toBe('number')
        expect(typeof item.wordCount).toBe('number')
        expect(item.wordCount).toBeGreaterThan(0)
      }
    },
  )

  test('draft items are excluded when NODE_ENV=production', () => {
    const result = execSync('NODE_ENV=production pnpm velite', {
      cwd: appRoot,
      stdio: 'pipe',
    })
    const collections = ['skills', 'hooks', 'configs', 'guides', 'posts']
    for (const name of collections) {
      const items = readCollection(name)
      for (const item of items) {
        expect(item.draft).not.toBe(true)
      }
    }
    // Rebuild in dev mode for other tests
    execSync('pnpm velite', { cwd: appRoot, stdio: 'pipe' })
  })
})
