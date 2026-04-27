// ABOUTME: Phase 27 SCHEMA-08 — three-step CalVer behavior test.
// ABOUTME: Capture baseline; edit frontmatter only (no body change); edit body. Asserts version stability across edits 1-2 and version change across edits 2-3.

import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const repoAppRoot = path.resolve(__dirname, '..')

function runVelite(): { exitCode: number; combined: string } {
  // spawnSync with argv array — no shell interpolation, no injection surface.
  const result = spawnSync('pnpm', ['exec', 'velite', 'build'], {
    cwd: repoAppRoot,
    encoding: 'utf-8',
    env: { ...process.env, NODE_ENV: 'test' },
  })
  return {
    exitCode: result.status ?? -1,
    combined: (result.stdout ?? '') + '\n' + (result.stderr ?? ''),
  }
}

function readManifest(): Record<string, { hash: string; version: string }> {
  return JSON.parse(
    fs.readFileSync(
      path.join(repoAppRoot, 'content', '.artifact-versions.json'),
      'utf-8',
    ),
  )
}

describe('SCHEMA-08: hash gate gates CalVer on payload changes', () => {
  // Real single-file artifact: content/configs/eslint-flat-config.artifact.md.
  // After deriveArtifactSlug strips '.artifact' and the directory, the manifest
  // slug is the bare filename: 'eslint-flat-config'.
  const SLUG_TO_TEST = 'eslint-flat-config'
  const ARTIFACT_FILE = 'content/configs/eslint-flat-config.artifact.md'

  it(
    'reuses version on prose-only frontmatter edit, advances on body edit',
    () => {
      const filePath = path.join(repoAppRoot, ARTIFACT_FILE)
      const original = fs.readFileSync(filePath, 'utf-8')
      try {
        // Step 1: baseline build
        expect(runVelite().exitCode).toBe(0)
        const v1 = readManifest()[SLUG_TO_TEST]
        expect(v1).toBeDefined()

        // Step 2: edit frontmatter description only (NOT the body), rebuild, expect same version
        const withFmEdit = original.replace(
          /^description:.*$/m,
          (line) => line + ' (frontmatter touched ' + Date.now() + ')',
        )
        if (withFmEdit === original) {
          throw new Error('Test setup: could not locate description: in frontmatter')
        }
        fs.writeFileSync(filePath, withFmEdit)
        expect(runVelite().exitCode).toBe(0)
        const v2 = readManifest()[SLUG_TO_TEST]
        expect(v2.hash).toBe(v1.hash)
        expect(v2.version).toBe(v1.version)

        // Step 3: edit the body (append a sentence after the frontmatter close), rebuild, expect new hash
        const withBodyEdit = withFmEdit.replace(
          /^---\s*$([\s\S]*?)^---\s*$/m,
          (full) => full + '\n\nProse edit ' + Date.now() + '.\n',
        )
        if (withBodyEdit === withFmEdit) {
          throw new Error('Test setup: could not append body content past frontmatter close')
        }
        fs.writeFileSync(filePath, withBodyEdit)
        expect(runVelite().exitCode).toBe(0)
        const v3 = readManifest()[SLUG_TO_TEST]
        expect(v3.hash).not.toBe(v1.hash)
      } finally {
        // Always restore the file to its original contents
        fs.writeFileSync(filePath, original)
        // Rebuild so the manifest re-stabilizes against the unedited content
        runVelite()
      }
    },
    120_000, // 2 min budget — runs four velite builds (baseline + edit1 + edit2 + cleanup)
  )
})
