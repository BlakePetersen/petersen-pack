// ABOUTME: Tests for primitive Zod schemas (artifact types, slugs, calver, merge strategies, scopes).
// ABOUTME: Validates both acceptance of valid data and rejection of invalid data.
import {
  ArtifactTypeSchema,
  SlugSchema,
  CalVerSchema,
  MergeStrategySchema,
  ScopeSchema,
} from '../src/index'

describe('ArtifactTypeSchema', () => {
  it.each(['config', 'skill', 'hook', 'guide'])('accepts "%s"', (value) => {
    expect(ArtifactTypeSchema.safeParse(value).success).toBe(true)
  })

  it.each(['unknown', 'plugin', '', 'Config'])('rejects "%s"', (value) => {
    expect(ArtifactTypeSchema.safeParse(value).success).toBe(false)
  })
})

describe('SlugSchema', () => {
  it.each(['eslint-config', 'prettier', 'my-hook-v2', 'a', 'a1b2'])(
    'accepts "%s"',
    (value) => {
      expect(SlugSchema.safeParse(value).success).toBe(true)
    }
  )

  it.each(['UPPERCASE', '', 'has spaces', 'trailing-', '-leading', 'has--double'])(
    'rejects "%s"',
    (value) => {
      expect(SlugSchema.safeParse(value).success).toBe(false)
    }
  )
})

describe('CalVerSchema', () => {
  it.each(['2026.03.14.1', '2026.01.01.0', '2026.12.31.99'])(
    'accepts "%s"',
    (value) => {
      expect(CalVerSchema.safeParse(value).success).toBe(true)
    }
  )

  it.each(['2026.3.14.1', '2026-03-14-1', '2026.03.14', 'v2026.03.14.1', ''])(
    'rejects "%s"',
    (value) => {
      expect(CalVerSchema.safeParse(value).success).toBe(false)
    }
  )
})

describe('MergeStrategySchema', () => {
  it.each(['replace', 'section'])('accepts "%s"', (value) => {
    expect(MergeStrategySchema.safeParse(value).success).toBe(true)
  })

  it.each(['merge', 'append', ''])('rejects "%s"', (value) => {
    expect(MergeStrategySchema.safeParse(value).success).toBe(false)
  })
})

describe('ScopeSchema', () => {
  it.each(['project', 'global'])('accepts "%s"', (value) => {
    expect(ScopeSchema.safeParse(value).success).toBe(true)
  })

  it.each(['local', 'user', ''])('rejects "%s"', (value) => {
    expect(ScopeSchema.safeParse(value).success).toBe(false)
  })
})
