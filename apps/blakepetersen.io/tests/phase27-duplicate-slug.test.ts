// ABOUTME: Duplicate bare-slug across same collection fails the build.
// ABOUTME: Asserts both offending file paths are named in the error message.

import { runVeliteFixture, fixtureDir } from './lib/phase27-velite-runner'

describe('SCHEMA-03: duplicate slug fails per collection', () => {
  it('rejects two skills entries with the same bare-slug filename', () => {
    const result = runVeliteFixture(fixtureDir('duplicate-slug'))

    expect(result.exitCode).not.toBe(0)

    // The error must surface both file paths so the author can fix the conflict in one pass.
    expect(result.combined).toContain('skills/foo.mdx')
    expect(result.combined).toContain('skills/nested/foo.mdx')

    // The error mentions the duplicate slug value and the word "duplicate" (case-insensitive).
    expect(result.combined.toLowerCase()).toContain('duplicate')
    expect(result.combined).toContain("'foo'")
  })
})
