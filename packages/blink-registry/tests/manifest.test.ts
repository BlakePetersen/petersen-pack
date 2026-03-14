// ABOUTME: Tests for manifest Zod schemas (file entries, entries, and full manifest).
// ABOUTME: Validates manifest structure including per-file checksums and scoped entries.
import {
  ManifestFileEntrySchema,
  ManifestEntrySchema,
  ManifestSchema,
} from '../src/index'

const validFileEntry = {
  path: 'eslint.config.mjs',
  checksum: 'abc123def456',
  merge: 'replace' as const,
}

const validEntry = {
  slug: 'eslint-config',
  name: 'ESLint Config',
  type: 'config' as const,
  version: '2026.03.14.1',
  scope: 'project' as const,
  installedAt: '2026-03-14T12:00:00Z',
  files: [validFileEntry],
}

const validManifest = {
  version: 1 as const,
  items: [validEntry],
}

describe('ManifestFileEntrySchema', () => {
  it('accepts a valid file entry', () => {
    expect(ManifestFileEntrySchema.safeParse(validFileEntry).success).toBe(true)
  })

  it('rejects missing checksum', () => {
    const { checksum: _, ...noChecksum } = validFileEntry
    expect(ManifestFileEntrySchema.safeParse(noChecksum).success).toBe(false)
  })

  it('rejects invalid merge strategy', () => {
    expect(
      ManifestFileEntrySchema.safeParse({ ...validFileEntry, merge: 'patch' }).success
    ).toBe(false)
  })
})

describe('ManifestEntrySchema', () => {
  it('accepts a valid entry', () => {
    expect(ManifestEntrySchema.safeParse(validEntry).success).toBe(true)
  })

  it('accepts global scope', () => {
    expect(
      ManifestEntrySchema.safeParse({ ...validEntry, scope: 'global' }).success
    ).toBe(true)
  })

  it('rejects invalid scope', () => {
    expect(
      ManifestEntrySchema.safeParse({ ...validEntry, scope: 'local' }).success
    ).toBe(false)
  })

  it('rejects invalid datetime format', () => {
    expect(
      ManifestEntrySchema.safeParse({ ...validEntry, installedAt: 'not-a-date' }).success
    ).toBe(false)
  })

  it('rejects missing slug', () => {
    const { slug: _, ...noSlug } = validEntry
    expect(ManifestEntrySchema.safeParse(noSlug).success).toBe(false)
  })
})

describe('ManifestSchema', () => {
  it('accepts a valid manifest', () => {
    expect(ManifestSchema.safeParse(validManifest).success).toBe(true)
  })

  it('accepts empty items array', () => {
    expect(
      ManifestSchema.safeParse({ version: 1, items: [] }).success
    ).toBe(true)
  })

  it('rejects wrong version number', () => {
    expect(
      ManifestSchema.safeParse({ version: 2, items: [] }).success
    ).toBe(false)
  })

  it('rejects missing version', () => {
    expect(
      ManifestSchema.safeParse({ items: [] }).success
    ).toBe(false)
  })
})
