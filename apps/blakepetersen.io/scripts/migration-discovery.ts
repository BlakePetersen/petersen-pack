// ABOUTME: Migration file discovery seam for the codemod harness.
// ABOUTME: Separate module so the ordering guarantee is unit-testable without executing the harness.

import fs from 'node:fs'

// Discover migration files in ascending numeric-prefix order. Zero-padded
// 3-digit prefixes make lexicographic sort == numeric order.
export function discoverMigrationFiles(dir: string): string[] {
  return fs
    .readdirSync(dir)
    .filter(f => /^\d{3}-[a-z0-9-]+\.ts$/.test(f))
    .sort()
}
