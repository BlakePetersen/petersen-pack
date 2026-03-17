// ABOUTME: Tests for the shared prompt utilities module.
// ABOUTME: Validates confirmation flow, skip-prompt bypass, and cancellation handling.

let consolaMock: {
  info: jest.Mock
  prompt: jest.Mock
}

jest.mock('consola', () => {
  const mock = {
    info: jest.fn(),
    prompt: jest.fn(),
  }
  return { consola: mock, default: mock, __esModule: true }
})

beforeEach(() => {
  const consola = jest.requireMock('consola')
  consolaMock = consola.consola
  consolaMock.info.mockClear()
  consolaMock.prompt.mockClear()
})

describe('confirmAction', () => {
  it('returns true when skipPrompt is true', async () => {
    const { confirmAction } = await import('@/modules/prompt')

    const result = await confirmAction('Continue?', true)

    expect(result).toBe(true)
    expect(consolaMock.prompt).not.toHaveBeenCalled()
  })

  it('exits when user cancels (symbol returned)', async () => {
    consolaMock.prompt.mockResolvedValue(Symbol('cancel'))
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit')
    })
    const { confirmAction } = await import('@/modules/prompt')

    await expect(confirmAction('Continue?', false)).rejects.toThrow('process.exit')

    expect(consolaMock.info).toHaveBeenCalledWith('Cancelled.')
    exitSpy.mockRestore()
  })
})
