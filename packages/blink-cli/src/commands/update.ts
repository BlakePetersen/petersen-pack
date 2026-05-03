// ABOUTME: Updates managed artifacts by replacing managed sections with upstream content.
// ABOUTME: Shows diff preview and detects local modifications before overwriting.
import { defineCommand } from 'citty'
import { consola } from 'consola'
import pc from 'picocolors'
import { readFile } from 'node:fs/promises'
import { fetchArtifact } from '@/registry'
import { readManifest, writeManifest, updateManifestEntry } from '@/manifest'
import { atomicWrite } from '@/writer'
import { resolveDestination, resolveManifestRoot } from '@/scope'
import { reconcileFile } from '@/reconcile'
import type { ManifestEntry, ManifestFileEntry } from 'blink-registry'

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
        const manifestFileEntry = entry.files.find((f) => f.path === file.path)

        const result = await reconcileFile({
          file,
          destPath,
          currentContent,
          manifestFileEntry,
          slug: entry.slug,
          skipPrompt,
        })

        if (result.action.kind === 'write' && !dryRun) {
          await atomicWrite(result.action.destPath, result.action.content)
        }

        newFileEntries.push(result.entry)
        if (result.hasChanges) hasChanges = true
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
