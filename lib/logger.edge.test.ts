// ABOUTME: Unit tests for Edge logger shim — verifies JSON output shape matches Node pino
// ABOUTME: Captures console.log to assert level/time/msg/bindings structure

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('edge logger', () => {
  let logSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
  })
  afterEach(() => {
    logSpy.mockRestore()
  })

  function lastLine(): Record<string, unknown> {
    const call = logSpy.mock.calls[logSpy.mock.calls.length - 1]
    return JSON.parse(String(call[0])) as Record<string, unknown>
  }

  it('exposes pino API surface (trace/debug/info/warn/error/fatal/child)', async () => {
    const { logger } = await import('./logger.edge')
    expect(typeof logger.trace).toBe('function')
    expect(typeof logger.debug).toBe('function')
    expect(typeof logger.info).toBe('function')
    expect(typeof logger.warn).toBe('function')
    expect(typeof logger.error).toBe('function')
    expect(typeof logger.fatal).toBe('function')
    expect(typeof logger.child).toBe('function')
  })

  it('emits JSON with level=30 and msg for info', async () => {
    const { logger } = await import('./logger.edge')
    logger.info('hello')
    const parsed = lastLine()
    expect(parsed.level).toBe(30)
    expect(parsed.msg).toBe('hello')
    expect(typeof parsed.time).toBe('number')
  })

  it('merges object payload into the JSON line', async () => {
    const { logger } = await import('./logger.edge')
    logger.warn({ userId: 'u_1' }, 'warning.event')
    const parsed = lastLine()
    expect(parsed.level).toBe(40)
    expect(parsed.userId).toBe('u_1')
    expect(parsed.msg).toBe('warning.event')
  })

  it('maps pino levels: trace=10, debug=20, info=30, warn=40, error=50, fatal=60', async () => {
    const { logger } = await import('./logger.edge')
    const levels: Array<
      ['trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal', number]
    > = [
      ['trace', 10],
      ['debug', 20],
      ['info', 30],
      ['warn', 40],
      ['error', 50],
      ['fatal', 60],
    ]
    for (const [method, expected] of levels) {
      logger[method]('x')
      expect(lastLine().level).toBe(expected)
    }
  })

  it('serializes Error instances with message/stack/name under err', async () => {
    const { logger } = await import('./logger.edge')
    const err = new Error('boom')
    logger.error(err, 'fetch.failed')
    const parsed = lastLine()
    expect(parsed.level).toBe(50)
    expect(parsed.msg).toBe('fetch.failed')
    const payload = parsed.err as Record<string, unknown>
    expect(payload.message).toBe('boom')
    expect(payload.name).toBe('Error')
    expect(typeof payload.stack).toBe('string')
  })

  it('child() merges bindings into every emitted line', async () => {
    const { logger } = await import('./logger.edge')
    const child = logger.child({ module: 'auth', tenant: 'ashley' })
    child.info({ action: 'login' }, 'auth.login')
    const parsed = lastLine()
    expect(parsed.module).toBe('auth')
    expect(parsed.tenant).toBe('ashley')
    expect(parsed.action).toBe('login')
    expect(parsed.msg).toBe('auth.login')
  })
})
