// ABOUTME: Three-step CalVer behavior test.
// ABOUTME: Capture baseline; edit frontmatter only (no body change); edit body. Asserts version stability across edits 1-2 and version change across edits 2-3.

import fs from 'node:fs'
import path from 'node:path'
import { fixtureDir, runVeliteFixture } from './lib/phase27-velite-runner'

const FIXTURE = fixtureDir('calver-hash-gate')
const ARTIFACT_PATH = path.join(
  FIXTURE,
  'content',
  'configs',
  'sample-config.artifact.md'
)
const MANIFEST_PATH = path.join(FIXTURE, 'content', '.artifact-versions.json')
const SLUG = 'sample-config'

// Embedded baseline — the test resets the fixture file from this string at start
// and end so that an interrupted run (SIGINT, OOM, jest worker crash) cannot leave
// either the artifact source or the fixture's manifest in a mutated state.
const ARTIFACT_BASELINE = `---
name: Sample Config
description: Fixture artifact for hash-gate behavior testing
type: config
merge: section
destination: sample.config.js
---

const config = { sample: true }
export default config
`

function readManifest(): Record<string, { hash: string; version: string }> {
  return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'))
}

function resetFixture(): void {
  fs.writeFileSync(ARTIFACT_PATH, ARTIFACT_BASELINE)
  // Drop the fixture-generated manifest so the next velite run derives a fresh
  // CalVer rather than locking onto a stale prior-run hash entry.
  if (fs.existsSync(MANIFEST_PATH)) fs.unlinkSync(MANIFEST_PATH)
}

describe('SCHEMA-08: hash gate gates CalVer on payload changes', () => {
  beforeEach(resetFixture)
  afterEach(resetFixture)

  it('reuses version on prose-only frontmatter edit, advances on body edit', () => {
    // Step 1: baseline build
    expect(runVeliteFixture(FIXTURE).exitCode).toBe(0)
    const v1 = readManifest()[SLUG]
    expect(v1).toBeDefined()

    // Step 2: edit frontmatter description only (NOT the body), rebuild, expect same version
    const baseline = fs.readFileSync(ARTIFACT_PATH, 'utf-8')
    const withFmEdit = baseline.replace(
      /^description:.*$/m,
      line => line + ' (frontmatter touched ' + Date.now() + ')'
    )
    if (withFmEdit === baseline) {
      throw new Error(
        'Test setup: could not locate description: in fixture frontmatter'
      )
    }
    fs.writeFileSync(ARTIFACT_PATH, withFmEdit)
    expect(runVeliteFixture(FIXTURE).exitCode).toBe(0)
    const v2 = readManifest()[SLUG]
    expect(v2.hash).toBe(v1.hash)
    expect(v2.version).toBe(v1.version)

    // Step 3: edit the body (append a sentence after the frontmatter close), rebuild, expect new hash
    const withBodyEdit = withFmEdit.replace(
      /^---\s*$([\s\S]*?)^---\s*$/m,
      full => full + '\n\nProse edit ' + Date.now() + '.\n'
    )
    if (withBodyEdit === withFmEdit) {
      throw new Error(
        'Test setup: could not append body content past fixture frontmatter close'
      )
    }
    fs.writeFileSync(ARTIFACT_PATH, withBodyEdit)
    expect(runVeliteFixture(FIXTURE).exitCode).toBe(0)
    const v3 = readManifest()[SLUG]
    expect(v3.hash).not.toBe(v1.hash)
  }, 120_000) // 2 min budget — runs three velite builds against the fixture
})
