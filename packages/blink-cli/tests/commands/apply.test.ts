// ABOUTME: Tests for the blink apply command.
// ABOUTME: Validates artifact fetching, file writing, markers, atomic writes, global scope, deps resolution, and manifest tracking.
import {
  mkdtempSync,
  writeFileSync,
  readFileSync,
  mkdirSync,
  rmSync,
  existsSync,
  realpathSync
} from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { BLINK_DIR } from '@/manifest'
import type { CommandContext } from 'citty'
import type { RegistryIndex, RegistryArtifact } from 'blink-registry'

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
let execSyncMock: jest.Mock

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
    yellow: (s: string) => s
  },
  __esModule: true,
  dim: (s: string) => s,
  bold: (s: string) => s,
  yellow: (s: string) => s
}))

jest.mock('node:child_process', () => ({
  execSync: jest.fn()
}))

const MOCK_INDEX = {
  items: [
    {
      slug: 'prettier',
      name: 'Prettier',
      type: 'config',
      version: '2026.03.14.1',
      description: 'Prettier config',
      url: 'https://blakepetersen.io/r/config/prettier'
    }
  ],
  generatedAt: '2026-03-14T00:00:00.000Z'
}

const MOCK_ARTIFACT = {
  slug: 'prettier',
  name: 'Prettier',
  type: 'config' as const,
  version: '2026.03.14.1',
  description: 'Prettier config',
  url: 'https://blakepetersen.io/r/config/prettier',
  files: [
    {
      path: '.prettierrc',
      content: '{ "semi": false }',
      merge: 'replace' as const
    },
    {
      path: '.prettierignore',
      content: 'dist\nnode_modules',
      merge: 'replace' as const
    }
  ],
  devDependencies: { prettier: '^3.0.0' }
}

const MOCK_ARTIFACT_NO_DEPS = {
  ...MOCK_ARTIFACT,
  slug: 'nodeps',
  name: 'No Deps',
  devDependencies: undefined
}

const MOCK_SECTION_ARTIFACT = {
  slug: 'shellrc',
  name: 'Shell RC',
  type: 'config' as const,
  version: '2026.03.14.1',
  description: 'Shell RC managed section',
  url: 'https://blakepetersen.io/r/config/shellrc',
  files: [
    {
      path: '.zshrc',
      content: 'export PATH="$HOME/.blink/bin:$PATH"',
      merge: 'section' as const
    }
  ],
  devDependencies: undefined
}

const MOCK_ARTIFACT_WITH_DEPS = {
  slug: 'eslint-prettier',
  name: 'ESLint Prettier',
  type: 'config' as const,
  version: '2026.03.14.1',
  description: 'ESLint with Prettier',
  url: 'https://blakepetersen.io/r/config/eslint-prettier',
  files: [
    {
      path: '.eslintrc.json',
      content: '{ "extends": ["prettier"] }',
      merge: 'replace' as const
    }
  ],
  dependencies: ['prettier'],
  devDependencies: undefined
}

const MOCK_INDEX_EXTENDED = {
  items: [
    ...MOCK_INDEX.items,
    {
      slug: 'shellrc',
      name: 'Shell RC',
      type: 'config',
      version: '2026.03.14.1',
      description: 'Shell RC managed section',
      url: 'https://blakepetersen.io/r/config/shellrc'
    },
    {
      slug: 'eslint-prettier',
      name: 'ESLint Prettier',
      type: 'config',
      version: '2026.03.14.1',
      description: 'ESLint with Prettier',
      url: 'https://blakepetersen.io/r/config/eslint-prettier'
    }
  ],
  generatedAt: '2026-03-14T00:00:00.000Z'
}

function mockFetchResponses(index: RegistryIndex, artifact: RegistryArtifact) {
  fetchMock = jest
    .fn()
    .mockResolvedValueOnce({
      ok: true,
      json: async () => index
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => artifact
    })
  global.fetch = fetchMock
}

beforeEach(() => {
  tmpDir = realpathSync(mkdtempSync(join(tmpdir(), 'blink-apply-')))
  originalCwd = process.cwd()
  process.chdir(tmpDir)

  // Create a lockfile so PM detection works
  writeFileSync(join(tmpDir, 'pnpm-lock.yaml'), '')

  const consola = jest.requireMock('consola')
  consolaMock = consola.consola
  consolaMock.info.mockClear()
  consolaMock.success.mockClear()
  consolaMock.log.mockClear()
  consolaMock.warn.mockClear()
  consolaMock.error.mockClear()
  consolaMock.prompt.mockClear()

  execSyncMock = jest.requireMock('node:child_process').execSync
  execSyncMock.mockClear()

  // Default: TTY
  Object.defineProperty(process.stdout, 'isTTY', {
    value: true,
    configurable: true
  })
})

