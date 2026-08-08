// ABOUTME: Tests for artifact metadata and file Zod schemas.
// ABOUTME: Validates complete artifact objects, required fields, and optional dependencies.
import { ArtifactFileSchema, ArtifactMetadataSchema } from '../src/index'

const validFile = {
  path: 'eslint.config.mjs',
  content: 'export default {}',
  merge: 'replace' as const
}

const validArtifact = {
  slug: 'eslint-config',
  name: 'ESLint Config',
  type: 'config' as const,
  version: '2026.03.14.1',
  description: 'Opinionated ESLint configuration',
  files: [validFile]
}

describe('ArtifactFileSchema', () => {
  it('accepts a valid file entry', () => {
    expect(ArtifactFileSchema.safeParse(validFile).success).toBe(true)
  })

  it('accepts section merge strategy', () => {
    expect(
      ArtifactFileSchema.safeParse({ ...validFile, merge: 'section' }).success
    ).toBe(true)
  })

  it('rejects missing path', () => {
    const { path: _, ...noPath } = validFile
    expect(ArtifactFileSchema.safeParse(noPath).success).toBe(false)
  })

  it('rejects invalid merge strategy', () => {
    expect(
      ArtifactFileSchema.safeParse({ ...validFile, merge: 'append' }).success
    ).toBe(false)
  })
})

describe('ArtifactMetadataSchema', () => {
  it('accepts a valid artifact', () => {
    expect(ArtifactMetadataSchema.safeParse(validArtifact).success).toBe(true)
  })

  it('accepts artifact with optional dependencies', () => {
    const withDeps = {
      ...validArtifact,
      dependencies: ['prettier-config'],
      devDependencies: { eslint: '^9.0.0' }
    }
    expect(ArtifactMetadataSchema.safeParse(withDeps).success).toBe(true)
  })

  it('accepts artifact without optional fields', () => {
    expect(ArtifactMetadataSchema.safeParse(validArtifact).success).toBe(true)
  })

  it('rejects missing required slug', () => {
    const { slug: _, ...noSlug } = validArtifact
    expect(ArtifactMetadataSchema.safeParse(noSlug).success).toBe(false)
  })

  it('rejects missing required name', () => {
    const { name: _, ...noName } = validArtifact
    expect(ArtifactMetadataSchema.safeParse(noName).success).toBe(false)
  })

  it('rejects invalid slug format', () => {
    expect(
      ArtifactMetadataSchema.safeParse({ ...validArtifact, slug: 'BAD SLUG' })
        .success
    ).toBe(false)
  })

  it('rejects invalid artifact type', () => {
    expect(
      ArtifactMetadataSchema.safeParse({ ...validArtifact, type: 'plugin' })
        .success
    ).toBe(false)
  })

  it('rejects invalid calver format', () => {
    expect(
      ArtifactMetadataSchema.safeParse({ ...validArtifact, version: '1.0.0' })
        .success
    ).toBe(false)
  })

  it('rejects empty files array is valid', () => {
    expect(
      ArtifactMetadataSchema.safeParse({ ...validArtifact, files: [] }).success
    ).toBe(true)
  })

  it('rejects invalid dependency slug', () => {
    expect(
      ArtifactMetadataSchema.safeParse({
        ...validArtifact,
        dependencies: ['BAD SLUG']
      }).success
    ).toBe(false)
  })
})
