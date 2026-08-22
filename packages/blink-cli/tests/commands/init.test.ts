// ABOUTME: Tests for the blink init command.
// ABOUTME: Validates manifest creation, .gitignore management, dry-run mode, and re-init behavior.
import {
  mkdtempSync,
  writeFileSync,
  readFileSync,
  mkdirSync,
  rmSync,
  existsSync
} from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { BLINK_DIR } from '@/manifest'
import type { CommandContext } from 'citty'

let tmpDir: string
let originalCwd: string
let consolaMock: {
  info: jest.Mock
  success: jest.Mock
  log: jest.Mock
  warn: jest.Mock
}

jest.mock('citty', () => ({
  defineCommand: <T>(config: T): T => config
}))

jest.mock('consola', () => {
  const mock = {
    info: jest.fn(),
    success: jest.fn(),
    log: jest.fn(),
    warn: jest.fn()
  }
  return { consola: mock, default: mock, __esModule: true }
})

jest.mock('picocolors', () => ({
  default: {
    dim: (s: string) => s,
    bold: (s: string) => s
  },
  __esModule: true,
  dim: (s: string) => s,
  bold: (s: string) => s
}))

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), 'blink-init-'))
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
})

afterEach(() => {
  process.chdir(originalCwd)
  rmSync(tmpDir, { recursive: true, force: true })
})

async function runInit(args: Record<string, boolean> = {}) {
  // Fresh import each time to avoid stale module state
  const mod = await import('@/commands/init')
  const command = mod.default
  await command.run!({
    args: { yes: false, 'dry-run': false, ...args }
  } as unknown as CommandContext)
}

describe('blink init', () => {
  it('creates .blink/ directory and manifest.json with empty manifest', async () => {
    await runInit()

    const manifestPath = join(tmpDir, BLINK_DIR, 'manifest.json')
    expect(existsSync(manifestPath)).toBe(true)

    const content = JSON.parse(readFileSync(manifestPath, 'utf-8'))
    expect(content).toEqual({ version: 1, items: [] })
  })

  it('creates .gitignore with .blink/ entry when no .gitignore exists', async () => {
    await runInit()

    const gitignorePath = join(tmpDir, '.gitignore')
    expect(existsSync(gitignorePath)).toBe(true)

    const content = readFileSync(gitignorePath, 'utf-8')
    expect(content).toContain('.blink/')
  })

  it('adds .blink/ to existing .gitignore', async () => {
    writeFileSync(join(tmpDir, '.gitignore'), 'node_modules/\n')

    await runInit()

    const content = readFileSync(join(tmpDir, '.gitignore'), 'utf-8')
    expect(content).toContain('node_modules/')
    expect(content).toContain('.blink/')
  })

  it('handles .gitignore without trailing newline', async () => {
    writeFileSync(join(tmpDir, '.gitignore'), 'node_modules/')

    await runInit()

    const content = readFileSync(join(tmpDir, '.gitignore'), 'utf-8')
    expect(content).toBe('node_modules/\n.blink/\n')
  })

  it('does not duplicate .blink/ entry if already in .gitignore', async () => {
    writeFileSync(join(tmpDir, '.gitignore'), '.blink/\nnode_modules/\n')

    await runInit()

    const content = readFileSync(join(tmpDir, '.gitignore'), 'utf-8')
    const matches = content.match(/\.blink\//g)
    expect(matches).toHaveLength(1)
  })

  it('shows "already initialized" with item count on re-init', async () => {
    // Create existing manifest with items
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
            files: [{ path: '.prettierrc', checksum: 'abc', merge: 'replace' }]
          }
        ]
      })
    )

    await runInit()

    expect(consolaMock.info).toHaveBeenCalledWith(
      expect.stringContaining('already initialized')
    )
    expect(consolaMock.info).toHaveBeenCalledWith(
      expect.stringContaining('1 item')
    )
  })

  it('shows detected package manager name', async () => {
    await runInit()

    expect(consolaMock.info).toHaveBeenCalledWith(
      expect.stringContaining('pnpm')
    )
  })

  it('accepts --yes flag without error', async () => {
    await expect(runInit({ yes: true })).resolves.not.toThrow()

    expect(existsSync(join(tmpDir, BLINK_DIR, 'manifest.json'))).toBe(true)
  })

  describe('--dry-run', () => {
    it('prints preview without creating files', async () => {
      await runInit({ 'dry-run': true })

      expect(existsSync(join(tmpDir, BLINK_DIR))).toBe(false)
      expect(consolaMock.log).toHaveBeenCalledWith(
        expect.stringContaining('manifest.json')
      )
      expect(consolaMock.log).toHaveBeenCalledWith(
        expect.stringContaining('.gitignore')
      )
    })

    it('does not create .blink/ directory or modify .gitignore', async () => {
      writeFileSync(join(tmpDir, '.gitignore'), 'node_modules/\n')

      await runInit({ 'dry-run': true })

      expect(existsSync(join(tmpDir, BLINK_DIR))).toBe(false)
      const content = readFileSync(join(tmpDir, '.gitignore'), 'utf-8')
      expect(content).toBe('node_modules/\n')
    })

    it('shows "No changes made." footer', async () => {
      await runInit({ 'dry-run': true })

      expect(consolaMock.log).toHaveBeenCalledWith(
        expect.stringContaining('No changes made.')
      )
    })

    it('on already-initialized project shows same message as normal', async () => {
      const blinkDir = join(tmpDir, BLINK_DIR)
      mkdirSync(blinkDir, { recursive: true })
      writeFileSync(
        join(blinkDir, 'manifest.json'),
        JSON.stringify({ version: 1, items: [] })
      )

      await runInit({ 'dry-run': true })

      expect(consolaMock.info).toHaveBeenCalledWith(
        expect.stringContaining('already initialized')
      )
    })
  })
})
