// ABOUTME: Edge-runtime logger shim — pino-API-compatible JSON emitter
// ABOUTME: Used by client components + any opt-in Edge route handlers; proxy.ts uses Node logger

type Level = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'

const levelNum: Record<Level, number> = {
  trace: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  fatal: 60,
}

function emit(
  level: Level,
  bindings: Record<string, unknown>,
  obj: unknown,
  msg?: string
): void {
  const base: Record<string, unknown> = {
    level: levelNum[level],
    time: Date.now(),
    ...bindings,
  }
  let payload: Record<string, unknown>
  if (typeof obj === 'string') {
    payload = { ...base, msg: obj }
  } else if (obj instanceof Error) {
    // Error's message/stack/name are non-enumerable, so a naive spread
    // drops them. Serialize explicitly so stack traces survive.
    payload = {
      ...base,
      err: { message: obj.message, stack: obj.stack, name: obj.name },
      msg,
    }
  } else if (obj && typeof obj === 'object') {
    payload = { ...base, ...(obj as Record<string, unknown>), msg }
  } else {
    payload = { ...base, msg }
  }

  console.log(JSON.stringify(payload))
}

export interface EdgeLogger {
  trace: (obj: unknown, msg?: string) => void
  debug: (obj: unknown, msg?: string) => void
  info: (obj: unknown, msg?: string) => void
  warn: (obj: unknown, msg?: string) => void
  error: (obj: unknown, msg?: string) => void
  fatal: (obj: unknown, msg?: string) => void
  child: (bindings: Record<string, unknown>) => EdgeLogger
}

function make(bindings: Record<string, unknown> = {}): EdgeLogger {
  return {
    trace: (o, m) => emit('trace', bindings, o, m),
    debug: (o, m) => emit('debug', bindings, o, m),
    info: (o, m) => emit('info', bindings, o, m),
    warn: (o, m) => emit('warn', bindings, o, m),
    error: (o, m) => emit('error', bindings, o, m),
    fatal: (o, m) => emit('fatal', bindings, o, m),
    child: (b) => make({ ...bindings, ...b }),
  }
}

export const logger: EdgeLogger = make()
