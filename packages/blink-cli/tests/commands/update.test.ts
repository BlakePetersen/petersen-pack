// ABOUTME: Tests for the blink update command.
// ABOUTME: Validates managed section replacement, local modification detection, diff preview, and manifest updates.
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
import type { CommandContext } from 'citty'
import type { RegistryArtifact } from 'blink-registry'

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
  defineCommand: <T>(config: T): T => config
}))

jest.mock('consola', () => {
  const mock = {
    info: jest.fn(),
    success: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    prompt: jest.fn()
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
    cyan: (s: string) => s
  },
  __esModule: true,
  dim: (s: string) => s,
  bold: (s: string) => s,
  yellow: (s: string) => s,
  green: (s: string) => s,
  red: (s: string) => s,
  cyan: (s: string) => s
}))

const UPSTREAM_ARTIFACT = {
  slug: 'prettier',
  name: 'Prettier',
  type: 'config' as const,
  version: '2026.03.15.1',
  description: 'Prettier config',
  url: 'https://blakepetersen.io/r/config/prettier',
  files: [
    {
      path: '.prettierrc',
      content: '{ "semi": false, "tabWidth": 4 }',
      merge: 'replace' as const
    }
  ],
  devDependencies: { prettier: '^3.0.0' }
}

const SECTION_UPSTREAM_ARTIFACT = {
  slug: 'shellrc',
  name: 'Shell RC',
  type: 'config' as const,
  version: '2026.03.15.1',
  description: 'Shell RC managed section',
  url: 'https://blakepetersen.io/r/config/shellrc',
  files: [
    {
      path: '.zshrc',
      content: 'export PATH="$HOME/.blink/bin:$PATH"\nexport BLINK_NEW=1',
      merge: 'section' as const
    }
  ],
  devDependencies: undefined
}

function createManifestWithItem(
  slug: string,
  files: Array<{ path: string; content: string; merge: string }>
) {
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
          files: files.map(f => ({
            path: f.path,
            checksum: checksum(f.content),
            merge: f.merge
          }))
        }
      ]
    })
  )
}

function mockFetchForUpdate(artifact: RegistryArtifact) {
  fetchMock = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => artifact
  })
  global.fetch = fetchMock
}

beforeEach(() => {
  tmpDir = realpathSync(mkdtempSync(join(tmpdir(), 'blink-update-')))
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

  Object.defineProperty(process.stdout, 'isTTY', {
    value: true,
    configurable: true
  })
})

afterEach(() => {
  process.chdir(originalCwd)
  rmSync(tmpDir, { recursive: true, force: true })
})

async function runUpdate(
  args: Record<string, string | boolean | undefined> = {}
) {
  const mod = await import('@/commands/update')
  const command = mod.default
  await command.run!({
    args: { slug: undefined, 'dry-run': false, yes: false, ...args }
  } as unknown as CommandContext)
}

