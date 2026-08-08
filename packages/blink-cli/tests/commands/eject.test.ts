// ABOUTME: Tests for the blink eject command.
// ABOUTME: Validates marker stripping, manifest removal, dry-run mode, and error handling.
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
    scope: 'project',
    installedAt: '2026-03-14T00:00:00.000Z',
    files: files.map(f => ({
      path: f.path,
      checksum: checksum(f.content),
      merge: f.merge
    }))
  }
}

beforeEach(() => {
  tmpDir = realpathSync(mkdtempSync(join(tmpdir(), 'blink-eject-')))
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

async function runEject(args: Record<string, any> = {}) {
  const mod = await import('@/commands/eject')
  const command = mod.default
  await command.run!({
    args: { slug: undefined, 'dry-run': false, yes: false, ...args }
  } as any)
}

describe('blink eject', () => {
  describe('error cases', () => {
    it('errors when no manifest exists', async () => {
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit')
      })

      await expect(runEject({ slug: 'prettier' })).rejects.toThrow(
        'process.exit'
      )
      expect(consolaMock.error).toHaveBeenCalledWith(
        expect.stringContaining('No blink manifest')
      )

      exitSpy.mockRestore()
    })

    it('errors when slug is not in manifest', async () => {
      createManifest([])

      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit')
      })

      await expect(runEject({ slug: 'prettier' })).rejects.toThrow(
        'process.exit'
      )
      expect(consolaMock.error).toHaveBeenCalledWith(
        expect.stringContaining('not installed')
      )

      exitSpy.mockRestore()
    })
  })

  describe('section merge files', () => {
    it('strips section markers from files with merge: section', async () => {
      const managedContent = 'export PATH="$HOME/.blink/bin:$PATH"'
      const markedContent = injectMarkers(managedContent, 'shellrc', '.zshrc')
      const fileContent = `# My stuff\nalias ll="ls -la"\n\n${markedContent}\n\n# More stuff`

      createManifest([
        makeEntry('shellrc', [
          { path: '.zshrc', content: markedContent, merge: 'section' }
        ])
      ])
      writeFileSync(join(tmpDir, '.zshrc'), fileContent)

      await runEject({ slug: 'shellrc' })

      const result = readFileSync(join(tmpDir, '.zshrc'), 'utf-8')
      // Content preserved
      expect(result).toContain('alias ll="ls -la"')
      expect(result).toContain('export PATH="$HOME/.blink/bin:$PATH"')
      expect(result).toContain('# More stuff')
      // Markers removed
      expect(result).not.toContain('blink:start')
      expect(result).not.toContain('blink:end')
    })

    it('leaves content intact, only marker lines removed', async () => {
      const managedContent = 'line1\nline2\nline3'
      const markedContent = injectMarkers(managedContent, 'shellrc', '.zshrc')

      createManifest([
        makeEntry('shellrc', [
          { path: '.zshrc', content: markedContent, merge: 'section' }
        ])
      ])
      writeFileSync(join(tmpDir, '.zshrc'), markedContent)

      await runEject({ slug: 'shellrc' })

      const result = readFileSync(join(tmpDir, '.zshrc'), 'utf-8')
      expect(result).toBe('line1\nline2\nline3')
    })
  })

  describe('replace merge files', () => {
    it('does not modify files with merge: replace', async () => {
      const content = '{ "semi": false }'
      createManifest([
        makeEntry('prettier', [
          { path: '.prettierrc', content, merge: 'replace' }
        ])
      ])
      writeFileSync(join(tmpDir, '.prettierrc'), content)

      await runEject({ slug: 'prettier' })

      const result = readFileSync(join(tmpDir, '.prettierrc'), 'utf-8')
      expect(result).toBe(content)
      expect(consolaMock.info).toHaveBeenCalledWith(
        expect.stringContaining('no markers to strip')
      )
    })
  })

  describe('manifest updates', () => {
    it('removes entry from manifest after eject', async () => {
      const content = '{ "semi": false }'
      const otherEntry = makeEntry('shellrc', [
        { path: '.zshrc', content: '# test', merge: 'section' }
      ])
      createManifest([
        makeEntry('prettier', [
          { path: '.prettierrc', content, merge: 'replace' }
        ]),
        otherEntry
      ])
      writeFileSync(join(tmpDir, '.prettierrc'), content)
      writeFileSync(
        join(tmpDir, '.zshrc'),
        injectMarkers('# test', 'shellrc', '.zshrc')
      )

      await runEject({ slug: 'prettier' })

      const manifest = JSON.parse(
        readFileSync(join(tmpDir, BLINK_DIR, 'manifest.json'), 'utf-8')
      )
      expect(manifest.items).toHaveLength(1)
      expect(manifest.items[0].slug).toBe('shellrc')
    })
  })

  describe('dry-run', () => {
    it('previews without modifying files or manifest', async () => {
      const managedContent = 'export PATH="$HOME/.blink/bin:$PATH"'
      const markedContent = injectMarkers(managedContent, 'shellrc', '.zshrc')

      createManifest([
        makeEntry('shellrc', [
          { path: '.zshrc', content: markedContent, merge: 'section' }
        ])
      ])
      writeFileSync(join(tmpDir, '.zshrc'), markedContent)

      await runEject({ slug: 'shellrc', 'dry-run': true })

      // File unchanged (markers still present)
      const result = readFileSync(join(tmpDir, '.zshrc'), 'utf-8')
      expect(result).toContain('blink:start')

      // Manifest unchanged
      const manifest = JSON.parse(
        readFileSync(join(tmpDir, BLINK_DIR, 'manifest.json'), 'utf-8')
      )
      expect(manifest.items).toHaveLength(1)
    })
  })

  describe('missing files', () => {
    it('handles files deleted from disk gracefully', async () => {
      createManifest([
        makeEntry('shellrc', [
          { path: '.zshrc', content: '# test', merge: 'section' }
        ])
      ])
      // Don't write .zshrc to disk

      await runEject({ slug: 'shellrc' })

      expect(consolaMock.warn).toHaveBeenCalledWith(
        expect.stringContaining('.zshrc')
      )
      // Manifest still updated (entry removed)
      const manifest = JSON.parse(
        readFileSync(join(tmpDir, BLINK_DIR, 'manifest.json'), 'utf-8')
      )
      expect(manifest.items).toHaveLength(0)
    })
  })

  describe('success output', () => {
    it('reports success with ejected file list', async () => {
      const content = '{ "semi": false }'
      createManifest([
        makeEntry('prettier', [
          { path: '.prettierrc', content, merge: 'replace' }
        ])
      ])
      writeFileSync(join(tmpDir, '.prettierrc'), content)

      await runEject({ slug: 'prettier' })

      expect(consolaMock.success).toHaveBeenCalledWith(
        expect.stringContaining('Ejected')
      )
      expect(consolaMock.success).toHaveBeenCalledWith(
        expect.stringContaining('fully yours')
      )
    })
  })
})
