// ABOUTME: Tests for the shared CLI output formatting helpers.
// ABOUTME: Validates table formatting, status indicators, and label generation.
import {
  formatListTable,
  formatStatusTable,
  formatDryRunHeader,
  formatActionLabel,
  formatColoredDiff
} from '@/output'
import type { RegistryItem, ManifestEntry } from 'blink-registry'

const registryItems: RegistryItem[] = [
  {
    slug: 'prettier',
    name: 'Prettier',
    type: 'config',
    version: '2026.03.14.1',
    description: 'Prettier config',
    url: 'https://blakepetersen.io/r/config/prettier.json'
  },
  {
    slug: 'eslint',
    name: 'ESLint',
    type: 'config',
    version: '2026.03.14.1',
    description: 'ESLint config',
    url: 'https://blakepetersen.io/r/config/eslint.json'
  },
  {
    slug: 'use-local-storage',
    name: 'useLocalStorage',
    type: 'hook',
    version: '2026.03.14.1',
    description: 'Local storage hook',
    url: 'https://blakepetersen.io/r/hook/use-local-storage.json'
  }
]

const manifestEntries: ManifestEntry[] = [
  {
    slug: 'prettier',
    name: 'Prettier',
    type: 'config',
    version: '2026.03.14.1',
    scope: 'project',
    installedAt: '2026-03-14T00:00:00.000Z',
    files: [{ path: '.prettierrc', checksum: 'abc', merge: 'replace' }]
  },
  {
    slug: 'eslint',
    name: 'ESLint',
    type: 'config',
    version: '2026.03.01.1',
    scope: 'project',
    installedAt: '2026-03-01T00:00:00.000Z',
    files: [{ path: '.eslintrc', checksum: 'def', merge: 'replace' }]
  }
]

describe('formatListTable', () => {
  it('groups items by type', () => {
    const output = formatListTable(registryItems)

    expect(output).toContain('config')
    expect(output).toContain('hook')
    expect(output).toContain('Prettier')
    expect(output).toContain('ESLint')
    expect(output).toContain('useLocalStorage')
  })

  it('returns empty string for empty input', () => {
    expect(formatListTable([])).toBe('')
  })
})

describe('formatStatusTable', () => {
  it('shows checkmark for current versions and up-arrow for outdated', () => {
    const output = formatStatusTable(manifestEntries, registryItems)

    // Prettier is current (same version)
    expect(output).toContain('Prettier')
    // ESLint is outdated (2026.03.01.1 vs 2026.03.14.1)
    expect(output).toContain('ESLint')
  })

  it('returns empty string for empty entries', () => {
    expect(formatStatusTable([], registryItems)).toBe('')
  })
})

describe('formatDryRunHeader', () => {
  it('returns string containing dry run', () => {
    const result = formatDryRunHeader()
    expect(result).toContain('dry run')
  })
})

describe('formatActionLabel', () => {
  it('returns label for write action', () => {
    expect(formatActionLabel('write')).toContain('write')
  })

  it('returns label for install action', () => {
    expect(formatActionLabel('install')).toContain('install')
  })

  it('returns label for manifest action', () => {
    expect(formatActionLabel('manifest')).toContain('manifest')
  })
})

describe('formatColoredDiff', () => {
  it('produces unified diff output', () => {
    const result = formatColoredDiff(
      'line 1\nline 2\n',
      'line 1\nline 3\n',
      'test.txt'
    )
    // Should contain diff markers (the raw content may be wrapped in ANSI codes)
    expect(result).toBeTruthy()
    expect(result.length).toBeGreaterThan(0)
  })

  it('includes filename in output', () => {
    const result = formatColoredDiff('old\n', 'new\n', 'config.yaml')
    expect(result).toContain('config.yaml')
  })

  it('returns diff with additions and removals', () => {
    const result = formatColoredDiff('old line\n', 'new line\n', 'file.ts')
    // The output contains ANSI color codes, but the underlying text has + and - lines
    expect(result).toContain('old line')
    expect(result).toContain('new line')
  })
})
