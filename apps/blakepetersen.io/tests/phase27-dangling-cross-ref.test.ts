// ABOUTME: Phase 27 SCHEMA-04 — broken cross-references fail the build with named refs.
// ABOUTME: Covers the failure path (dangling) and happy path (valid cross-collection ref).

import { runVeliteFixture, fixtureDir } from './lib/phase27-velite-runner'

describe('SCHEMA-04: cross-reference integrity', () => {
  it('rejects an MDX entry that references a non-existent slug', () => {
    const result = runVeliteFixture(fixtureDir('dangling-cross-ref'))

    expect(result.exitCode).not.toBe(0)
    // Error must name the offending ref string so the author can find it.
    expect(result.combined).toContain('configs/this-config-does-not-exist')
    // Error must mention the field that contained the broken ref.
    expect(result.combined).toContain('dependencies')
    // Error must use the accumulator-then-throw shape from D-04.
    expect(result.combined).toContain('Broken cross-references')
  })

  it('accepts cross-collection references when the target exists', () => {
    const result = runVeliteFixture(fixtureDir('valid-cross-ref'))

    expect(result.exitCode).toBe(0)
  })
})
