// ABOUTME: Tests for the blink status command.
// ABOUTME: Validates installed item display, --json output, uninitialized state, and network error handling.
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { BLINK_DIR } from '@/manifest'
import type { Manifest, ManifestEntry, RegistryIndex } from 'blink-registry'
import type { CommandContext } from 'citty'

const sampleEntry: ManifestEntry = {
  slug: 'prettier',
  name: 'Prettier',
  type: 'config',
  version: '2026.03.14.1',
  scope: 'project',
  installedAt: '2026-03-14T00:00:00.000Z',
  files: [{ path: '.prettierrc', checksum: 'abc123', merge: 'replace' }]
}

const validIndex: RegistryIndex = {
  items: [
    {
      slug: 'prettier',
      name: 'Prettier',
      type: 'config',
      version: '2026.03.15.1',
      description: 'Prettier config',
      url: 'https://blakepetersen.io/r/config/prettier.json'
    }
  ],
  generatedAt: '2026-03-15T00:00:00.000Z'
}

let mockHomedir: string
jest.mock('node:os', () => ({
  ...jest.requireActual('node:os'),
  homedir: () => mockHomedir
}))

jest.mock('citty', () => ({
  defineCommand: <T>(config: T): T => config
}))

const consolaMock = {
  info: jest.fn(),
  success: jest.fn(),
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}

jest.mock('consola', () => ({
  consola: consolaMock,
  default: consolaMock,
  __esModule: true
}))

jest.mock('picocolors', () => ({
  default: {
    dim: (s: string) => s,
    bold: (s: string) => s
  },
  __esModule: true,
  dim: (s: string) => s,
  bold: (s: string) => s
}))

const mockFetchIndex = jest.fn()
jest.mock('@/registry', () => ({
  fetchIndex: (...args: unknown[]) => mockFetchIndex(...args)
}))

const mockFormatStatusTable = jest.fn().mockReturnValue('status table')
jest.mock('@/output', () => ({
  formatStatusTable: (...args: unknown[]) => mockFormatStatusTable(...args)
}))

let tmpDir: string
let originalCwd: string
let mockProcessExit: jest.SpyInstance
let mockConsoleLog: jest.SpyInstance

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), 'blink-status-'))
  mockHomedir = mkdtempSync(join(tmpdir(), 'blink-status-home-'))
  originalCwd = process.cwd()
  process.chdir(tmpDir)
  mockFetchIndex.mockReset()
  mockFormatStatusTable.mockClear()
  consolaMock.info.mockClear()
  consolaMock.success.mockClear()
  consolaMock.log.mockClear()
  consolaMock.warn.mockClear()
  consolaMock.error.mockClear()
  mockProcessExit = jest
    .spyOn(process, 'exit')
    .mockImplementation((() => {}) as unknown as typeof process.exit)
  mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {})
})

afterEach(() => {
  process.chdir(originalCwd)
  rmSync(tmpDir, { recursive: true, force: true })
  mockProcessExit.mockRestore()
  mockConsoleLog.mockRestore()
})

function writeManifestFile(manifest: Manifest) {
  const blinkDir = join(tmpDir, BLINK_DIR)
  mkdirSync(blinkDir, { recursive: true })
  writeFileSync(
    join(blinkDir, 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  )
}

async function runStatus(args: Record<string, boolean> = {}) {
  const mod = await import('@/commands/status')
  const command = mod.default
  await command.run!({
    args: { json: false, ...args }
  } as unknown as CommandContext)
}

describe('blink status --global', () => {
  it('reads the global manifest from the home directory', async () => {
    // Global installs were write-only: apply --global recorded to the homedir
    // manifest, but every reader hardcoded process.cwd().
    const globalEntry = {
      ...sampleEntry,
      slug: 'global-skill',
      name: 'Global Skill',
      scope: 'global' as const
    }
    mkdirSync(join(mockHomedir, BLINK_DIR), { recursive: true })
    writeFileSync(
      join(mockHomedir, BLINK_DIR, 'manifest.json'),
      JSON.stringify({ version: 1, items: [globalEntry] }, null, 2)
    )

    await runStatus({ json: true, global: true })

    const logged = mockConsoleLog.mock.calls.map(c => c[0]).join('\n')
    expect(logged).toContain('global-skill')
  })
})

describe('blink status', () => {
  it('shows warning when no manifest exists', async () => {
    await runStatus()

    expect(consolaMock.warn).toHaveBeenCalledWith(
      expect.stringContaining('not initialized')
    )
    expect(mockProcessExit).toHaveBeenCalledWith(1)
  })

  it('shows "No items installed" when manifest has empty items', async () => {
    writeManifestFile({ version: 1, items: [] })

    await runStatus()

    expect(consolaMock.info).toHaveBeenCalledWith(
      expect.stringContaining('No items installed')
    )
  })

  it('calls formatStatusTable with manifest items and registry items', async () => {
    writeManifestFile({ version: 1, items: [sampleEntry] })
    mockFetchIndex.mockResolvedValue(validIndex)

    await runStatus()

    expect(mockFormatStatusTable).toHaveBeenCalledWith(
      [sampleEntry],
      validIndex.items
    )
  })

  it('prints formatted status table via consola.log', async () => {
    writeManifestFile({ version: 1, items: [sampleEntry] })
    mockFetchIndex.mockResolvedValue(validIndex)

    await runStatus()

    expect(consolaMock.log).toHaveBeenCalledWith('status table')
  })

  it('with --json outputs JSON.stringify of manifest items', async () => {
    writeManifestFile({ version: 1, items: [sampleEntry] })

    await runStatus({ json: true })

    expect(mockConsoleLog).toHaveBeenCalledWith(
      JSON.stringify([sampleEntry], null, 2)
    )
    expect(mockFormatStatusTable).not.toHaveBeenCalled()
  })

  it('handles network error gracefully by showing items without update info', async () => {
    writeManifestFile({ version: 1, items: [sampleEntry] })
    mockFetchIndex.mockRejectedValue(new Error('Network error'))

    await runStatus()

    expect(mockFormatStatusTable).toHaveBeenCalledWith([sampleEntry], [])
  })
})
