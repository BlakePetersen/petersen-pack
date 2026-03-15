// ABOUTME: Scope resolution for project vs global file destinations.
// ABOUTME: Maps file paths to project root or home directory based on scope flag.
import { homedir } from 'node:os'
import { join } from 'node:path'

export function resolveDestination(
  filePath: string,
  scope: 'project' | 'global',
  cwd: string
): string {
  if (scope === 'global') {
    return join(homedir(), filePath)
  }
  return join(cwd, filePath)
}

export function resolveManifestRoot(
  scope: 'project' | 'global',
  cwd: string
): string {
  if (scope === 'global') {
    return homedir()
  }
  return cwd
}
