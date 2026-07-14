// ABOUTME: Shared test helper — runs Velite against a fixture config.
// ABOUTME: Returns exitCode + stdout + stderr for failure-path assertions.

import { spawnSync, type SpawnSyncReturns } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

export interface VeliteRunResult {
  exitCode: number
  stdout: string
  stderr: string
  combined: string
}

// Resolve velite binary from the app's node_modules. Direct binary invocation
// avoids pnpm workspace lookups when cwd is set to a fixture subtree.
function resolveVeliteBin(): string {
  const candidates = [
    path.resolve(__dirname, '..', '..', 'node_modules', '.bin', 'velite'),
    path.resolve(__dirname, '..', '..', '..', '..', 'node_modules', '.bin', 'velite'),
  ]
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate
  }
  throw new Error(
    `velite binary not found in expected locations: ${candidates.join(', ')}`,
  )
}

/**
 * Run `velite build` against a fixture config.
 * Uses spawnSync with argv array — no shell, no injection surface.
 * Invokes velite directly (bypassing pnpm exec) so cwd can be the fixture
 * directory, which is required for the fixture's `root: './content'` to
 * resolve to the fixture's content tree rather than the host app's.
 * Always passes `--strict` so schema failures surface as non-zero exit codes.
 * @param fixtureDirectory - absolute path to the fixture directory containing velite.fixture.config.ts
 */
export function runVeliteFixture(fixtureDirectory: string): VeliteRunResult {
  const configPath = path.join(fixtureDirectory, 'velite.fixture.config.ts')
  const veliteBin = resolveVeliteBin()
  const result: SpawnSyncReturns<string> = spawnSync(
    veliteBin,
    ['build', '--strict', '--config', configPath],
    {
      cwd: fixtureDirectory,
      encoding: 'utf-8',
      env: { ...process.env, NODE_ENV: 'test' },
    },
  )
  const stdout = result.stdout ?? ''
  const stderr = result.stderr ?? ''
  return {
    exitCode: result.status ?? -1,
    stdout,
    stderr,
    combined: stdout + '\n' + stderr,
  }
}

/** Convenience: resolve a fixture dir from the repo's apps/blakepetersen.io root. */
export function fixtureDir(scenario: string): string {
  return path.resolve(__dirname, '..', '..', 'test-fixtures', 'phase27', scenario)
}
