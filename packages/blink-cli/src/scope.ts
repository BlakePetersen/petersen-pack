// ABOUTME: Scope resolution for project vs global file destinations.
// ABOUTME: Maps file paths to project root or home directory based on scope flag.
import { homedir } from 'node:os'
import { join } from 'node:path'
import type { Scope } from 'blink-registry'

export function resolveDestination(
  filePath: string,
  scope: Scope,
  cwd: string
): string {
  if (scope === 'global') {
    return join(homedir(), filePath)
  }
  return join(cwd, filePath)
}

export function resolveManifestRoot(scope: Scope, cwd: string): string {
  if (scope === 'global') {
    return homedir()
  }
  return cwd
}
