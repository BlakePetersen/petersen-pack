// ABOUTME: Unit tests for reconcileFile — write/skip decisions per merge strategy.
// ABOUTME: Mocks confirmAction for the decline branch; uses skipPrompt=true otherwise.

import { reconcileFile, type ReconcileInput } from '../src/reconcile'
import { checksum } from '../src/manifest'
import type { ArtifactFile, ManifestFileEntry } from 'blink-registry'

// Mock confirmAction. Default behavior mirrors the real impl: returns true
// when skipPrompt=true; tests opting into the decline branch override per-test.
jest.mock('../src/modules/prompt', () => ({
  confirmAction: jest.fn((_msg: string, skipPrompt: boolean) => Promise.resolve(skipPrompt)),
}))
import { confirmAction } from '../src/modules/prompt'
const mockConfirm = confirmAction as jest.MockedFunction<typeof confirmAction>

// Silence consola warn/log noise during tests.
jest.mock('consola', () => ({
  consola: { warn: jest.fn(), log: jest.fn(), info: jest.fn(), success: jest.fn(), error: jest.fn() },
}))

const SLUG = 'test-artifact'

function replaceFile(content: string): ArtifactFile {
  return { path: 'foo.json', content, merge: 'replace' }
}

function sectionFile(content: string): ArtifactFile {
  return { path: 'README.md', content, merge: 'section' }
}

function makeInput(overrides: Partial<ReconcileInput> & Pick<ReconcileInput, 'file'>): ReconcileInput {
  return {
    destPath: '/tmp/dest',
    currentContent: null,
    manifestFileEntry: undefined,
    slug: SLUG,
    skipPrompt: true,
    ...overrides,
  }
}

beforeEach(() => {
  mockConfirm.mockClear()
})

describe('reconcileFile — file missing on disk', () => {
  it('writes the upstream content fresh, marks hasChanges', async () => {
    const file = replaceFile('hello')
    const result = await reconcileFile(makeInput({ file, currentContent: null }))

    expect(result.action).toEqual({ kind: 'write', destPath: '/tmp/dest', content: 'hello' })
    expect(result.entry).toEqual({ path: 'foo.json', checksum: checksum('hello'), merge: 'replace' })
    expect(result.hasChanges).toBe(true)
    expect(mockConfirm).not.toHaveBeenCalled()
  })
})

describe('reconcileFile — replace strategy', () => {
  it('returns skip + preserves manifest entry when current matches upstream', async () => {
    const file = replaceFile('same')
    const manifestFileEntry: ManifestFileEntry = {
      path: 'foo.json',
      checksum: checksum('same'),
      merge: 'replace',
    }
    const result = await reconcileFile(makeInput({ file, currentContent: 'same', manifestFileEntry }))

    expect(result.action).toEqual({ kind: 'skip' })
    expect(result.entry).toBe(manifestFileEntry)
    expect(result.hasChanges).toBe(false)
  })

  it('writes upstream when content differs and there is no manifest entry', async () => {
    const file = replaceFile('new')
    const result = await reconcileFile(makeInput({ file, currentContent: 'old' }))

    expect(result.action).toEqual({ kind: 'write', destPath: '/tmp/dest', content: 'new' })
    expect(result.hasChanges).toBe(true)
    expect(mockConfirm).not.toHaveBeenCalled()
  })

  it('writes upstream when content differs and manifest checksum matches current (no local mods)', async () => {
    const file = replaceFile('new')
    const manifestFileEntry: ManifestFileEntry = {
      path: 'foo.json',
      checksum: checksum('old'),
      merge: 'replace',
    }
    const result = await reconcileFile(
      makeInput({ file, currentContent: 'old', manifestFileEntry }),
    )

    expect(result.action.kind).toBe('write')
    expect(result.hasChanges).toBe(true)
    expect(mockConfirm).not.toHaveBeenCalled()
  })

  it('auto-confirms and writes when local mods detected and skipPrompt=true', async () => {
    const file = replaceFile('new')
    const manifestFileEntry: ManifestFileEntry = {
      path: 'foo.json',
      checksum: checksum('originally-installed'),
      merge: 'replace',
    }
    const result = await reconcileFile(
      makeInput({
        file,
        currentContent: 'locally-edited',
        manifestFileEntry,
        skipPrompt: true,
      }),
    )

    expect(result.action.kind).toBe('write')
    expect(result.hasChanges).toBe(true)
    // confirmAction is still called; it short-circuits to true via skipPrompt.
    expect(mockConfirm).toHaveBeenCalledWith(expect.stringMatching(/Local changes detected/), true)
  })

  it('preserves manifest entry when user declines the overwrite prompt', async () => {
    mockConfirm.mockResolvedValueOnce(false)
    const file = replaceFile('new')
    const manifestFileEntry: ManifestFileEntry = {
      path: 'foo.json',
      checksum: checksum('originally-installed'),
      merge: 'replace',
    }
    const result = await reconcileFile(
      makeInput({
        file,
        currentContent: 'locally-edited',
        manifestFileEntry,
        skipPrompt: false,
      }),
    )

    expect(result.action).toEqual({ kind: 'skip' })
    expect(result.entry).toBe(manifestFileEntry)
    expect(result.hasChanges).toBe(false)
  })
})

