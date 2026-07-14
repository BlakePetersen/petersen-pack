// ABOUTME: Proves the velite ↔ blink-registry import is wired.
// ABOUTME: Combines a grep-based regression check with a Zod-shape sanity check.

import fs from 'node:fs'
import path from 'node:path'
import {
  SlugSchema,
  CalVerSchema,
  ArtifactTypeSchema,
  MergeStrategySchema,
} from 'blink-registry'

describe('SCHEMA-05: blink-registry direct import', () => {
  // The Velite pipeline split into velite.config.ts (collections) and
  // src/lib/velite-prepare.ts (build-time validation). Schema imports live
  // wherever they're consumed; concatenate both for the regression check.
  const pipelineSource =
    fs.readFileSync(path.resolve(__dirname, '..', 'velite.config.ts'), 'utf-8') +
    '\n' +
    fs.readFileSync(
      path.resolve(__dirname, '..', 'src', 'lib', 'velite-prepare.ts'),
      'utf-8',
    )

  it('removes the inline slugPattern, calverPattern, validTypes, validMerges declarations', () => {
    expect(pipelineSource).not.toMatch(/slugPattern\s*=/)
    expect(pipelineSource).not.toMatch(/calverPattern\s*=/)
    expect(pipelineSource).not.toMatch(/validTypes\s*=/)
    expect(pipelineSource).not.toMatch(/validMerges\s*=/)
  })

  it("imports the four schemas from 'blink-registry'", () => {
    expect(pipelineSource).toMatch(/from\s+['"]blink-registry['"]/)
    expect(pipelineSource).toMatch(/SlugSchema/)
    expect(pipelineSource).toMatch(/CalVerSchema/)
    expect(pipelineSource).toMatch(/ArtifactTypeSchema/)
    expect(pipelineSource).toMatch(/MergeStrategySchema/)
  })

  it('imported SlugSchema accepts valid slugs and rejects invalid', () => {
    expect(SlugSchema.safeParse('valid-slug').success).toBe(true)
    expect(SlugSchema.safeParse('valid').success).toBe(true)
    expect(SlugSchema.safeParse('Invalid Slug').success).toBe(false)
    expect(SlugSchema.safeParse('UPPER').success).toBe(false)
  })

  it('imported ArtifactTypeSchema accepts the four types and rejects others', () => {
    for (const t of ['config', 'skill', 'hook', 'guide']) {
      expect(ArtifactTypeSchema.safeParse(t).success).toBe(true)
    }
    expect(ArtifactTypeSchema.safeParse('not-a-type').success).toBe(false)
  })

  it('imported CalVerSchema accepts YYYY.MM.DD.N and rejects malformed', () => {
    expect(CalVerSchema.safeParse('2026.04.25.0').success).toBe(true)
    expect(CalVerSchema.safeParse('2026-04-25').success).toBe(false)
  })

  it('imported MergeStrategySchema accepts replace and section', () => {
    expect(MergeStrategySchema.safeParse('replace').success).toBe(true)
    expect(MergeStrategySchema.safeParse('section').success).toBe(true)
    expect(MergeStrategySchema.safeParse('overwrite').success).toBe(false)
  })
})
