// ABOUTME: Tests for registry API response Zod schemas.
// ABOUTME: Validates registry index listings and individual registry item shapes.
import {
  RegistryItemSchema,
  RegistryIndexSchema,
  RegistryArtifactSchema,
} from '../src/index'

const validItem = {
  slug: 'eslint-config',
  name: 'ESLint Config',
  type: 'config' as const,
  version: '2026.03.14.1',
  description: 'Opinionated ESLint configuration',
}

const validIndex = {
  items: [validItem],
  generatedAt: '2026-03-14T12:00:00Z',
}

describe('RegistryItemSchema', () => {
  it('accepts a valid registry item', () => {
    expect(RegistryItemSchema.safeParse(validItem).success).toBe(true)
  })

  it('rejects missing description', () => {
    const { description: _, ...noDesc } = validItem
    expect(RegistryItemSchema.safeParse(noDesc).success).toBe(false)
  })

  it('rejects invalid slug', () => {
    expect(
      RegistryItemSchema.safeParse({ ...validItem, slug: 'BAD' }).success
    ).toBe(false)
  })

  it('rejects invalid type', () => {
    expect(
      RegistryItemSchema.safeParse({ ...validItem, type: 'widget' }).success
    ).toBe(false)
  })
})

describe('RegistryIndexSchema', () => {
  it('accepts a valid registry index', () => {
    expect(RegistryIndexSchema.safeParse(validIndex).success).toBe(true)
  })

  it('accepts empty items array', () => {
    expect(
      RegistryIndexSchema.safeParse({ items: [], generatedAt: '2026-03-14T12:00:00Z' })
        .success
    ).toBe(true)
  })

  it('rejects invalid datetime', () => {
    expect(
      RegistryIndexSchema.safeParse({ items: [], generatedAt: 'not-a-date' }).success
    ).toBe(false)
  })

  it('rejects missing generatedAt', () => {
    expect(
      RegistryIndexSchema.safeParse({ items: [] }).success
    ).toBe(false)
  })
})

describe('RegistryArtifactSchema', () => {
  it('accepts a full artifact (reuses ArtifactMetadataSchema)', () => {
    const fullArtifact = {
      slug: 'eslint-config',
      name: 'ESLint Config',
      type: 'config' as const,
      version: '2026.03.14.1',
      description: 'Opinionated ESLint configuration',
      files: [
        { path: 'eslint.config.mjs', content: 'export default {}', merge: 'replace' as const },
      ],
    }
    expect(RegistryArtifactSchema.safeParse(fullArtifact).success).toBe(true)
  })

  it('rejects missing files field', () => {
    expect(
      RegistryArtifactSchema.safeParse(validItem).success
    ).toBe(false)
  })
})