describe('reconcileFile — section strategy', () => {
  // Build a fixture file with a managed section embedded between header and
  // footer text. Marker line format matches MarkerEngine.inject for `.md`.
  const wrapInMarkers = (managed: string) =>
    `# Header\n\n<!-- blink:start ${SLUG} -->\n${managed}\n<!-- blink:end ${SLUG} -->\n\n# Footer\n`

  it('warns and preserves manifest entry when no managed section is present', async () => {
    const file = sectionFile('whatever')
    const manifestFileEntry: ManifestFileEntry = {
      path: 'README.md',
      checksum: checksum('plain readme'),
      merge: 'section',
    }
    const result = await reconcileFile(
      makeInput({ file, currentContent: 'plain readme', manifestFileEntry }),
    )

    expect(result.action).toEqual({ kind: 'skip' })
    expect(result.entry).toBe(manifestFileEntry)
    expect(result.hasChanges).toBe(false)
  })

  it('returns skip when managed content already matches upstream', async () => {
    const upstream = 'managed-payload'
    const file = sectionFile(upstream)
    const currentContent = wrapInMarkers(upstream)
    const result = await reconcileFile(
      makeInput({ file, currentContent }),
    )

    expect(result.action).toEqual({ kind: 'skip' })
    expect(result.hasChanges).toBe(false)
  })

  it('writes a new full file when managed content differs from upstream', async () => {
    const file = sectionFile('new-managed')
    const currentContent = wrapInMarkers('old-managed')
    const manifestFileEntry: ManifestFileEntry = {
      path: 'README.md',
      checksum: checksum(currentContent),
      merge: 'section',
    }
    const result = await reconcileFile(
      makeInput({ file, currentContent, manifestFileEntry }),
    )

    expect(result.action.kind).toBe('write')
    if (result.action.kind === 'write') {
      expect(result.action.content).toContain('new-managed')
      expect(result.action.content).toContain('# Header')
      expect(result.action.content).toContain('# Footer')
    }
    expect(result.hasChanges).toBe(true)
    expect(mockConfirm).not.toHaveBeenCalled() // checksum matches current → no local mod prompt
  })

  it('preserves manifest entry when user declines the section-merge overwrite prompt', async () => {
    mockConfirm.mockResolvedValueOnce(false)
    const file = sectionFile('new-managed')
    const currentContent = wrapInMarkers('old-managed')
    const manifestFileEntry: ManifestFileEntry = {
      path: 'README.md',
      checksum: checksum('something-different-manifest'),
      merge: 'section',
    }
    const result = await reconcileFile(
      makeInput({
        file,
        currentContent,
        manifestFileEntry,
        skipPrompt: false,
      }),
    )

    expect(result.action).toEqual({ kind: 'skip' })
    expect(result.entry).toBe(manifestFileEntry)
    expect(result.hasChanges).toBe(false)
  })
})
