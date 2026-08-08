// ABOUTME: Tests for the lint runner — collection dispatch, discovery, and rule severity.
// ABOUTME: Guards the CI-gate contract: DX collections lint, posts don't, silence is never green.

import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { runLint } from '@/lint/runner'

const VALID_DX_FRONTMATTER = `---
title: Test Skill
description: A test skill entry
applies_to:
  - typescript
---

Some body content.
`

const POST_FRONTMATTER = `---
title: A blog post
date: 2026-01-01
summary: Posts use a different schema entirely
---

Blog prose.
`

let root: string

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'blink-lint-'))
})

afterEach(() => {
  rmSync(root, { recursive: true, force: true })
})

function write(rel: string, content: string): string {
  const full = join(root, rel)
  mkdirSync(join(full, '..'), { recursive: true })
  writeFileSync(full, content, 'utf-8')
  return full
}

describe('collection dispatch', () => {
  it('does not lint files outside DX collections (posts get their own schema elsewhere)', async () => {
    write('skills/good.mdx', VALID_DX_FRONTMATTER)
    write('posts/blog-entry.mdx', POST_FRONTMATTER)

    const result = await runLint({ contentRoot: root })

    const postDiagnostics = result.diagnostics.filter(d =>
      d.file.includes('posts/')
    )
    expect(postDiagnostics).toEqual([])
    expect(result.errorCount).toBe(0)
  })

  it('still validates DX collection files against the DX schema', async () => {
    write(
      'skills/bad.mdx',
      `---\ntitle: Missing everything else\n---\n\nBody.\n`
    )

    const result = await runLint({ contentRoot: root })

    expect(result.errorCount).toBeGreaterThan(0)
    expect(result.diagnostics.some(d => d.rule === 'frontmatter-schema')).toBe(
      true
    )
  })

  it('filters --files input to DX-collection .mdx entries', async () => {
    const post = write('posts/blog-entry.mdx', POST_FRONTMATTER)
    const artifact = write('skills/good.artifact.md', 'body payload')
    const skill = write(
      'skills/bad.mdx',
      `---\ntitle: Missing fields\n---\n\nBody.\n`
    )

    const result = await runLint({
      contentRoot: root,
      files: [post, artifact, skill]
    })

    expect(result.diagnostics.every(d => d.file === skill)).toBe(true)
    expect(result.errorCount).toBeGreaterThan(0)
  })
})

describe('discovery safety', () => {
  it('errors loudly when the content root does not exist', async () => {
    const result = await runLint({ contentRoot: join(root, 'nope') })

    expect(result.errorCount).toBeGreaterThan(0)
    expect(result.diagnostics.some(d => d.rule === 'content-root')).toBe(true)
  })

  it('errors loudly when the content root contains no lintable files', async () => {
    // An existing-but-empty root is the silent-no-op failure mode that let
    // the pre-commit gate rot — it must never produce a green run.
    const result = await runLint({ contentRoot: root })

    expect(result.errorCount).toBeGreaterThan(0)
    expect(result.diagnostics.some(d => d.rule === 'content-root')).toBe(true)
  })
})

describe('voice-primitive promotion (LINT-03)', () => {
  it('reports declared-but-uninvoked voice primitives as errors', async () => {
    write(
      'skills/voiced.mdx',
      `---
title: Voiced entry
description: Declares author-note but never invokes it
applies_to:
  - typescript
voice:
  - author-note
---

No component here.
`
    )

    const result = await runLint({ contentRoot: root })

    const voiceDiag = result.diagnostics.find(
      d => d.rule === 'voice-primitive' && d.message.includes('author-note')
    )
    expect(voiceDiag).toBeDefined()
    expect(voiceDiag?.severity).toBe('error')
  })

  it('keeps the rationale-shaped-heading advisory at warning severity', async () => {
    write(
      'skills/advisory.mdx',
      `---
title: Advisory entry
description: Has a rationale-looking heading, no voice declared
applies_to:
  - typescript
---

## Why I chose pnpm

Because reasons.
`
    )

    const result = await runLint({ contentRoot: root })

    const advisory = result.diagnostics.find(
      d => d.rule === 'voice-primitive' && d.message.includes('heading')
    )
    if (advisory) {
      expect(advisory.severity).toBe('warning')
    }
  })
})

describe('no-inline-artifact-body rule', () => {
  it('errors when an MDX body invokes <ArtifactBody> directly', async () => {
    write(
      'skills/inline.mdx',
      `---
title: Inline artifact body
description: Violates the Variant 3 invariant
applies_to:
  - typescript
---

<ArtifactBody slug="skills/inline" />
`
    )

    const result = await runLint({ contentRoot: root })

    const diag = result.diagnostics.find(
      d => d.rule === 'no-inline-artifact-body'
    )
    expect(diag).toBeDefined()
    expect(diag?.severity).toBe('error')
  })

  it('does not fire on entries that merely link to the install route', async () => {
    write(
      'skills/linked.mdx',
      `---
title: Linked entry
description: Uses the install route as intended
applies_to:
  - typescript
---

<a href="/install/skills/linked" target="_blank" rel="noopener">Install</a>
`
    )

    const result = await runLint({ contentRoot: root })

    expect(
      result.diagnostics.some(d => d.rule === 'no-inline-artifact-body')
    ).toBe(false)
  })
})
