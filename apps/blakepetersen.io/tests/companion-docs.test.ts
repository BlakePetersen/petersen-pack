// ABOUTME: Validates companion documentation pages exist with required frontmatter.
// ABOUTME: Tests that all 5 companion doc pages have related arrays and correct draft status (DOCS-03).

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
  title: string
  description: string
  related: string[]
  dependencies: string[]
  draft: boolean
}

function readCollection(name: string): ContentItem[] {
  const filePath = join(veliteDir, `${name}.json`)
  if (!existsSync(filePath)) return []
  return JSON.parse(readFileSync(filePath, 'utf-8'))
}

const COMPANION_PAGES = [
  {
    collection: 'configs',
    slug: 'configs/eslint-flat-config',
    label: 'ESLint Flat Config',
  },
  {
    collection: 'configs',
    slug: 'configs/prettier-config',
    label: 'Prettier Config',
  },
  {
    collection: 'configs',
    slug: 'configs/typescript-config',
    label: 'TypeScript Config',
  },
  {
    collection: 'configs',
    slug: 'configs/claude-md-templates',
    label: 'CLAUDE.md Templates',
  },
  {
    collection: 'hooks',
    slug: 'hooks/husky-lint-staged',
    label: 'Husky + lint-staged',
  },
]

describe('Companion Documentation (DOCS-03)', () => {
  let configs: ContentItem[]
  let hooks: ContentItem[]

  beforeAll(() => {
    configs = readCollection('configs')
    hooks = readCollection('hooks')
  })

  for (const page of COMPANION_PAGES) {
    describe(page.label, () => {
      let item: ContentItem | undefined

      beforeAll(() => {
        const collection = page.collection === 'configs' ? configs : hooks
        item = collection.find((i) => i.slug === page.slug)
      })

      test('exists in collection', () => {
        expect(item).toBeDefined()
      })

      test('has description', () => {
        expect(item?.description).toBeTruthy()
        expect(item!.description.length).toBeGreaterThan(0)
      })

      test('has non-empty related array', () => {
        expect(item?.related).toBeDefined()
        expect(item!.related.length).toBeGreaterThan(0)
      })

      test('is not a draft', () => {
        expect(item?.draft).toBe(false)
      })
    })
  }

  test('husky-lint-staged has dependencies', () => {
    const husky = hooks.find((i) => i.slug === 'hooks/husky-lint-staged')
    expect(husky).toBeDefined()
    expect(husky!.dependencies.length).toBeGreaterThan(0)
  })
})
