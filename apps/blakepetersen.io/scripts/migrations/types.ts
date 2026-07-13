// ABOUTME: Shared migration-harness contract — the one declaration of Migration + MigrationResult.
// ABOUTME: run() signature intentionally unchanged (run(opts) deferred until Migration #001 lands).
export interface MigrationResult {
  filesChanged: number
}

export interface Migration {
  name: string
  description: string
  run(contentRoot: string): Promise<MigrationResult>
}
