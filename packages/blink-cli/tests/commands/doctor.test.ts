// ABOUTME: Tests for the blink doctor command.
// ABOUTME: Validates integrity checks for broken markers, orphaned entries, temp files, and local modifications.
import {
  mkdtempSync,
  writeFileSync,
  readFileSync,
  mkdirSync,
  rmSync,
  realpathSync
} from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { BLINK_DIR, checksum } from '@/manifest'
import { injectMarkers } from '@/markers'

let tmpDir: string
let originalCwd: string
let consolaMock: {
  info: jest.Mock
  success: jest.Mock
  log: jest.Mock
  warn: jest.Mock
  error: jest.Mock
}

jest.mock('citty', () => ({
  defineCommand: (config: any) => config
}))

jest.mock('consola', () => {
  const mock = {
    info: jest.fn(),
    success: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
  return { consola: mock, default: mock, __esModule: true }
})

jest.mock('picocolors', () => ({
  default: {
    dim: (s: string) => s,
    bold: (s: string) => s,
    yellow: (s: string) => s,
    green: (s: string) => s,
    red: (s: string) => s,
    cyan: (s: string) => s,
    blue: (s: string) => s
  },
  __esModule: true,
  dim: (s: string) => s,
  bold: (s: string) => s,
  yellow: (s: string) => s,
  green: (s: string) => s,
  red: (s: string) => s,
  cyan: (s: string) => s,
  blue: (s: string) => s
}))

function createManifest(items: any[]) {
  const blinkDir = join(tmpDir, BLINK_DIR)
  mkdirSync(blinkDir, { recursive: true })
  writeFileSync(
    join(blinkDir, 'manifest.json'),
    JSON.stringify({ version: 1, items })
  )
}

function makeEntry(
  slug: string,
  files: Array<{ path: string; content: string; merge: string }>
) {
  return {
    slug,
    name: slug === 'shellrc' ? 'Shell RC' : 'Prettier',
    type: 'config',
    version: '2026.03.14.1',
    scope: 'project' as const,
    installedAt: '2026-03-14T00:00:00.000Z',
    files: files.map(f => ({
      path: f.path,
      checksum: checksum(f.content),
      merge: f.merge
    }))
  }
}

beforeEach(() => {
  tmpDir = realpathSync(mkdtempSync(join(tmpdir(), 'blink-doctor-')))
  originalCwd = process.cwd()
  process.chdir(tmpDir)

  const consola = jest.requireMock('consola')
  consolaMock = consola.consola
  consolaMock.info.mockClear()
  consolaMock.success.mockClear()
  consolaMock.log.mockClear()
  consolaMock.warn.mockClear()
  consolaMock.error.mockClear()
})

afterEach(() => {
  process.chdir(originalCwd)
  rmSync(tmpDir, { recursive: true, force: true })
})

async function runDoctor(args: Record<string, any> = {}) {
  const mod = await import('@/commands/doctor')
  const command = mod.default
  await command.run!({ args: { ...args } } as any)
}

describe('blink doctor', () => {
  describe('no manifest', () => {
    it('reports info when no manifest exists', async () => {
      await runDoctor()

      expect(consolaMock.info).toHaveBeenCalledWith(
        expect.stringContaining('No blink manifest found')
      )
    })
  })

  describe('all checks passing', () => {
    it('reports no issues when everything is healthy', async () => {
      const content = '{ "semi": false }'
      createManifest([
        makeEntry('prettier', [
          { path: '.prettierrc', content, merge: 'replace' }
        ])
      ])
      writeFileSync(join(tmpDir, '.prettierrc'), content)

      await runDoctor()

      expect(consolaMock.success).toHaveBeenCalledWith(
        expect.stringContaining('No issues found')
      )
    })
  })

  describe('orphaned manifest entries', () => {
    it('detects files in manifest but missing from disk', async () => {
      createManifest([
        makeEntry('prettier', [
          { path: '.prettierrc', content: '{}', merge: 'replace' }
        ])
      ])
      // Don't create .prettierrc on disk

      await runDoctor()

      const allCalls = [
        ...consolaMock.error.mock.calls,
        ...consolaMock.warn.mock.calls,
        ...consolaMock.log.mock.calls
      ].flat()

      expect(
        allCalls.some(
          (msg: string) =>
            typeof msg === 'string' &&
            msg.includes('Orphaned manifest entry') &&
            msg.includes('.prettierrc')
        )
      ).toBe(true)
    })
  })

  describe('broken markers', () => {
    it('detects unmatched start/end markers', async () => {
      const brokenContent =
        '# blink:start shellrc\nsome content\n# missing end marker'

      createManifest([
        makeEntry('shellrc', [
          { path: '.zshrc', content: brokenContent, merge: 'section' }
        ])
      ])
      writeFileSync(join(tmpDir, '.zshrc'), brokenContent)

      await runDoctor()

      const allCalls = [
        ...consolaMock.error.mock.calls,
        ...consolaMock.warn.mock.calls,
        ...consolaMock.log.mock.calls
      ].flat()

      expect(
        allCalls.some(
          (msg: string) =>
            typeof msg === 'string' &&
            msg.includes('blink:start') &&
            msg.includes('without matching')
        )
      ).toBe(true)
    })
  })

  describe('orphaned temp files', () => {
    it('detects leftover temp files from interrupted writes', async () => {
      createManifest([])
      writeFileSync(join(tmpDir, '.prettierrc.blink-tmp-12345'), 'temp content')

      await runDoctor()

      const allCalls = [
        ...consolaMock.error.mock.calls,
        ...consolaMock.warn.mock.calls,
        ...consolaMock.log.mock.calls
      ].flat()

      expect(
        allCalls.some(
          (msg: string) =>
            typeof msg === 'string' && msg.includes('Orphaned temp file')
        )
      ).toBe(true)
    })
  })

  describe('checksum mismatches', () => {
    it('detects locally modified replace-merge files', async () => {
      const originalContent = '{ "semi": false }'
      createManifest([
        makeEntry('prettier', [
          { path: '.prettierrc', content: originalContent, merge: 'replace' }
        ])
      ])
      // Write different content than what manifest expects
      writeFileSync(
        join(tmpDir, '.prettierrc'),
        '{ "semi": true, "tabWidth": 2 }'
      )

      await runDoctor()

      const allCalls = [
        ...consolaMock.error.mock.calls,
        ...consolaMock.warn.mock.calls,
        ...consolaMock.log.mock.calls
      ].flat()

      expect(
        allCalls.some(
          (msg: string) =>
            typeof msg === 'string' &&
            msg.includes('Locally modified') &&
            msg.includes('.prettierrc')
        )
      ).toBe(true)
    })

    it('detects locally modified section-merge managed content', async () => {
      const originalManaged = 'export PATH="$HOME/.blink/bin:$PATH"'
      const markedContent = injectMarkers(originalManaged, 'shellrc', '.zshrc')

      createManifest([
        makeEntry('shellrc', [
          { path: '.zshrc', content: markedContent, merge: 'section' }
        ])
      ])

      // Modify the managed section content
      const modifiedMarked = markedContent.replace(
        'export PATH="$HOME/.blink/bin:$PATH"',
        'export PATH="$HOME/custom:$PATH"'
      )
      writeFileSync(join(tmpDir, '.zshrc'), modifiedMarked)

      await runDoctor()

      const allCalls = [
        ...consolaMock.error.mock.calls,
        ...consolaMock.warn.mock.calls,
        ...consolaMock.log.mock.calls
      ].flat()

      expect(
        allCalls.some(
          (msg: string) =>
            typeof msg === 'string' &&
            msg.includes('Locally modified') &&
            msg.includes('.zshrc')
        )
      ).toBe(true)
    })
  })

  describe('issue summary', () => {
    it('reports issue count with severity breakdown', async () => {
      createManifest([
        makeEntry('prettier', [
          { path: '.prettierrc', content: '{}', merge: 'replace' }
        ])
      ])
      // Missing file = orphaned entry (error)

      await runDoctor()

      const allCalls = [
        ...consolaMock.error.mock.calls,
        ...consolaMock.warn.mock.calls,
        ...consolaMock.log.mock.calls,
        ...consolaMock.info.mock.calls
      ].flat()

      expect(
        allCalls.some(
          (msg: string) => typeof msg === 'string' && msg.includes('issue')
        )
      ).toBe(true)
    })
  })
})
