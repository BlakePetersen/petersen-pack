// ABOUTME: Verifies writeManifest goes through the atomic writer.
// ABOUTME: A plain writeFile can leave a truncated manifest (MANIFEST_CORRUPT) on crash.

const atomicWriteMock = jest.fn().mockResolvedValue(undefined)

jest.mock('@/writer', () => ({
  atomicWrite: (...args: unknown[]) => atomicWriteMock(...args),
}))

import { writeManifest, createEmptyManifest, BLINK_DIR } from '@/manifest'
import { join } from 'node:path'

describe('writeManifest atomicity', () => {
  it('writes the manifest through atomicWrite (temp-file + rename)', async () => {
    await writeManifest('/tmp/some-project', createEmptyManifest())

    expect(atomicWriteMock).toHaveBeenCalledTimes(1)
    const [destPath, content] = atomicWriteMock.mock.calls[0]
    expect(destPath).toBe(join('/tmp/some-project', BLINK_DIR, 'manifest.json'))
    expect(() => JSON.parse(content as string)).not.toThrow()
  })
})
