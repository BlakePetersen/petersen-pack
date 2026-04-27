// ABOUTME: Phase 27 SCHEMA-05 — proves the velite ↔ blink-registry import is wired.
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
  const veliteConfig = fs.readFileSync(
    path.resolve(__dirname, '..', 'velite.config.ts'),
    'utf-8',
  )

  it('removes the inline slugPattern, calverPattern, validTypes, validMerges declarations', () => {
    expect(veliteConfig).not.toMatch(/slugPattern\s*=/)
    expect(veliteConfig).not.toMatch(/calverPattern\s*=/)
    expect(veliteConfig).not.toMatch(/validTypes\s*=/)
    expect(veliteConfig).not.toMatch(/validMerges\s*=/)
  })

  it("imports the four schemas from 'blink-registry'", () => {
    expect(veliteConfig).toMatch(/from\s+['"]blink-registry['"]/)
    expect(veliteConfig).toMatch(/SlugSchema/)
    expect(veliteConfig).toMatch(/CalVerSchema/)
    expect(veliteConfig).toMatch(/ArtifactTypeSchema/)
    expect(veliteConfig).toMatch(/MergeStrategySchema/)
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
