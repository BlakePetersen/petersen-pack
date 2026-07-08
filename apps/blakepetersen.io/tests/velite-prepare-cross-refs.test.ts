// ABOUTME: Unit tests for validateCrossReferences extracted from the Velite prepare hook.
// ABOUTME: Covers the three failure modes (invalid format / unknown collection / missing target) and the happy path.

import {
  validateCrossReferences,
  type DxData,
  type DxItem,
} from '../src/lib/velite-prepare'

function makeDxItem(overrides: Partial<DxItem> & Pick<DxItem, 'slug' | 'title'>): DxItem {
  return {
    category: 'test',
    dependencies: [],
    related: [],
    ...overrides,
  }
}

function makeData(overrides: Partial<DxData> = {}): DxData {
  return {
    skills: [],
    hooks: [],
    configs: [],
    guides: [],
    posts: [],
    singleArtifacts: [],
    multiArtifacts: [],
    ...overrides,
  }
}

describe('validateCrossReferences', () => {
  it('passes when there are no cross-references', () => {
    expect(() => validateCrossReferences(makeData())).not.toThrow()
  })

  it('passes when every dependency points to an existing slug', () => {
    const data = makeData({
      skills: [
        makeDxItem({ slug: 'skills/a', title: 'A' }),
        makeDxItem({ slug: 'skills/b', title: 'B', dependencies: ['skills/a'] }),
      ],
    })
    expect(() => validateCrossReferences(data)).not.toThrow()
  })

  it('allows cross-collection references (D-02)', () => {
    const data = makeData({
      skills: [makeDxItem({ slug: 'skills/a', title: 'A', dependencies: ['configs/x'] })],
      configs: [makeDxItem({ slug: 'configs/x', title: 'X' })],
    })
    expect(() => validateCrossReferences(data)).not.toThrow()
  })

  it('rejects refs without a collection prefix (invalid format)', () => {
    const data = makeData({
      skills: [makeDxItem({ slug: 'skills/a', title: 'A', dependencies: ['just-a-slug'] })],
    })
    expect(() => validateCrossReferences(data)).toThrow(/invalid format/)
  })

  it('rejects refs targeting an unknown collection', () => {
    const data = makeData({
      skills: [makeDxItem({ slug: 'skills/a', title: 'A', related: ['posts/old-post'] })],
    })
    expect(() => validateCrossReferences(data)).toThrow(/unknown collection 'posts'/)
  })

  it('rejects refs targeting a known collection but missing slug', () => {
    const data = makeData({
      skills: [makeDxItem({ slug: 'skills/a', title: 'A', dependencies: ['skills/missing'] })],
    })
    expect(() => validateCrossReferences(data)).toThrow(/target not found in collection 'skills'/)
  })

  it('accumulates multiple broken refs in a single error (D-04)', () => {
    const data = makeData({
      skills: [
        makeDxItem({
          slug: 'skills/a',
          title: 'A',
          dependencies: ['skills/missing-1', 'configs/missing-2'],
        }),
        makeDxItem({ slug: 'skills/b', title: 'B', related: ['guides/missing-3'] }),
      ],
    })
    expect(() => validateCrossReferences(data)).toThrow(/Broken cross-references in content \(3\)/)
  })

  it('handles nested-slug refs against path-shaped slugs', () => {
    const data = makeData({
      skills: [
        makeDxItem({ slug: 'skills/claude-code/writing-custom-skills', title: 'Nested' }),
        makeDxItem({
          slug: 'skills/parent',
          title: 'Parent',
          dependencies: ['skills/claude-code/writing-custom-skills'],
        }),
      ],
    })
    expect(() => validateCrossReferences(data)).not.toThrow()
  })
})