describe('blink update', () => {
  describe('replace merge', () => {
    it('replaces file content with upstream version', async () => {
      const originalContent = '{ "semi": false }'
      createManifestWithItem('prettier', [
        { path: '.prettierrc', content: originalContent, merge: 'replace' }
      ])
      writeFileSync(join(tmpDir, '.prettierrc'), originalContent)
      mockFetchForUpdate(UPSTREAM_ARTIFACT)

      await runUpdate({ slug: 'prettier', yes: true })

      const updated = readFileSync(join(tmpDir, '.prettierrc'), 'utf-8')
      expect(updated).toBe('{ "semi": false, "tabWidth": 4 }')
    })

    it('updates manifest with new version and checksum', async () => {
      const originalContent = '{ "semi": false }'
      createManifestWithItem('prettier', [
        { path: '.prettierrc', content: originalContent, merge: 'replace' }
      ])
      writeFileSync(join(tmpDir, '.prettierrc'), originalContent)
      mockFetchForUpdate(UPSTREAM_ARTIFACT)

      await runUpdate({ slug: 'prettier', yes: true })

      const manifest = JSON.parse(
        readFileSync(join(tmpDir, BLINK_DIR, 'manifest.json'), 'utf-8')
      )
      expect(manifest.items[0].version).toBe('2026.03.15.1')
      expect(manifest.items[0].files[0].checksum).toBe(
        checksum('{ "semi": false, "tabWidth": 4 }')
      )
    })
  })

  describe('section merge', () => {
    it('replaces only managed section content preserving user content', async () => {
      const originalManagedContent = 'export PATH="$HOME/.blink/bin:$PATH"'
      const markedContent = injectMarkers(
        originalManagedContent,
        'shellrc',
        '.zshrc'
      )
      const fileWithUserContent = `# My custom stuff\nalias ll="ls -la"\n\n${markedContent}\n\n# More custom stuff`

      createManifestWithItem('shellrc', [
        { path: '.zshrc', content: markedContent, merge: 'section' }
      ])
      writeFileSync(join(tmpDir, '.zshrc'), fileWithUserContent)
      mockFetchForUpdate(SECTION_UPSTREAM_ARTIFACT)

      await runUpdate({ slug: 'shellrc', yes: true })

      const updated = readFileSync(join(tmpDir, '.zshrc'), 'utf-8')
      // User content preserved
      expect(updated).toContain('alias ll="ls -la"')
      expect(updated).toContain('# More custom stuff')
      // Managed section updated
      expect(updated).toContain('export BLINK_NEW=1')
      // Markers still present
      expect(updated).toContain('blink:start shellrc')
      expect(updated).toContain('blink:end shellrc')
    })
  })

  describe('local modification detection', () => {
    it('prompts when managed section has been locally modified', async () => {
      const originalManagedContent = 'export PATH="$HOME/.blink/bin:$PATH"'
      const markedContent = injectMarkers(
        originalManagedContent,
        'shellrc',
        '.zshrc'
      )

      createManifestWithItem('shellrc', [
        { path: '.zshrc', content: markedContent, merge: 'section' }
      ])

      // User modifies the managed section
      const modifiedMarked = markedContent.replace(
        'export PATH="$HOME/.blink/bin:$PATH"',
        'export PATH="$HOME/.blink/bin:$HOME/custom:$PATH"'
      )
      writeFileSync(join(tmpDir, '.zshrc'), modifiedMarked)
      mockFetchForUpdate(SECTION_UPSTREAM_ARTIFACT)
      consolaMock.prompt.mockResolvedValue(true)

      await runUpdate({ slug: 'shellrc' })

      expect(consolaMock.prompt).toHaveBeenCalledWith(
        expect.stringContaining('.zshrc'),
        expect.any(Object)
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

      await expect(runUpdate({ slug: 'prettier' })).rejects.toThrow(
        'process.exit'
      )

      expect(consolaMock.error).toHaveBeenCalledWith(
        expect.stringContaining('not installed')
      )

      exitSpy.mockRestore()
    })
  })

  describe('no manifest', () => {
    it('errors when no manifest exists', async () => {
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit')
      })

      await expect(runUpdate({ slug: 'prettier' })).rejects.toThrow(
        'process.exit'
      )

      expect(consolaMock.error).toHaveBeenCalledWith(
        expect.stringContaining('No blink manifest')
      )

      exitSpy.mockRestore()
    })
  })

  describe('dry-run', () => {
    it('shows diff but makes no changes', async () => {
      const originalContent = '{ "semi": false }'
      createManifestWithItem('prettier', [
        { path: '.prettierrc', content: originalContent, merge: 'replace' }
      ])
      writeFileSync(join(tmpDir, '.prettierrc'), originalContent)
      mockFetchForUpdate(UPSTREAM_ARTIFACT)

      await runUpdate({ slug: 'prettier', 'dry-run': true })

      // File unchanged
      expect(readFileSync(join(tmpDir, '.prettierrc'), 'utf-8')).toBe(
        originalContent
      )
      // Manifest unchanged
      const manifest = JSON.parse(
        readFileSync(join(tmpDir, BLINK_DIR, 'manifest.json'), 'utf-8')
      )
      expect(manifest.items[0].version).toBe('2026.03.14.1')
    })
  })

  describe('already up to date', () => {
    it('skips when content matches upstream', async () => {
      const upstreamContent = '{ "semi": false, "tabWidth": 4 }'
      createManifestWithItem('prettier', [
        { path: '.prettierrc', content: upstreamContent, merge: 'replace' }
      ])
      writeFileSync(join(tmpDir, '.prettierrc'), upstreamContent)
      mockFetchForUpdate(UPSTREAM_ARTIFACT)

      await runUpdate({ slug: 'prettier', yes: true })

      expect(consolaMock.info).toHaveBeenCalledWith(
        expect.stringContaining('up to date')
      )
    })
  })
})
