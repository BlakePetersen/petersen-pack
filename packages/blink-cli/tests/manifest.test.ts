// ABOUTME: Tests for the manifest read/write/create operations.
// ABOUTME: Uses real filesystem operations with temporary directories.
import { mkdtempSync, writeFileSync, readFileSync, mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import {
  readManifest,
  writeManifest,
  createEmptyManifest,
  addManifestEntry,
  removeManifestEntry,
  updateManifestEntry,
  checksum,
  BLINK_DIR,
} from '@/manifest'
import type { Manifest, ManifestEntry } from '@blink-dx/registry'

let tmpDir: string

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), 'blink-manifest-'))
})

afterEach(() => {
  rmSync(tmpDir, { recursive: true, force: true })
})

const sampleEntry: ManifestEntry = {
  slug: 'prettier',
  name: 'Prettier',
  type: 'config',
  version: '2026.03.14.1',
  scope: 'project',
  installedAt: '2026-03-14T00:00:00.000Z',
  files: [
    { path: '.prettierrc', checksum: 'abc123', merge: 'replace' },
  ],
}

describe('readManifest', () => {
  it('returns parsed manifest when file exists and is valid', async () => {
    const manifest: Manifest = { version: 1, items: [sampleEntry] }
    const blinkDir = join(tmpDir, BLINK_DIR)
    mkdirSync(blinkDir, { recursive: true })
    writeFileSync(join(blinkDir, 'manifest.json'), JSON.stringify(manifest))

    const result = await readManifest(tmpDir)

    expect(result).toEqual(manifest)
  })

  it('returns null when file does not exist', async () => {
    const result = await readManifest(tmpDir)
    expect(result).toBeNull()
  })

  it('throws on corrupt JSON', async () => {
    const blinkDir = join(tmpDir, BLINK_DIR)
    mkdirSync(blinkDir, { recursive: true })
    writeFileSync(join(blinkDir, 'manifest.json'), '{invalid json')

    await expect(readManifest(tmpDir)).rejects.toThrow()
  })

  it('throws on invalid schema data', async () => {
    const blinkDir = join(tmpDir, BLINK_DIR)
    mkdirSync(blinkDir, { recursive: true })
    writeFileSync(join(blinkDir, 'manifest.json'), JSON.stringify({ version: 99 }))

    await expect(readManifest(tmpDir)).rejects.toThrow('MANIFEST_CORRUPT')
  })
})

describe('writeManifest', () => {
  it('creates .blink/ directory and writes formatted JSON', async () => {
    const manifest: Manifest = { version: 1, items: [] }

    await writeManifest(tmpDir, manifest)

    const content = readFileSync(join(tmpDir, BLINK_DIR, 'manifest.json'), 'utf-8')
    expect(JSON.parse(content)).toEqual(manifest)
    expect(content.endsWith('\n')).toBe(true)
    // Verify formatted (indented)
    expect(content).toContain('  ')
  })

  it('overwrites existing manifest', async () => {
    const empty: Manifest = { version: 1, items: [] }
    const withEntry: Manifest = { version: 1, items: [sampleEntry] }

    await writeManifest(tmpDir, empty)
    await writeManifest(tmpDir, withEntry)

    const content = readFileSync(join(tmpDir, BLINK_DIR, 'manifest.json'), 'utf-8')
    expect(JSON.parse(content)).toEqual(withEntry)
  })
})

describe('createEmptyManifest', () => {
  it('returns manifest with version 1 and empty items', () => {
    const manifest = createEmptyManifest()
    expect(manifest).toEqual({ version: 1, items: [] })
  })
})

describe('addManifestEntry', () => {
  it('returns new manifest with entry added', () => {
    const base = createEmptyManifest()
    const result = addManifestEntry(base, sampleEntry)

    expect(result.items).toHaveLength(1)
    expect(result.items[0]).toEqual(sampleEntry)
    // Verify immutability
    expect(base.items).toHaveLength(0)
  })
})

describe('removeManifestEntry', () => {
  it('removes entry by slug', () => {
    const manifest: Manifest = { version: 1, items: [sampleEntry] }
    const result = removeManifestEntry(manifest, 'prettier')

    expect(result.items).toHaveLength(0)
    // Verify immutability
    expect(manifest.items).toHaveLength(1)
  })

  it('returns manifest unchanged when slug not found', () => {
    const manifest: Manifest = { version: 1, items: [sampleEntry] }
    const result = removeManifestEntry(manifest, 'nonexistent')

    expect(result.items).toHaveLength(1)
    expect(result.items[0].slug).toBe('prettier')
  })

  it('removes only the matching entry', () => {
    const eslintEntry: ManifestEntry = {
      ...sampleEntry,
      slug: 'eslint',
      name: 'ESLint',
    }
    const manifest: Manifest = {
      version: 1,
      items: [sampleEntry, eslintEntry],
    }
    const result = removeManifestEntry(manifest, 'prettier')

    expect(result.items).toHaveLength(1)
    expect(result.items[0].slug).toBe('eslint')
  })
})

describe('updateManifestEntry', () => {
  it('replaces entry matching slug with new entry', () => {
    const manifest: Manifest = { version: 1, items: [sampleEntry] }
    const updated: ManifestEntry = {
      ...sampleEntry,
      version: '2026.03.15.1',
    }
    const result = updateManifestEntry(manifest, 'prettier', updated)

    expect(result.items).toHaveLength(1)
    expect(result.items[0].version).toBe('2026.03.15.1')
    // Verify immutability
    expect(manifest.items[0].version).toBe('2026.03.14.1')
  })

  it('does not modify entries with different slugs', () => {
    const eslintEntry: ManifestEntry = {
      ...sampleEntry,
      slug: 'eslint',
      name: 'ESLint',
    }
    const manifest: Manifest = {
      version: 1,
      items: [sampleEntry, eslintEntry],
    }
    const updated: ManifestEntry = {
      ...sampleEntry,
      version: '2026.03.15.1',
    }
    const result = updateManifestEntry(manifest, 'prettier', updated)

    expect(result.items[0].version).toBe('2026.03.15.1')
    expect(result.items[1].slug).toBe('eslint')
  })
})

describe('checksum', () => {
  it('returns SHA-256 hex digest', () => {
    const hash = checksum('hello world')
    expect(hash).toBe('b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9')
  })

  it('returns different checksums for different content', () => {
    expect(checksum('a')).not.toBe(checksum('b'))
  })
})
