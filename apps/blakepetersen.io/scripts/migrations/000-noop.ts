// ABOUTME: Stub migration — no-op placeholder validating harness wiring.
// ABOUTME: Real migrations replace this pattern: read contentRoot, transform files, return count.

import type { MigrationResult } from './types'

export default {
  name: '000-noop',
  description: 'No-op placeholder migration to validate harness wiring',
  async run(_contentRoot: string): Promise<MigrationResult> {
    return { filesChanged: 0 }
  }
}
