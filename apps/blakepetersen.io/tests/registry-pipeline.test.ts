// ABOUTME: Tests for registry pipeline correctness — nested-artifact URLs, duplicate
// ABOUTME: guards, manifest corruption handling, and posts cross-ref validation.

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createHash } from 'node:crypto'
import {
  versionAndValidateArtifacts,
  writeRegistryFiles,
  validateCrossReferences,
  type DxData
} from '../src/lib/velite-prepare'

function sha256Hex(payload: string): string {
  return createHash('sha256').update(payload).digest('hex')
}

function makeContentDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'registry-pipeline-test-'))
}

function emptyData(overrides: Partial<DxData> = {}): DxData {
  return {
    skills: [],
    hooks: [],
    configs: [],
    guides: [],
    posts: [],
    singleArtifacts: [],
    multiArtifacts: [],
    ...overrides
  }
}

function seedVersions(
  contentDir: string,
  entries: Array<{ slug: string; content: string; version: string }>
): void {
  const manifest = Object.fromEntries(
    entries.map(e => [
      e.slug,
      { hash: sha256Hex(e.content), version: e.version }
    ])
  )
  fs.writeFileSync(
    path.join(contentDir, '.artifact-versions.json'),
    JSON.stringify(manifest)
  )
}

function makeSingle(velitePath: string, body = 'body', destination = 'dest') {
  return {
    slug: velitePath,
    name: 'x',
    type: 'skill',
    description: 'd',
    destination,
    body,
    merge: 'replace' as const
  }
}

describe('nested artifact page paths (registry 404 fix)', () => {
  it('derives slug from the basename but keeps the full page path', () => {
    const contentDir = makeContentDir()
    seedVersions(contentDir, [
      {
        slug: 'writing-custom-skills',
        content: 'body',
        version: '2026.01.01.0'
      }
    ])
    const data = emptyData({
      singleArtifacts: [
        makeSingle('skills/claude-code/writing-custom-skills.artifact')
      ]
    })

    const [artifact] = versionAndValidateArtifacts(data, contentDir)
    expect(artifact.slug).toBe('writing-custom-skills')
    expect(artifact.pagePath).toBe('skills/claude-code/writing-custom-skills')
  })

  it('writes registry URLs from the page path, not the reconstructed type/slug', () => {
    const contentDir = makeContentDir()
    seedVersions(contentDir, [
      {
        slug: 'writing-custom-skills',
        content: 'body',
        version: '2026.01.01.0'
      }
    ])
    const data = emptyData({
      singleArtifacts: [
        makeSingle('skills/claude-code/writing-custom-skills.artifact')
      ]
    })
    const artifacts = versionAndValidateArtifacts(data, contentDir)

    const registryDir = fs.mkdtempSync(path.join(os.tmpdir(), 'registry-out-'))
    writeRegistryFiles(artifacts, registryDir)

    const index = JSON.parse(
      fs.readFileSync(path.join(registryDir, 'index.json'), 'utf-8')
    )
    expect(index.items[0].url).toBe(
      'https://blakepetersen.io/skills/claude-code/writing-custom-skills'
    )

    const detail = JSON.parse(
      fs.readFileSync(
        path.join(registryDir, 'skill', 'writing-custom-skills.json'),
        'utf-8'
      )
    )
    expect(detail.url).toBe(
      'https://blakepetersen.io/skills/claude-code/writing-custom-skills'
    )
    // pagePath is site-internal — not part of the published registry contract
    expect(detail.pagePath).toBeUndefined()
  })
})

describe('duplicate guards (Bug 012 class)', () => {
  it('throws when two artifacts derive the same slug', () => {
    const contentDir = makeContentDir()
    seedVersions(contentDir, [
      { slug: 'foo', content: 'body', version: '2026.01.01.0' }
    ])
    const data = emptyData({
      singleArtifacts: [
        makeSingle('skills/foo.artifact', 'body', 'dest-a'),
        makeSingle('skills/claude-code/foo.artifact', 'body', 'dest-b')
      ]
    })

    expect(() => versionAndValidateArtifacts(data, contentDir)).toThrow(
      /[Dd]uplicate artifact slug/
    )
  })

  it('throws when two artifacts declare the same replace-merge destination', () => {
    const contentDir = makeContentDir()
    seedVersions(contentDir, [
      { slug: 'foo', content: 'body', version: '2026.01.01.0' },
      { slug: 'bar', content: 'body', version: '2026.01.01.1' }
    ])
    const data = emptyData({
      singleArtifacts: [
        makeSingle('skills/foo.artifact', 'body', '.husky/pre-push'),
        makeSingle('skills/bar.artifact', 'body', '.husky/pre-push')
      ]
    })

    expect(() => versionAndValidateArtifacts(data, contentDir)).toThrow(
      /[Dd]uplicate.*destination/
    )
  })

  it('allows two artifacts to share a section-merge destination', () => {
    const contentDir = makeContentDir()
    seedVersions(contentDir, [
      { slug: 'foo', content: 'body', version: '2026.01.01.0' },
      { slug: 'bar', content: 'body', version: '2026.01.01.1' }
    ])
    const data = emptyData({
      singleArtifacts: [
        {
          ...makeSingle('skills/foo.artifact', 'body', '.zshrc'),
          merge: 'section' as const
        },
        {
          ...makeSingle('skills/bar.artifact', 'body', '.zshrc'),
          merge: 'section' as const
        }
      ]
    })

    expect(() => versionAndValidateArtifacts(data, contentDir)).not.toThrow()
  })
})

describe('version manifest corruption', () => {
  it('reports the manifest path and recovery step on unparseable JSON', () => {
    const contentDir = makeContentDir()
    fs.writeFileSync(
      path.join(contentDir, '.artifact-versions.json'),
      '{ "broken": '
    )
    const data = emptyData({
      singleArtifacts: [makeSingle('skills/foo.artifact')]
    })

    expect(() => versionAndValidateArtifacts(data, contentDir)).toThrow(
      /\.artifact-versions\.json.*delete/
    )
  })
})

describe('posts cross-reference validation', () => {
  it('fails the build when a post declares a dangling related ref', () => {
    const data = emptyData({
      skills: [
        {
          slug: 'skills/real-skill',
          title: 'Real',
          category: 'c',
          dependencies: [],
          related: []
        }
      ],
      posts: [
        {
          slug: 'posts/my-post',
          related: ['skills/does-not-exist']
        }
      ]
    })

    expect(() => validateCrossReferences(data)).toThrow(/does-not-exist/)
  })

  it('accepts post refs to existing DX entries and other posts', () => {
    const data = emptyData({
      skills: [
        {
          slug: 'skills/real-skill',
          title: 'Real',
          category: 'c',
          dependencies: [],
          related: []
        }
      ],
      posts: [
        { slug: 'posts/first', related: ['skills/real-skill', 'posts/second'] },
        { slug: 'posts/second', related: [] }
      ]
    })

    expect(() => validateCrossReferences(data)).not.toThrow()
  })
})
