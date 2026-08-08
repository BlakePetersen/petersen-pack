// ABOUTME: Tests for the Obsidian port staging and commit workflow.
// ABOUTME: Covers stageEntry (transform+write) and commitEntry (move to content).

import {
  mkdtempSync,
  readFileSync,
  writeFileSync,
  rmSync,
  mkdirSync,
  existsSync
} from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { stageEntry, commitEntry, STAGING_DIR } from '@/port/staging'

let tmpDir: string

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), 'blink-port-staging-'))
})

afterEach(() => {
  rmSync(tmpDir, { recursive: true, force: true })
})

describe('stageEntry', () => {
  it('reads input file, applies transforms, writes to staging dir', async () => {
    const inputDir = join(tmpDir, 'vault')
    mkdirSync(inputDir)
    writeFileSync(
      join(inputDir, 'my-note.md'),
      [
        '---',
        'title: My Note',
        'tags: [typescript]',
        '---',
        '',
        '> [!note] A tip',
        '> Some insight',
        '',
        'Regular text.'
      ].join('\n')
    )

    const contentRoot = join(tmpDir, 'content')
    mkdirSync(contentRoot)

    const stagingPath = join(tmpDir, STAGING_DIR)

    const result = await stageEntry({
      inputDir,
      contentRoot,
      stagingDir: stagingPath
    })

    expect(result.staged).toHaveLength(1)
    expect(result.staged[0].slug).toBe('my-note')
    const stagedContent = readFileSync(result.staged[0].path, 'utf-8')
    expect(stagedContent).toContain('title: My Note')
    expect(stagedContent).toContain('<AuthorNote>')
  })

  it('writes correct MDX frontmatter with mapped keys and defaults', async () => {
    const inputDir = join(tmpDir, 'vault')
    mkdirSync(inputDir)
    writeFileSync(
      join(inputDir, 'test-note.md'),
      [
        '---',
        'title: Test',
        'description: A test note',
        '---',
        '',
        'Body.'
      ].join('\n')
    )

    const contentRoot = join(tmpDir, 'content')
    mkdirSync(contentRoot)
    const stagingPath = join(tmpDir, STAGING_DIR)

    const result = await stageEntry({
      inputDir,
      contentRoot,
      stagingDir: stagingPath
    })

    const stagedContent = readFileSync(result.staged[0].path, 'utf-8')
    expect(stagedContent).toContain('title: Test')
    expect(stagedContent).toContain('description: A test note')
    expect(stagedContent).toContain('draft: true')
  })

  it('appends unknown-keys comment block at top of MDX body', async () => {
    const inputDir = join(tmpDir, 'vault')
    mkdirSync(inputDir)
    writeFileSync(
      join(inputDir, 'custom.md'),
      [
        '---',
        'title: Custom',
        'custom_field: hello',
        '---',
        '',
        'Body content.'
      ].join('\n')
    )

    const contentRoot = join(tmpDir, 'content')
    mkdirSync(contentRoot)
    const stagingPath = join(tmpDir, STAGING_DIR)

    const result = await stageEntry({
      inputDir,
      contentRoot,
      stagingDir: stagingPath
    })

    const stagedContent = readFileSync(result.staged[0].path, 'utf-8')
    expect(stagedContent).toContain(
      '{/* Obsidian meta (review + delete): custom_field: hello */}'
    )
  })

  it('preserves original file name as the slug', async () => {
    const inputDir = join(tmpDir, 'vault')
    mkdirSync(inputDir)
    writeFileSync(
      join(inputDir, 'my-fancy-note.md'),
      ['---', 'title: Fancy', '---', '', 'Content.'].join('\n')
    )

    const contentRoot = join(tmpDir, 'content')
    mkdirSync(contentRoot)
    const stagingPath = join(tmpDir, STAGING_DIR)

    const result = await stageEntry({
      inputDir,
      contentRoot,
      stagingDir: stagingPath
    })

    expect(result.staged[0].slug).toBe('my-fancy-note')
    expect(result.staged[0].path).toContain('my-fancy-note.mdx')
  })
})

describe('commitEntry', () => {
  it('moves staged .mdx from staging dir to content/<collection>/<slug>.mdx', async () => {
    const stagingPath = join(tmpDir, STAGING_DIR)
    mkdirSync(stagingPath, { recursive: true })
    writeFileSync(
      join(stagingPath, 'my-skill.mdx'),
      '---\ntitle: Skill\n---\n\nBody.'
    )

    const contentRoot = join(tmpDir, 'content')
    mkdirSync(join(contentRoot, 'skills'), { recursive: true })

    await commitEntry({
      slug: 'my-skill',
      collection: 'skills',
      contentRoot,
      stagingDir: stagingPath
    })

    expect(existsSync(join(contentRoot, 'skills', 'my-skill.mdx'))).toBe(true)
    expect(existsSync(join(stagingPath, 'my-skill.mdx'))).toBe(false)
  })

  it('moves companion .artifact.md if present in staging', async () => {
    const stagingPath = join(tmpDir, STAGING_DIR)
    mkdirSync(stagingPath, { recursive: true })
    writeFileSync(
      join(stagingPath, 'my-skill.mdx'),
      '---\ntitle: Skill\n---\n\nBody.'
    )
    writeFileSync(
      join(stagingPath, 'my-skill.artifact.md'),
      '---\nname: my-skill\n---\n\nArtifact.'
    )

    const contentRoot = join(tmpDir, 'content')
    mkdirSync(join(contentRoot, 'skills'), { recursive: true })

    await commitEntry({
      slug: 'my-skill',
      collection: 'skills',
      contentRoot,
      stagingDir: stagingPath
    })

    expect(
      existsSync(join(contentRoot, 'skills', 'my-skill.artifact.md'))
    ).toBe(true)
    expect(existsSync(join(stagingPath, 'my-skill.artifact.md'))).toBe(false)
  })

  it('refuses to commit if target already exists', async () => {
    const stagingPath = join(tmpDir, STAGING_DIR)
    mkdirSync(stagingPath, { recursive: true })
    writeFileSync(
      join(stagingPath, 'existing.mdx'),
      '---\ntitle: Existing\n---\n\nBody.'
    )

    const contentRoot = join(tmpDir, 'content')
    mkdirSync(join(contentRoot, 'skills'), { recursive: true })
    writeFileSync(join(contentRoot, 'skills', 'existing.mdx'), 'already here')

    await expect(
      commitEntry({
        slug: 'existing',
        collection: 'skills',
        contentRoot,
        stagingDir: stagingPath
      })
    ).rejects.toThrow()
  })

  it('throws if slug not found in staging dir', async () => {
    const stagingPath = join(tmpDir, STAGING_DIR)
    mkdirSync(stagingPath, { recursive: true })

    const contentRoot = join(tmpDir, 'content')
    mkdirSync(join(contentRoot, 'skills'), { recursive: true })

    await expect(
      commitEntry({
        slug: 'nonexistent',
        collection: 'skills',
        contentRoot,
        stagingDir: stagingPath
      })
    ).rejects.toThrow()
  })
})
