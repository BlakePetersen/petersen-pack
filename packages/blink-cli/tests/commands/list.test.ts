// ABOUTME: Tests for the blink list command.
// ABOUTME: Validates registry item listing, --json output, and network error handling.
import type { RegistryIndex } from 'blink-registry'
import type { CommandContext } from 'citty'

const validIndex: RegistryIndex = {
  items: [
    {
      slug: 'prettier',
      name: 'Prettier',
      type: 'config',
      version: '2026.03.14.1',
      description: 'Prettier config',
      url: 'https://blakepetersen.io/r/config/prettier.json'
    },
    {
      slug: 'lint-staged',
      name: 'Lint Staged',
      type: 'config',
      version: '2026.03.14.1',
      description: 'Lint-staged config',
      url: 'https://blakepetersen.io/r/config/lint-staged.json'
    }
  ],
  generatedAt: '2026-03-14T00:00:00.000Z'
}

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

const mockFormatListTable = jest.fn().mockReturnValue('formatted table')
jest.mock('@/output', () => ({
  formatListTable: (...args: unknown[]) => mockFormatListTable(...args)
}))

let mockProcessExit: jest.SpyInstance
let mockConsoleLog: jest.SpyInstance

beforeEach(() => {
  mockFetchIndex.mockReset()
  mockFormatListTable.mockClear()
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
  mockProcessExit.mockRestore()
  mockConsoleLog.mockRestore()
})

async function runList(args: Record<string, boolean> = {}) {
  const mod = await import('@/commands/list')
  const command = mod.default
  await command.run!({
    args: { json: false, ...args }
  } as unknown as CommandContext)
}

describe('blink list', () => {
  it('fetches registry index and calls formatListTable', async () => {
    mockFetchIndex.mockResolvedValue(validIndex)

    await runList()

    expect(mockFetchIndex).toHaveBeenCalledTimes(1)
    expect(mockFormatListTable).toHaveBeenCalledWith(validIndex.items)
  })

  it('prints formatted table output via consola.log', async () => {
    mockFetchIndex.mockResolvedValue(validIndex)

    await runList()

    expect(consolaMock.log).toHaveBeenCalledWith('formatted table')
  })

  it('with --json outputs JSON.stringify of items array', async () => {
    mockFetchIndex.mockResolvedValue(validIndex)

    await runList({ json: true })

    expect(mockConsoleLog).toHaveBeenCalledWith(
      JSON.stringify(validIndex.items, null, 2)
    )
    expect(mockFormatListTable).not.toHaveBeenCalled()
  })

  it('shows error message on network failure', async () => {
    mockFetchIndex.mockRejectedValue(new Error('Network error'))

    await runList()

    expect(consolaMock.error).toHaveBeenCalledWith(
      expect.stringContaining('Failed to fetch registry')
    )
    expect(mockProcessExit).toHaveBeenCalledWith(1)
  })
})