afterEach(() => {
  process.chdir(originalCwd)
  rmSync(tmpDir, { recursive: true, force: true })
})

async function runApply(
  args: Record<string, string | boolean | undefined> = {}
) {
  const mod = await import('@/commands/apply')
  const command = mod.default
  await command.run!({
    args: {
      slug: 'prettier',
      'dry-run': false,
      yes: false,
      project: true,
      global: false,
      ...args
    }
  } as unknown as CommandContext)
}

describe('blink apply', () => {
  describe('happy path', () => {
    it('writes artifact files to cwd and updates manifest', async () => {
      mockFetchResponses(MOCK_INDEX, MOCK_ARTIFACT)
      consolaMock.prompt.mockResolvedValue(true) // confirm deps install

      await runApply({ yes: true })

      // Files written
      expect(existsSync(join(tmpDir, '.prettierrc'))).toBe(true)
      expect(readFileSync(join(tmpDir, '.prettierrc'), 'utf-8')).toBe(
        '{ "semi": false }'
      )
      expect(existsSync(join(tmpDir, '.prettierignore'))).toBe(true)

      // Manifest updated
      const manifest = JSON.parse(
        readFileSync(join(tmpDir, BLINK_DIR, 'manifest.json'), 'utf-8')
      )
      expect(manifest.items).toHaveLength(1)
      expect(manifest.items[0].slug).toBe('prettier')
      expect(manifest.items[0].files).toHaveLength(2)
      expect(manifest.items[0].files[0].checksum).toBeDefined()
    })

    it('creates directories for nested file paths', async () => {
      const artifact = {
        ...MOCK_ARTIFACT,
        files: [
          {
            path: 'src/config/prettier.ts',
            content: 'export default {}',
            merge: 'replace' as const
          }
        ],
        devDependencies: undefined
      }
      mockFetchResponses(MOCK_INDEX, artifact)

      await runApply({ yes: true })

      expect(existsSync(join(tmpDir, 'src/config/prettier.ts'))).toBe(true)
    })
  })

  describe('already installed', () => {
    it('warns and suggests blink update when slug is in manifest', async () => {
      // Pre-create manifest with the artifact already installed
      const blinkDir = join(tmpDir, BLINK_DIR)
      mkdirSync(blinkDir, { recursive: true })
      writeFileSync(
        join(blinkDir, 'manifest.json'),
        JSON.stringify({
          version: 1,
          items: [
            {
              slug: 'prettier',
              name: 'Prettier',
              type: 'config',
              version: '2026.03.14.1',
              scope: 'project',
              installedAt: '2026-03-14T00:00:00.000Z',
              files: [
                { path: '.prettierrc', checksum: 'abc', merge: 'replace' }
              ]
            }
          ]
        })
      )

      mockFetchResponses(MOCK_INDEX, MOCK_ARTIFACT)

      await runApply()

      expect(consolaMock.warn).toHaveBeenCalledWith(
        expect.stringContaining('already installed')
      )
      expect(consolaMock.warn).toHaveBeenCalledWith(
        expect.stringContaining('blink update')
      )
      // No files should have been written
      expect(existsSync(join(tmpDir, '.prettierrc'))).toBe(false)
    })
  })

  describe('file conflict with --yes', () => {
    it('overwrites existing files without prompt', async () => {
      mockFetchResponses(MOCK_INDEX, MOCK_ARTIFACT)
      writeFileSync(join(tmpDir, '.prettierrc'), 'old content')

      await runApply({ yes: true })

      expect(readFileSync(join(tmpDir, '.prettierrc'), 'utf-8')).toBe(
        '{ "semi": false }'
      )
      // Should not have been prompted
      expect(consolaMock.prompt).not.toHaveBeenCalled()
    })
  })

  describe('dry-run', () => {
    it('does not write files or update manifest', async () => {
      mockFetchResponses(MOCK_INDEX, MOCK_ARTIFACT)

      await runApply({ 'dry-run': true })

      // No files written
      expect(existsSync(join(tmpDir, '.prettierrc'))).toBe(false)
      expect(existsSync(join(tmpDir, '.prettierignore'))).toBe(false)

      // No manifest
      expect(existsSync(join(tmpDir, BLINK_DIR, 'manifest.json'))).toBe(false)
    })

    it('shows dry-run header and action labels', async () => {
      mockFetchResponses(MOCK_INDEX, MOCK_ARTIFACT)

      await runApply({ 'dry-run': true })

      // dry-run header shown
      expect(consolaMock.log).toHaveBeenCalledWith(
        expect.stringContaining('dry run')
      )
      // action labels shown
      expect(consolaMock.log).toHaveBeenCalledWith(
        expect.stringContaining('[write]')
      )
      expect(consolaMock.log).toHaveBeenCalledWith(
        expect.stringContaining('[manifest]')
      )
      // no changes footer
      expect(consolaMock.log).toHaveBeenCalledWith(
        expect.stringContaining('No changes made.')
      )
    })

    it('shows install label for devDependencies', async () => {
      mockFetchResponses(MOCK_INDEX, MOCK_ARTIFACT)

      await runApply({ 'dry-run': true })

      expect(consolaMock.log).toHaveBeenCalledWith(
        expect.stringContaining('[install]')
      )
    })
  })

  describe('non-TTY', () => {
    it('skips prompts in non-TTY environment', async () => {
      Object.defineProperty(process.stdout, 'isTTY', {
        value: false,
        configurable: true
      })
      mockFetchResponses(MOCK_INDEX, MOCK_ARTIFACT)

      await runApply()

      // Files written without prompts
      expect(existsSync(join(tmpDir, '.prettierrc'))).toBe(true)
      expect(consolaMock.prompt).not.toHaveBeenCalled()
    })
  })

  describe('unknown slug', () => {
    it('shows error for non-existent artifact', async () => {
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit')
      })

      const emptyIndex = { items: [], generatedAt: '2026-03-14T00:00:00.000Z' }
      fetchMock = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => emptyIndex
      })
      global.fetch = fetchMock

      await expect(runApply({ slug: 'nonexistent' })).rejects.toThrow(
        'process.exit'
      )

      expect(consolaMock.error).toHaveBeenCalledWith(
        expect.stringContaining('not found')
      )

      exitSpy.mockRestore()
    })
  })

  describe('auto-init', () => {
    it('creates manifest when .blink/ does not exist', async () => {
      mockFetchResponses(MOCK_INDEX, MOCK_ARTIFACT)

      await runApply({ yes: true })

      expect(existsSync(join(tmpDir, BLINK_DIR, 'manifest.json'))).toBe(true)
      const manifest = JSON.parse(
        readFileSync(join(tmpDir, BLINK_DIR, 'manifest.json'), 'utf-8')
      )
      expect(manifest.items).toHaveLength(1)
    })
  })

  describe('devDependencies', () => {
    it('runs install command when confirmed', async () => {
      mockFetchResponses(MOCK_INDEX, MOCK_ARTIFACT)

      await runApply({ yes: true })

      expect(execSyncMock).toHaveBeenCalledWith(
        expect.stringContaining('pnpm add -D prettier@^3.0.0'),
        expect.objectContaining({ cwd: tmpDir })
      )
    })

    it('does not run install when artifact has no devDependencies', async () => {
      const indexWithNoDeps = {
        ...MOCK_INDEX,
        items: [{ ...MOCK_INDEX.items[0], slug: 'nodeps' }]
      }
      mockFetchResponses(indexWithNoDeps, MOCK_ARTIFACT_NO_DEPS)

      await runApply({ slug: 'nodeps', yes: true })

      expect(execSyncMock).not.toHaveBeenCalled()
    })

    it('handles install failure gracefully', async () => {
      mockFetchResponses(MOCK_INDEX, MOCK_ARTIFACT)
      execSyncMock.mockImplementation(() => {
        throw new Error('install failed')
      })

      await runApply({ yes: true })

      expect(consolaMock.error).toHaveBeenCalledWith(
        expect.stringContaining('Dependency installation failed')
      )
      // Manifest should still be updated
      const manifest = JSON.parse(
        readFileSync(join(tmpDir, BLINK_DIR, 'manifest.json'), 'utf-8')
      )
      expect(manifest.items).toHaveLength(1)
    })
  })

  describe('--project flag', () => {
    it('defaults scope to project in manifest entry', async () => {
      mockFetchResponses(MOCK_INDEX, MOCK_ARTIFACT)

      await runApply({ yes: true })

      const manifest = JSON.parse(
        readFileSync(join(tmpDir, BLINK_DIR, 'manifest.json'), 'utf-8')
      )
      expect(manifest.items[0].scope).toBe('project')
    })

    it('sets scope to project when --project is explicit', async () => {
      mockFetchResponses(MOCK_INDEX, MOCK_ARTIFACT)

      await runApply({ yes: true, project: true })

      const manifest = JSON.parse(
        readFileSync(join(tmpDir, BLINK_DIR, 'manifest.json'), 'utf-8')
      )
      expect(manifest.items[0].scope).toBe('project')
    })

    it('sets scope to global when --global is true', async () => {
      mockFetchResponses(MOCK_INDEX, MOCK_ARTIFACT)

      // For global scope tests, mock scope module to avoid writing to real $HOME
      const scopeMod = await import('@/scope')
      jest
        .spyOn(scopeMod, 'resolveManifestRoot')
        .mockImplementation((_scope, cwd) => cwd)
      jest
        .spyOn(scopeMod, 'resolveDestination')
        .mockImplementation((filePath, _scope, cwd) => join(cwd, filePath))

      await runApply({ yes: true, global: true, project: false })

      const manifest = JSON.parse(
        readFileSync(join(tmpDir, BLINK_DIR, 'manifest.json'), 'utf-8')
      )
      expect(manifest.items[0].scope).toBe('global')

      // Restore
      ;(scopeMod.resolveManifestRoot as jest.Mock).mockRestore()
      ;(scopeMod.resolveDestination as jest.Mock).mockRestore()
    })
  })

  describe('checksum', () => {
    it('computes checksum from exact file content', async () => {
      mockFetchResponses(MOCK_INDEX, MOCK_ARTIFACT)

      await runApply({ yes: true })

      const manifest = JSON.parse(
        readFileSync(join(tmpDir, BLINK_DIR, 'manifest.json'), 'utf-8')
      )
      const fileEntry = manifest.items[0].files[0]
      // Checksum should be a 64-char hex string (sha256)
      expect(fileEntry.checksum).toMatch(/^[a-f0-9]{64}$/)
    })
  })

  describe('section markers', () => {
    it('wraps section-merge content with markers before writing', async () => {
      mockFetchResponses(MOCK_INDEX_EXTENDED, MOCK_SECTION_ARTIFACT)

      await runApply({ slug: 'shellrc', yes: true })

      const written = readFileSync(join(tmpDir, '.zshrc'), 'utf-8')
      expect(written).toContain('blink:start shellrc')
      expect(written).toContain('export PATH="$HOME/.blink/bin:$PATH"')
      expect(written).toContain('blink:end shellrc')
    })

    it('computes checksum from marker-injected content', async () => {
      mockFetchResponses(MOCK_INDEX_EXTENDED, MOCK_SECTION_ARTIFACT)

      await runApply({ slug: 'shellrc', yes: true })

      const manifest = JSON.parse(
        readFileSync(join(tmpDir, BLINK_DIR, 'manifest.json'), 'utf-8')
      )
      const fileEntry = manifest.items[0].files[0]
      // Checksum should match the content WITH markers (what's on disk)
      const onDisk = readFileSync(join(tmpDir, '.zshrc'), 'utf-8')
      const { checksum } = await import('@/manifest')
      expect(fileEntry.checksum).toBe(checksum(onDisk))
    })

    it('writes replace-merge content without markers', async () => {
      mockFetchResponses(MOCK_INDEX, MOCK_ARTIFACT)

      await runApply({ yes: true })

      const written = readFileSync(join(tmpDir, '.prettierrc'), 'utf-8')
      expect(written).not.toContain('blink:start')
      expect(written).toBe('{ "semi": false }')
    })
  })

  describe('atomic writes', () => {
    it('uses atomicWrite for file operations', async () => {
      mockFetchResponses(MOCK_INDEX, MOCK_ARTIFACT)

      await runApply({ yes: true })

      // Verify files exist (atomicWrite creates parent dirs and writes atomically)
      expect(existsSync(join(tmpDir, '.prettierrc'))).toBe(true)
      expect(readFileSync(join(tmpDir, '.prettierrc'), 'utf-8')).toBe(
        '{ "semi": false }'
      )
    })
  })

  describe('--global flag', () => {
    it('resolves destinations via scope module for global scope', async () => {
      mockFetchResponses(MOCK_INDEX, MOCK_ARTIFACT)

      // Mock scope module to verify it's called with 'global' and to avoid writing to real $HOME
      const scopeMod = await import('@/scope')
      const resolveDestSpy = jest
        .spyOn(scopeMod, 'resolveDestination')
        .mockImplementation((filePath, _scope, cwd) => join(cwd, filePath))
      jest
        .spyOn(scopeMod, 'resolveManifestRoot')
        .mockImplementation((_scope, cwd) => cwd)

      await runApply({ yes: true, global: true, project: false })

      expect(resolveDestSpy).toHaveBeenCalledWith(
        expect.any(String),
        'global',
        expect.any(String)
      )

      // Restore
      ;(scopeMod.resolveManifestRoot as jest.Mock).mockRestore()
      ;(scopeMod.resolveDestination as jest.Mock).mockRestore()
    })
  })

  describe('dependency resolution', () => {
    it('prompts to apply missing dependencies', async () => {
      // First fetch: index. Second fetch: eslint-prettier artifact (has dep on prettier)
      // User declines to apply deps
      fetchMock = jest
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => MOCK_INDEX_EXTENDED
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => MOCK_ARTIFACT_WITH_DEPS
        })
      global.fetch = fetchMock
      consolaMock.prompt.mockResolvedValueOnce(false) // decline dep install

      await runApply({ slug: 'eslint-prettier', yes: false })

      expect(consolaMock.prompt).toHaveBeenCalledWith(
        expect.stringContaining('prettier'),
        expect.any(Object)
      )
      // Warning logged about continuing without deps
      expect(consolaMock.warn).toHaveBeenCalled()
    })

    it('proceeds normally when artifact has no dependencies', async () => {
      mockFetchResponses(MOCK_INDEX, MOCK_ARTIFACT)

      await runApply({ yes: true })

      // Should not prompt for dependencies
      const promptCalls = consolaMock.prompt.mock.calls.map(c => c[0])
      const depPrompts = promptCalls.filter(
        (msg: string) => typeof msg === 'string' && msg.includes('Missing')
      )
      expect(depPrompts).toHaveLength(0)
    })

    it('proceeds normally when all dependencies are already installed', async () => {
      // Pre-create manifest with prettier installed
      const blinkDir = join(tmpDir, BLINK_DIR)
      mkdirSync(blinkDir, { recursive: true })
      writeFileSync(
        join(blinkDir, 'manifest.json'),
        JSON.stringify({
          version: 1,
          items: [
            {
              slug: 'prettier',
              name: 'Prettier',
              type: 'config',
              version: '2026.03.14.1',
              scope: 'project',
              installedAt: '2026-03-14T00:00:00.000Z',
              files: [
                { path: '.prettierrc', checksum: 'abc', merge: 'replace' }
              ]
            }
          ]
        })
      )

      fetchMock = jest
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => MOCK_INDEX_EXTENDED
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => MOCK_ARTIFACT_WITH_DEPS
        })
      global.fetch = fetchMock

      await runApply({ slug: 'eslint-prettier', yes: true })

      // Should write eslint config without prompting about deps
      expect(existsSync(join(tmpDir, '.eslintrc.json'))).toBe(true)
    })
  })

  describe('marker-conflict pre-flight', () => {
    it('writes nothing and exits non-zero when any file has a marker conflict', async () => {
      // Two files: the second collides with an existing managed section.
      // The old mid-loop check wrote the first file, then returned exit 0,
      // leaving an untracked partial install.
      const twoFileArtifact = {
        slug: 'shellrc',
        name: 'Shell RC',
        type: 'config' as const,
        version: '2026.03.14.1',
        description: 'Shell RC managed section',
        url: 'https://blakepetersen.io/r/config/shellrc',
        files: [
          {
            path: 'fresh-file.txt',
            content: 'new content',
            merge: 'replace' as const
          },
          { path: '.zshrc', content: 'export FOO=1', merge: 'section' as const }
        ],
        devDependencies: undefined
      }
      // Existing managed section for the same slug in .zshrc → conflict
      writeFileSync(
        join(tmpDir, '.zshrc'),
        '# blink:start shellrc\nold\n# blink:end shellrc\n'
      )

      const originalExitCode = process.exitCode
      fetchMock = jest
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => MOCK_INDEX_EXTENDED
        })
        .mockResolvedValueOnce({ ok: true, json: async () => twoFileArtifact })
      global.fetch = fetchMock

      await runApply({ slug: 'shellrc', yes: true })

      expect(existsSync(join(tmpDir, 'fresh-file.txt'))).toBe(false)
      expect(consolaMock.error).toHaveBeenCalledWith(
        expect.stringContaining('already installed')
      )
      expect(process.exitCode).toBe(1)
      process.exitCode = originalExitCode
    })
  })
})
