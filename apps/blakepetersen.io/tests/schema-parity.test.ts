// ABOUTME: SSOT-08 round-trip parity guarding the registry(Zod v4)↔Velite(Zod v3) schema seam.
// ABOUTME: Same fixtures run through registry safeParse and a real Velite build; catches updated_context drift.
import path from 'node:path'
import { DxFrontmatterSchema } from 'blink-registry'
import { runVeliteFixture } from './lib/phase27-velite-runner'

// Velite 0.3.x is ESM-only (type: module, sole ./dist/index.js export, no CJS
// build) and cannot be imported into the app's CJS ts-jest runtime. The Velite
// half of the parity check is therefore driven through a real `velite build`
// subprocess (the velite-runner) against fixture content validated by
// the SAME dxFields schema (velite.config.ts -> src/lib/velite-fields.ts). A
// build also exercises Velite's isodate throw-on-invalid-date as a clean
// non-zero exit, which an in-process safeParse would surface as a raw throw.
const parityFixture = (scenario: string) =>
  path.resolve(__dirname, '..', 'test-fixtures', 'phase31', scenario)

const base = {
  title: 'Parity Fixture',
  description: 'A frontmatter fixture exercised through both schemas',
  applies_to: ['claude-code'],
}

// [name, frontmatter, both-schemas-should-accept]. The Velite fixtures under
// test-fixtures/phase31/ carry the same frontmatter values.
const registryFixtures: [name: string, input: Record<string, unknown>, shouldPass: boolean][] = [
  ['valid baseline', { ...base }, true],
  ['valid updated_context', { ...base, updated_context: '2026-07-01' }, true],
  ['malformed updated_context', { ...base, updated_context: 'last week' }, false],
  ['singular cross-ref prefix', { ...base, dependencies: ['skill/foo'] }, false],
  ['valid cross-ref', { ...base, dependencies: ['skills/foo-bar'] }, true],
  ['unknown voice value', { ...base, voice: ['bogus'] }, false],
]

describe('registry ↔ Velite schema parity (SSOT-08)', () => {
  // Registry half (Zod v4): field-level validation on the in-memory fixtures.
  describe('registry DxFrontmatterSchema (Zod v4)', () => {
    test.each(registryFixtures)('%s → accepts=%s', (_name, input, shouldPass) => {
      expect(DxFrontmatterSchema.safeParse(input).success).toBe(shouldPass)
    })
  })

  // Velite half (Zod v3): the same frontmatter driven through a real Velite
  // build. Should-pass cases are batched into one build; each should-fail case
  // is its own build so the failing field is isolated.
  describe('Velite build (Zod v3), same fixtures', () => {
    it('accepts baseline + ISO updated_context + resolvable cross-ref in one build', () => {
      const result = runVeliteFixture(parityFixture('schema-parity-valid'))
      expect(result.exitCode).toBe(0)
    })

    it('rejects malformed updated_context "last week" (the drift SSOT-08 guards)', () => {
      const result = runVeliteFixture(parityFixture('schema-parity-bad-updated-context'))
      expect(result.exitCode).not.toBe(0)
      // Velite's s.isodate() rejects the non-ISO value; the registry's z.iso.date()
      // rejects the same string (registry half above) — the seam agrees.
      expect(result.combined.toLowerCase()).toMatch(/invalid time value|invalid date/)
    })

    it('rejects singular cross-ref prefix "skill/foo"', () => {
      const result = runVeliteFixture(parityFixture('schema-parity-singular-cross-ref'))
      expect(result.exitCode).not.toBe(0)
      // CrossRefSchema is rebuilt from crossRefRegex(DX_COLLECTIONS).
      expect(result.combined).toContain("must be '<collection>/<slug-path>'")
      expect(result.combined).toContain('dependencies')
    })

    it('rejects unknown voice value "bogus"', () => {
      const result = runVeliteFixture(parityFixture('schema-parity-unknown-voice'))
      expect(result.exitCode).not.toBe(0)
      // voice enum is rebuilt from VOICE_PRIMITIVES.
      expect(result.combined.toLowerCase()).toMatch(/voice/)
      expect(result.combined).toContain('bogus')
    })
  })
})
