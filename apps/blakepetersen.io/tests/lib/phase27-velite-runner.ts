// ABOUTME: Phase 27 shared test helper — runs Velite against a fixture config.
// ABOUTME: Returns exitCode + stdout + stderr for failure-path assertions.

import { spawnSync, type SpawnSyncReturns } from 'node:child_process'
import path from 'node:path'

export interface VeliteRunResult {
  exitCode: number
  stdout: string
  stderr: string
  combined: string
}

/**
 * Run `velite build` against a fixture config.
 * Uses spawnSync with argv array — no shell, no injection surface.
 * @param fixtureDirectory - absolute path to the fixture directory containing velite.fixture.config.ts
 */
export function runVeliteFixture(fixtureDirectory: string): VeliteRunResult {
  const configPath = path.join(fixtureDirectory, 'velite.fixture.config.ts')
  const result: SpawnSyncReturns<string> = spawnSync(
    'pnpm',
    ['exec', 'velite', 'build', '--config', configPath],
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
