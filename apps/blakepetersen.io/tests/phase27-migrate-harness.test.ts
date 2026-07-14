// ABOUTME: Codemod harness skeleton tests.
// ABOUTME: Smoke + dry-run failure-path. Uses spawnSync (argv array, no shell).

import path from 'node:path'
import { spawnSync } from 'node:child_process'

const repoAppRoot = path.resolve(__dirname, '..')

function runMigrate(...args: string[]): {
  exitCode: number
  stdout: string
  stderr: string
} {
  // spawnSync with argv array — no shell, no injection.
  const result = spawnSync(
    'pnpm',
    ['exec', 'tsx', 'scripts/migrate-content.ts', ...args],
    {
      cwd: repoAppRoot,
      encoding: 'utf-8'
    }
  )
  return {
    exitCode: result.status ?? -1,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? ''
  }
}

describe('SCHEMA-06: codemod harness skeleton', () => {
  it('--list enumerates 000-noop', () => {
    const result = runMigrate('--list')
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toContain('000-noop')
  })

  it('--dry-run 000-noop reports filesChanged: 0', () => {
    const result = runMigrate('--dry-run', '000-noop')
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toContain('filesChanged: 0')
  })

  it('--dry-run with unknown migration exits non-zero', () => {
    const result = runMigrate('--dry-run', 'does-not-exist')
    expect(result.exitCode).not.toBe(0)
    expect(result.stderr.toLowerCase()).toContain('not found')
  })
})
