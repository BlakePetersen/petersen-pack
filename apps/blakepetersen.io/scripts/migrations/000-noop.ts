// ABOUTME: Phase 27 SCHEMA-06 stub migration — no-op placeholder validating harness wiring.
// ABOUTME: Real migrations replace this pattern: read contentRoot, transform files, return count.

interface MigrationResult {
  filesChanged: number
}

export default {
  name: '000-noop',
  description: 'No-op placeholder migration to validate harness wiring',
  async run(_contentRoot: string): Promise<MigrationResult> {
    return { filesChanged: 0 }
  }
}
