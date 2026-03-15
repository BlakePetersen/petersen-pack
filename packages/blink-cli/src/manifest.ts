// ABOUTME: Manifest manager for tracking installed blink artifacts.
// ABOUTME: Handles reading, writing, and creating .blink/manifest.json files.
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { createHash } from 'node:crypto'
import { ManifestSchema, type Manifest, type ManifestEntry } from 'blink-registry'

export const BLINK_DIR = '.blink'
const MANIFEST_FILE = 'manifest.json'

export async function readManifest(cwd: string): Promise<Manifest | null> {
  const filePath = join(cwd, BLINK_DIR, MANIFEST_FILE)

  let raw: string
  try {
    raw = await readFile(filePath, 'utf-8')
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null
    }
    throw error
  }

  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch {
    throw new Error('MANIFEST_CORRUPT: invalid JSON in manifest file')
  }

  const result = ManifestSchema.safeParse(data)
  if (!result.success) {
    throw new Error(`MANIFEST_CORRUPT: ${result.error.message}`)
  }

  return result.data
}

export async function writeManifest(
  cwd: string,
  manifest: Manifest
): Promise<void> {
  const dir = join(cwd, BLINK_DIR)
  await mkdir(dir, { recursive: true })
  await writeFile(
    join(dir, MANIFEST_FILE),
    JSON.stringify(manifest, null, 2) + '\n'
  )
}

export function createEmptyManifest(): Manifest {
  return { version: 1, items: [] }
}

export function addManifestEntry(
  manifest: Manifest,
  entry: ManifestEntry
): Manifest {
  return { ...manifest, items: [...manifest.items, entry] }
}

export function checksum(content: string): string {
  return createHash('sha256').update(content).digest('hex')
}
