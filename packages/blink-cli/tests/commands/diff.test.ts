// ABOUTME: Tests for the blink diff command.
// ABOUTME: Validates read-only upstream comparison, managed section diffing, and up-to-date detection.
import {
  mkdtempSync,
  writeFileSync,
  readFileSync,
  mkdirSync,
  rmSync,
  realpathSync,
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
  prompt: jest.Mock
}
let fetchMock: jest.Mock

jest.mock('citty', () => ({
  defineCommand: (config: any) => config,
}))

jest.mock('consola', () => {
  const mock = {
    info: jest.fn(),
    success: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    prompt: jest.fn(),
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
  },
  __esModule: true,
  dim: (s: string) => s,
  bold: (s: string) => s,
  yellow: (s: string) => s,
  green: (s: string) => s,
  red: (s: string) => s,
  cyan: (s: string) => s,
}))

const UPSTREAM_ARTIFACT = {
  slug: 'prettier',
  name: 'Prettier',
  type: 'config' as const,
  version: '2026.03.15.1',
  description: 'Prettier config',
  url: 'https://blakepetersen.io/r/config/prettier',
  files: [
    { path: '.prettierrc', content: '{ "semi": false, "tabWidth": 4 }', merge: 'replace' as const },
  ],
  devDependencies: { prettier: '^3.0.0' },
}

const SECTION_UPSTREAM_ARTIFACT = {
  slug: 'shellrc',
  name: 'Shell RC',
  type: 'config' as const,
  version: '2026.03.15.1',
  description: 'Shell RC managed section',
  url: 'https://blakepetersen.io/r/config/shellrc',
  files: [
    { path: '.zshrc', content: 'export PATH="$HOME/.blink/bin:$PATH"\nexport BLINK_NEW=1', merge: 'section' as const },
  ],
  devDependencies: undefined,
}

function createManifestWithItem(slug: string, files: Array<{ path: string; content: string; merge: string }>) {
  const blinkDir = join(tmpDir, BLINK_DIR)
  mkdirSync(blinkDir, { recursive: true })
  writeFileSync(
    join(blinkDir, 'manifest.json'),
    JSON.stringify({
      version: 1,
      items: [
        {
          slug,
          name: slug === 'prettier' ? 'Prettier' : 'Shell RC',
          type: 'config',
          version: '2026.03.14.1',
          scope: 'project',
          installedAt: '2026-03-14T00:00:00.000Z',
          files: files.map((f) => ({
            path: f.path,
            checksum: checksum(f.content),
            merge: f.merge,
          })),
        },
      ],
    })
  )
}

function mockFetchForDiff(artifact: any) {
  fetchMock = jest.fn()
    .mockResolvedValue({
      ok: true,
      json: async () => artifact,
    })
  global.fetch = fetchMock
}

beforeEach(() => {
  tmpDir = realpathSync(mkdtempSync(join(tmpdir(), 'blink-diff-')))
  originalCwd = process.cwd()
  process.chdir(tmpDir)

  const consola = jest.requireMock('consola')
  consolaMock = consola.consola
  consolaMock.info.mockClear()
  consolaMock.success.mockClear()
  consolaMock.log.mockClear()
  consolaMock.warn.mockClear()
  consolaMock.error.mockClear()
  consolaMock.prompt.mockClear()

  Object.defineProperty(process.stdout, 'isTTY', { value: true, configurable: true })
})

afterEach(() => {
  process.chdir(originalCwd)
  rmSync(tmpDir, { recursive: true, force: true })
})

async function runDiff(args: Record<string, any> = {}) {
  const mod = await import('@/commands/diff')
  const command = mod.default
  await command.run!({ args: { slug: 'prettier', ...args } } as any)
}

describe('blink diff', () => {
  describe('replace merge', () => {
    it('shows diff between local and upstream content', async () => {
      const originalContent = '{ "semi": false }'
      createManifestWithItem('prettier', [
        { path: '.prettierrc', content: originalContent, merge: 'replace' },
      ])
      writeFileSync(join(tmpDir, '.prettierrc'), originalContent)
      mockFetchForDiff(UPSTREAM_ARTIFACT)

      await runDiff({ slug: 'prettier' })

      // Should output diff content
      expect(consolaMock.log).toHaveBeenCalled()
      // File should not be modified (read-only)
      expect(readFileSync(join(tmpDir, '.prettierrc'), 'utf-8')).toBe(originalContent)
    })
  })

  describe('section merge', () => {
    it('shows diff of managed section content vs upstream', async () => {
      const originalManagedContent = 'export PATH="$HOME/.blink/bin:$PATH"'
      const markedContent = injectMarkers(originalManagedContent, 'shellrc', '.zshrc')
      const fileWithUserContent = `# My stuff\n${markedContent}\n# End`

      createManifestWithItem('shellrc', [
        { path: '.zshrc', content: markedContent, merge: 'section' },
      ])
      writeFileSync(join(tmpDir, '.zshrc'), fileWithUserContent)
      mockFetchForDiff(SECTION_UPSTREAM_ARTIFACT)

      await runDiff({ slug: 'shellrc' })

      // Should show diff output
      expect(consolaMock.log).toHaveBeenCalled()
      // File must not be modified
      expect(readFileSync(join(tmpDir, '.zshrc'), 'utf-8')).toBe(fileWithUserContent)
    })
  })

  describe('up to date', () => {
    it('shows up to date message when content matches', async () => {
      const upstreamContent = '{ "semi": false, "tabWidth": 4 }'
      createManifestWithItem('prettier', [
        { path: '.prettierrc', content: upstreamContent, merge: 'replace' },
      ])
      writeFileSync(join(tmpDir, '.prettierrc'), upstreamContent)
      mockFetchForDiff(UPSTREAM_ARTIFACT)

      await runDiff({ slug: 'prettier' })

      expect(consolaMock.info).toHaveBeenCalledWith(
        expect.stringContaining('Up to date')
      )
    })
  })

  describe('not installed', () => {
    it('errors when slug is not in manifest', async () => {
      const blinkDir = join(tmpDir, BLINK_DIR)
      mkdirSync(blinkDir, { recursive: true })
      writeFileSync(
        join(blinkDir, 'manifest.json'),
        JSON.stringify({ version: 1, items: [] })
      )

      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit')
      })

      await expect(runDiff({ slug: 'prettier' })).rejects.toThrow('process.exit')

      expect(consolaMock.error).toHaveBeenCalledWith(
        expect.stringContaining('not installed')
      )

      exitSpy.mockRestore()
    })
  })
})
