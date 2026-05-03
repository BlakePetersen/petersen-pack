// ABOUTME: Tests for the artifact-pair lint rule (LINT-02).
// ABOUTME: Validates requires_artifact sync and orphan .artifact.md detection.
import { mkdtempSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { artifactPairRule } from '@/lint/rules/artifact-pair'
import type { LintContext } from '@/lint/types'

function makeTmpDir(): string {
  return mkdtempSync(join(tmpdir(), 'blink-lint-'))
}

function makeContext(
  file: string,
  frontmatter: Record<string, unknown>,
  contentRoot: string,
): LintContext {
  return {
    file,
    frontmatter,
    body: '## Overview\n\nContent here.',
    contentRoot,
  }
}

describe('artifactPairRule', () => {
  it('no diagnostic when requires_artifact=true and sibling .artifact.md exists', () => {
    const dir = makeTmpDir()
    const mdxPath = join(dir, 'test-skill.mdx')
    const artifactPath = join(dir, 'test-skill.artifact.md')
    writeFileSync(mdxPath, '---\ntitle: Test\n---\n')
    writeFileSync(artifactPath, '# Artifact content')

    const ctx = makeContext(mdxPath, { requires_artifact: true }, dir)
    const diagnostics = artifactPairRule.check(ctx)
    expect(diagnostics).toEqual([])
  })

  it('error diagnostic when requires_artifact=true but sibling .artifact.md is missing', () => {
    const dir = makeTmpDir()
    const mdxPath = join(dir, 'test-skill.mdx')
    writeFileSync(mdxPath, '---\ntitle: Test\n---\n')

    const ctx = makeContext(mdxPath, { requires_artifact: true }, dir)
    const diagnostics = artifactPairRule.check(ctx)
    expect(diagnostics.length).toBe(1)
    expect(diagnostics[0].severity).toBe('error')
    expect(diagnostics[0].message).toContain('.artifact.md')
  })

  it('no diagnostic when requires_artifact=false regardless of artifact existence', () => {
    const dir = makeTmpDir()
    const mdxPath = join(dir, 'test-skill.mdx')
    const artifactPath = join(dir, 'test-skill.artifact.md')
    writeFileSync(mdxPath, '---\ntitle: Test\n---\n')
    writeFileSync(artifactPath, '# Artifact content')

    const ctx = makeContext(mdxPath, { requires_artifact: false }, dir)
    const diagnostics = artifactPairRule.check(ctx)
    expect(diagnostics).toEqual([])
  })

  it('warning diagnostic for orphan .artifact.md with no sibling .mdx file', () => {
    const dir = makeTmpDir()
    const artifactPath = join(dir, 'orphan.artifact.md')
    writeFileSync(artifactPath, '# Orphan artifact')

    const diagnostics = artifactPairRule.checkOrphans(dir)
    expect(diagnostics.length).toBe(1)
    expect(diagnostics[0].severity).toBe('warning')
    expect(diagnostics[0].message).toContain('orphan')
  })

  it('warning for .artifact.md where sibling .mdx has requires_artifact=false', () => {
    const dir = makeTmpDir()
    const mdxPath = join(dir, 'test-config.mdx')
    const artifactPath = join(dir, 'test-config.artifact.md')
    writeFileSync(mdxPath, '---\ntitle: Test\nrequires_artifact: false\n---\n')
    writeFileSync(artifactPath, '# Artifact')

    const diagnostics = artifactPairRule.checkOrphans(dir)
    expect(diagnostics.length).toBe(1)
    expect(diagnostics[0].severity).toBe('warning')
    expect(diagnostics[0].message).toContain('requires_artifact')
  })

  it('no diagnostic for multi-file .artifact/ directory', () => {
    const dir = makeTmpDir()
    const mdxPath = join(dir, 'test-skill.mdx')
    const artifactDir = join(dir, 'test-skill.artifact')
    writeFileSync(mdxPath, '---\ntitle: Test\n---\n')
    mkdirSync(artifactDir)
    writeFileSync(join(artifactDir, 'index.ts'), '// artifact')

    const ctx = makeContext(mdxPath, { requires_artifact: true }, dir)
    // .artifact/ directory counts as having an artifact
    const diagnostics = artifactPairRule.check(ctx)
    expect(diagnostics).toEqual([])
  })

  it('fix mode returns signal to generate stub .artifact.md when missing', () => {
    const dir = makeTmpDir()
    const mdxPath = join(dir, 'my-config.mdx')
    writeFileSync(mdxPath, '---\ntitle: My Config\n---\n')

    const ctx = makeContext(mdxPath, {
      requires_artifact: true,
      title: 'My Config',
      description: 'A config artifact.',
    }, dir)
    const result = artifactPairRule.fix!(ctx)
    expect(result).not.toBeNull()
    expect(result!.body).toBeDefined()
    expect(result!.body).toContain('My Config')
  })
})
