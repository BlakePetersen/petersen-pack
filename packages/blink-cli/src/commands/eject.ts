// ABOUTME: Strips section markers from managed files and removes item from manifest.
// ABOUTME: Transfers full ownership of managed config files to the user.
import { defineCommand } from 'citty'
import { consola } from 'consola'
import pc from 'picocolors'
import { readFile } from 'node:fs/promises'
import { readManifest, writeManifest, removeManifestEntry } from '@/manifest'
import { stripMarkers } from '@/markers'
import { atomicWrite } from '@/writer'
import { resolveDestination, resolveManifestRoot } from '@/scope'

async function readFileSafe(path: string): Promise<string | null> {
  try {
    return await readFile(path, 'utf-8')
  } catch {
    return null
  }
}

export default defineCommand({
  meta: {
    name: 'eject',
    description: 'Strip markers from managed files and remove from manifest'
  },
  args: {
    slug: {
      type: 'positional',
      description: 'Artifact slug to eject',
      required: true
    },
    'dry-run': {
      type: 'boolean',
      description: 'Preview changes without applying them',
      default: false
    },
    yes: {
      type: 'boolean',
      alias: 'y',
      description: 'Skip confirmation prompts',
      default: false
    },
    global: {
      type: 'boolean',
      description: 'Operate on the global (home-directory) manifest',
      default: false
    }
  },
  async run({ args }) {
    const slug = args.slug as string
    const dryRun = args['dry-run']
    const cwd = process.cwd()

    // 1. Read manifest — written back to the same root it was read from
    const manifestRoot = resolveManifestRoot(
      args.global ? 'global' : 'project',
      cwd
    )
    const manifest = await readManifest(manifestRoot)

    if (!manifest) {
      consola.error(
        'No blink manifest found. Run blink init or blink apply first.'
      )
      process.exit(1)
    }

    // 2. Find entry by slug
    const entry = manifest.items.find(i => i.slug === slug)

    if (!entry) {
      consola.error(`${pc.bold(slug)} is not installed.`)
      process.exit(1)
    }

    // 3. Process each file
    for (const file of entry.files) {
      const destPath = resolveDestination(file.path, entry.scope, cwd)
      const currentContent = await readFileSafe(destPath)

      if (currentContent === null) {
        consola.warn(`${file.path} not found on disk, skipping.`)
        continue
      }

      if (file.merge === 'section') {
        const stripped = stripMarkers(currentContent, slug)

        if (!dryRun) {
          await atomicWrite(destPath, stripped)
        }
        consola.info(`Stripped markers from ${file.path}`)
      } else {
        consola.info(`${file.path} (no markers to strip)`)
      }
    }

    // 4. Remove entry from manifest
    if (!dryRun) {
      const updatedManifest = removeManifestEntry(manifest, slug)
      await writeManifest(manifestRoot, updatedManifest)
    }

    // 5. Success message
    consola.success(
      `Ejected ${pc.bold(entry.name)}. Files are now fully yours.`
    )
  }
})
