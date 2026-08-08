// ABOUTME: Broken cross-references fail the build with named refs.
// ABOUTME: Covers the failure path (dangling) and happy path (valid cross-collection ref).

import { runVeliteFixture, fixtureDir } from './lib/phase27-velite-runner'

describe('SCHEMA-04: cross-reference integrity', () => {
  it('rejects an MDX entry that references a non-existent slug', () => {
    const result = runVeliteFixture(fixtureDir('dangling-cross-ref'))

    expect(result.exitCode).not.toBe(0)
    // A schema rejection is a clean non-zero exit. A null signal rules out the
    // build having been killed (OOM/SIGKILL), which would also be non-zero.
    expect(result.signal).toBeNull()
    // Error must name every offending ref string so the author can find them.
    expect(result.combined).toContain('configs/this-config-does-not-exist')
    expect(result.combined).toContain('hooks/this-hook-does-not-exist')
    // Error must mention the field that contained the broken ref.
    expect(result.combined).toContain('dependencies')
    // Error must use the accumulator-then-throw shape: the fixture carries two
    // broken refs, so a count of 2 proves every ref was collected rather than
    // the last one overwriting the first.
    expect(result.combined).toMatch(/Broken cross-references in content \(2\)/)
  })

  it('accepts cross-collection references when the target exists', () => {
    const result = runVeliteFixture(fixtureDir('valid-cross-ref'))

    expect(result.exitCode).toBe(0)
  })
})
