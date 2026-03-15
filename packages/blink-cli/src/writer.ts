// ABOUTME: Atomic file writer using temp-file-then-rename pattern.
// ABOUTME: Prevents file corruption by ensuring writes are atomic with cleanup on failure.
import { writeFile, rename, unlink, mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'

export async function atomicWrite(
  destPath: string,
  content: string
): Promise<void> {
  await mkdir(dirname(destPath), { recursive: true })

  const tmpPath = `${destPath}.blink-tmp-${process.pid}`
  try {
    await writeFile(tmpPath, content)
    await rename(tmpPath, destPath)
  } catch (error) {
    try {
      await unlink(tmpPath)
    } catch {
      // Temp file may not exist if writeFile failed
    }
    throw error
  }
}
