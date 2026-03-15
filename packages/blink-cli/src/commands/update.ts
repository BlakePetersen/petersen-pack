// ABOUTME: Updates managed artifacts by replacing managed sections with upstream content.
// ABOUTME: Shows diff preview and detects local modifications before overwriting.
import { defineCommand } from 'citty'
import { consola } from 'consola'
import pc from 'picocolors'
import { readFile } from 'node:fs/promises'
import { fetchArtifact } from '@/registry'
import {
  readManifest,
  writeManifest,
  updateManifestEntry,
  checksum,
} from '@/manifest'
import { atomicWrite } from '@/writer'
import { findManagedSections, replaceManagedContent } from '@/markers'
import { resolveDestination, resolveManifestRoot } from '@/scope'
import { formatColoredDiff } from '@/output'
import type { ManifestEntry, ManifestFileEntry } from 'blink-registry'

async function confirmAction(
  message: string,
  skipPrompt: boolean
): Promise<boolean> {
  if (skipPrompt) return true
  const result = await consola.prompt(message, { type: 'confirm' })
  if (typeof result === 'symbol') {
    consola.info('Cancelled.')
    process.exit(0)
  }
  return result as boolean
}

async function readFileSafe(path: string): Promise<string | null> {
  try {
    return await readFile(path, 'utf-8')
  } catch {
    return null
  }
}

export default defineCommand({
  meta: {
    name: 'update',
    description: 'Update installed artifacts to latest upstream versions',
  },
  args: {
    slug: {
      type: 'positional',
      description: 'Artifact slug to update (updates all if omitted)',
      required: false,
    },
    'dry-run': {
      type: 'boolean',
      description: 'Preview changes without applying them',
      default: false,
    },
    yes: {
      type: 'boolean',
      alias: 'y',
      description: 'Skip confirmation prompts',
      default: false,
    },
  },
  async run({ args }) {
    const slug = args.slug as string | undefined
    const skipPrompt = args.yes || !process.stdout.isTTY
    const dryRun = args['dry-run']
    const cwd = process.cwd()

    // 1. Read manifest
    const manifest = await readManifest(cwd)

    if (!manifest) {
      consola.error('No blink manifest found. Run blink init first.')
      process.exit(1)
    }

    // 2. Determine items to update
    let items: ManifestEntry[]

    if (slug) {
      const entry = manifest.items.find((i) => i.slug === slug)
      if (!entry) {
        consola.error(`${pc.bold(slug)} is not installed.`)
        process.exit(1)
      }
      items = [entry]
    } else {
      items = manifest.items
    }

    let updatedManifest = manifest

    for (const entry of items) {
      const artifact = await fetchArtifact(entry.type, entry.slug)
      const manifestRoot = resolveManifestRoot(entry.scope, cwd)
      const newFileEntries: ManifestFileEntry[] = []
      let hasChanges = false

      for (const file of artifact.files) {
        const destPath = resolveDestination(file.path, entry.scope, cwd)
        const currentContent = await readFileSafe(destPath)

        if (currentContent === null) {
          // File missing on disk; write fresh
          if (!dryRun) {
            await atomicWrite(destPath, file.content)
          }
          newFileEntries.push({
            path: file.path,
            checksum: checksum(file.content),
            merge: file.merge,
          })
          hasChanges = true
          continue
        }

        const manifestFileEntry = entry.files.find(
          (f) => f.path === file.path
        )

        if (file.merge === 'section') {
          const sections = findManagedSections(currentContent, entry.slug)

          if (sections.length === 0) {
            consola.warn(
              `No managed section found for ${pc.bold(entry.slug)} in ${file.path}. Skipping.`
            )
            newFileEntries.push(
              manifestFileEntry || {
                path: file.path,
                checksum: checksum(currentContent),
                merge: file.merge,
              }
            )
            continue
          }

          const currentManaged = sections[0].content
          const currentManagedChecksum = checksum(currentManaged)

          // Check if upstream content differs from local managed content
          if (currentManaged === file.content) {
            newFileEntries.push(
              manifestFileEntry || {
                path: file.path,
                checksum: checksum(currentContent),
                merge: file.merge,
              }
            )
            continue
          }

          hasChanges = true

          // Detect local modifications
          if (
            manifestFileEntry &&
            currentManagedChecksum !== checksum(manifestFileEntry.path)
          ) {
            // Compare current managed checksum against what we last wrote
            const lastWrittenContent = currentManaged
            const lastWrittenChecksum = checksum(lastWrittenContent)

            if (
              manifestFileEntry.checksum !== checksum(currentContent)
            ) {
              const confirmed = await confirmAction(
                `Local changes detected in managed section of ${file.path}. Overwrite?`,
                skipPrompt
              )
              if (!confirmed) {
                newFileEntries.push(manifestFileEntry)
                continue
              }
            }
          }

          // Show diff
          const diffOutput = formatColoredDiff(
            currentManaged,
            file.content,
            file.path
          )
          consola.log(diffOutput)

          // Apply update
          const updatedContent = replaceManagedContent(
            currentContent,
            entry.slug,
            file.content
          )

          if (!dryRun) {
            await atomicWrite(destPath, updatedContent)
          }
          newFileEntries.push({
            path: file.path,
            checksum: checksum(updatedContent),
            merge: file.merge,
          })
        } else {
          // Replace merge
          if (currentContent === file.content) {
            newFileEntries.push(
              manifestFileEntry || {
                path: file.path,
                checksum: checksum(currentContent),
                merge: file.merge,
              }
            )
            continue
          }

          hasChanges = true

          // Detect local modifications
          if (
            manifestFileEntry &&
            manifestFileEntry.checksum !== checksum(currentContent)
          ) {
            const confirmed = await confirmAction(
              `Local changes detected in ${file.path}. Overwrite?`,
              skipPrompt
            )
            if (!confirmed) {
              newFileEntries.push(manifestFileEntry)
              continue
            }
          }

          // Show diff
          const diffOutput = formatColoredDiff(
            currentContent,
            file.content,
            file.path
          )
          consola.log(diffOutput)

          if (!dryRun) {
            await atomicWrite(destPath, file.content)
          }
          newFileEntries.push({
            path: file.path,
            checksum: checksum(file.content),
            merge: file.merge,
          })
        }
      }

      if (!hasChanges) {
        consola.info(
          `${pc.bold(entry.name)} is already up to date.`
        )
        continue
      }

      if (!dryRun) {
        const updatedEntry: ManifestEntry = {
          ...entry,
          version: artifact.version,
          installedAt: new Date().toISOString(),
          files: newFileEntries,
        }
        updatedManifest = updateManifestEntry(
          updatedManifest,
          entry.slug,
          updatedEntry
        )
        await writeManifest(manifestRoot, updatedManifest)
        consola.success(
          `Updated ${pc.bold(entry.name)} to ${pc.dim(artifact.version)}`
        )
      }
    }
  },
})
