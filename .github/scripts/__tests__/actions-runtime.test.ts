// ABOUTME: Guards that the @actions packages can actually load under CJS.
// ABOUTME: jest mocks them, so nothing else here would notice an ESM-only bump.

import { readFileSync } from 'node:fs'

// jest.config.ts maps `@actions/core` and `@actions/github` to __mocks__, so the
// real packages are never loaded by any other test. That hid a live outage:
// @actions/core@3 and @actions/github@9 publish an exports map with only an
// `import` condition, and tsx runs these scripts as CJS — so both entry points
// died at `require()` with ERR_PACKAGE_PATH_NOT_EXPORTED before reaching main().
// The mapper is exact-match, so the `/package.json` subpath resolves for real.
describe.each(['@actions/core', '@actions/github'])('%s', pkg => {
  it('exposes a CommonJS entry point', () => {
    const manifest = JSON.parse(
      readFileSync(require.resolve(`${pkg}/package.json`), 'utf-8')
    )

    const exportsMap = manifest.exports?.['.']
    const hasCjsEntry =
      Boolean(manifest.main) &&
      (exportsMap === undefined ||
        typeof exportsMap === 'string' ||
        'require' in exportsMap ||
        'default' in exportsMap)

    expect(hasCjsEntry).toBe(true)
  })
})
