// ABOUTME: SCAFFOLD-05 round-trip CI test for blink scaffold.
// ABOUTME: Generates one entry per collection, validates frontmatter against DxFrontmatterSchema.

import { mkdtempSync, readFileSync, existsSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import matter from 'gray-matter'
import { DxFrontmatterSchema } from 'blink-registry'
import { generateScaffold } from '../../../packages/blink-cli/src/scaffold/generator'

describe('scaffold round-trip', () => {
  const collections = ['skill', 'config', 'hook', 'guide'] as const
  let tmpDir: string

  beforeAll(async () => {
    tmpDir = mkdtempSync(join(tmpdir(), 'scaffold-roundtrip-'))

    // Generate all scaffolds up front
    for (const collection of collections) {
      await generateScaffold({
        collection,
        slug: `test-roundtrip-${collection}`,
        contentRoot: tmpDir,
        dryRun: false,
        force: false,
      })
    }
  })

  afterAll(() => {
    rmSync(tmpDir, { recursive: true, force: true })
  })

  test.each(collections)(
    'blink scaffold %s produces schema-valid MDX',
    (collection) => {
      const plural = collection + 's'
      const mdxPath = join(tmpDir, plural, `test-roundtrip-${collection}.mdx`)
      expect(existsSync(mdxPath)).toBe(true)

      const raw = readFileSync(mdxPath, 'utf-8')
      const { data } = matter(raw)
      const parsed = DxFrontmatterSchema.safeParse(data)

      if (!parsed.success) {
        // Surface Zod errors for debugging
        throw new Error(
          `Schema validation failed for ${collection}:\n${JSON.stringify(parsed.error.issues, null, 2)}`,
        )
      }

      expect(parsed.success).toBe(true)
    },
  )

  test.each(['skill', 'config', 'hook'] as const)(
    'blink scaffold %s produces companion .artifact.md',
    (collection) => {
      const artifactPath = join(
        tmpDir,
        collection + 's',
        `test-roundtrip-${collection}.artifact.md`,
      )
      expect(existsSync(artifactPath)).toBe(true)
    },
  )

  test('blink scaffold guide does NOT produce .artifact.md', () => {
    const artifactPath = join(
      tmpDir,
      'guides',
      'test-roundtrip-guide.artifact.md',
    )
    expect(existsSync(artifactPath)).toBe(false)
  })
})
