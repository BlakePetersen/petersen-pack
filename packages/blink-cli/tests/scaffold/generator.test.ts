// ABOUTME: Tests for scaffold templates and generator module.
// ABOUTME: Validates body templates, voice stubs, artifact generation, dry-run, and force behavior.
import {
  mkdtempSync,
  writeFileSync,
  readFileSync,
  existsSync,
  mkdirSync,
  rmSync
} from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { getBodyTemplate } from '@/scaffold/templates'
import { generateScaffold } from '@/scaffold/generator'

describe('getBodyTemplate', () => {
  it('returns string containing ## Overview, ## Usage, ## Configuration for skills', () => {
    const body = getBodyTemplate('skills')
    expect(body).toContain('## Overview')
    expect(body).toContain('## Usage')
    expect(body).toContain('## Configuration')
  })

  it('returns string containing ## Installation, ## Options, ## Customization for configs', () => {
    const body = getBodyTemplate('configs')
    expect(body).toContain('## Installation')
    expect(body).toContain('## Options')
    expect(body).toContain('## Customization')
  })

  it('returns string containing ## When to Use, ## Setup, ## API for hooks', () => {
    const body = getBodyTemplate('hooks')
    expect(body).toContain('## When to Use')
    expect(body).toContain('## Setup')
    expect(body).toContain('## API')
  })

  it('returns string containing ## Prerequisites, ## Steps, ## Troubleshooting for guides', () => {
    const body = getBodyTemplate('guides')
    expect(body).toContain('## Prerequisites')
    expect(body).toContain('## Steps')
    expect(body).toContain('## Troubleshooting')
  })

  it('includes AuthorNote import and stub when voice includes author-note', () => {
    const body = getBodyTemplate('skills', ['author-note'])
    expect(body).toContain("import { AuthorNote } from 'artax-ui'")
    expect(body).toContain('<AuthorNote>')
  })

  it('includes DecisionRationale import and stub when voice includes decision-rationale', () => {
    const body = getBodyTemplate('skills', ['decision-rationale'])
    expect(body).toContain("import { DecisionRationale } from 'artax-ui'")
    expect(body).toContain('<DecisionRationale>')
  })
})

describe('generateScaffold', () => {
  let contentRoot: string

  beforeEach(() => {
    contentRoot = mkdtempSync(join(tmpdir(), 'blink-scaffold-'))
  })

  afterEach(() => {
    rmSync(contentRoot, { recursive: true, force: true })
  })

  it('creates both .mdx and .artifact.md for skill', async () => {
    const result = await generateScaffold({
      collection: 'skill',
      slug: 'test-skill',
      contentRoot,
      dryRun: false,
      force: false
    })

    expect(result.files).toHaveLength(2)
    const mdxFile = result.files.find(f => f.path.endsWith('.mdx'))
    const artifactFile = result.files.find(f => f.path.endsWith('.artifact.md'))
    expect(mdxFile).toBeDefined()
    expect(artifactFile).toBeDefined()
    expect(mdxFile!.written).toBe(true)
    expect(artifactFile!.written).toBe(true)
    expect(existsSync(mdxFile!.path)).toBe(true)
    expect(existsSync(artifactFile!.path)).toBe(true)
  })

  it('creates only .mdx for guide (no .artifact.md)', async () => {
    const result = await generateScaffold({
      collection: 'guide',
      slug: 'test-guide',
      contentRoot,
      dryRun: false,
      force: false
    })

    expect(result.files).toHaveLength(1)
    expect(result.files[0].path).toMatch(/\.mdx$/)
    expect(result.files[0].written).toBe(true)
  })

  it('pre-populates artifact frontmatter with name, description, type from MDX', async () => {
    const result = await generateScaffold({
      collection: 'config',
      slug: 'my-config',
      contentRoot,
      dryRun: false,
      force: false
    })

    const artifactFile = result.files.find(f => f.path.endsWith('.artifact.md'))
    expect(artifactFile).toBeDefined()
    const content = readFileSync(artifactFile!.path, 'utf8')
    expect(content).toContain('name: My Config')
    expect(content).toContain('type: config')
  })

  it('respects --dry-run (no files written, returns file plans)', async () => {
    const result = await generateScaffold({
      collection: 'skill',
      slug: 'dry-test',
      contentRoot,
      dryRun: true,
      force: false
    })

    expect(result.files.length).toBeGreaterThan(0)
    for (const file of result.files) {
      expect(file.written).toBe(false)
      expect(existsSync(file.path)).toBe(false)
    }
  })

  it('respects --force (overwrites existing files)', async () => {
    const skillsDir = join(contentRoot, 'skills')
    mkdirSync(skillsDir, { recursive: true })
    writeFileSync(join(skillsDir, 'existing.mdx'), 'old content')

    const result = await generateScaffold({
      collection: 'skill',
      slug: 'existing',
      contentRoot,
      dryRun: false,
      force: true
    })

    expect(result.files[0].written).toBe(true)
    const content = readFileSync(join(skillsDir, 'existing.mdx'), 'utf8')
    expect(content).not.toBe('old content')
  })

  it('throws when target files exist without --force', async () => {
    const skillsDir = join(contentRoot, 'skills')
    mkdirSync(skillsDir, { recursive: true })
    writeFileSync(join(skillsDir, 'existing.mdx'), 'old content')

    await expect(
      generateScaffold({
        collection: 'skill',
        slug: 'existing',
        contentRoot,
        dryRun: false,
        force: false
      })
    ).rejects.toThrow()
  })
})
