// ABOUTME: Shows upstream changes for an installed artifact without applying them.
// ABOUTME: Compares local managed sections against registry content.
import { defineCommand } from 'citty'
import { consola } from 'consola'
import pc from 'picocolors'
import { readFile } from 'node:fs/promises'
import { fetchArtifact } from '@/registry'
import { readManifest } from '@/manifest'
import { findManagedSections } from '@/markers'
import { resolveDestination, resolveManifestRoot } from '@/scope'
import { formatColoredDiff } from '@/output'

async function readFileSafe(path: string): Promise<string | null> {
  try {
    return await readFile(path, 'utf-8')
  } catch {
    return null
  }
}

export default defineCommand({
  meta: {
    name: 'diff',
    description: 'Show upstream changes for an installed artifact',
  },
  args: {
    slug: {
      type: 'positional',
      description: 'Artifact slug to diff',
      required: true,
    },
    global: {
      type: 'boolean',
      description: 'Operate on the global (home-directory) manifest',
      default: false,
    },
  },
  async run({ args }) {
    const slug = args.slug as string
    const cwd = process.cwd()

    // 1. Read manifest
    const manifestRoot = resolveManifestRoot(args.global ? 'global' : 'project', cwd)
    const manifest = await readManifest(manifestRoot)

    if (!manifest) {
      consola.error('No blink manifest found. Run blink init first.')
      process.exit(1)
    }

    // 2. Find entry
    const entry = manifest.items.find((i) => i.slug === slug)

    if (!entry) {
      consola.error(`${pc.bold(slug)} is not installed.`)
      process.exit(1)
    }

    // 3. Fetch upstream
    const artifact = await fetchArtifact(entry.type, entry.slug)

    // 4. Compare each file
    const diffs: string[] = []

    for (const file of artifact.files) {
      const destPath = resolveDestination(file.path, entry.scope, cwd)
      const currentContent = await readFileSafe(destPath)

      if (currentContent === null) {
        diffs.push(`${pc.bold(file.path)}: file not found on disk (would be created)`)
        continue
      }

      if (file.merge === 'section') {
        const sections = findManagedSections(currentContent, entry.slug)

        if (sections.length === 0) {
          consola.warn(
            `No managed section found for ${pc.bold(entry.slug)} in ${file.path}. Skipping.`
          )
          continue
        }

        const currentManaged = sections[0].content

        if (currentManaged === file.content) continue

        diffs.push(formatColoredDiff(currentManaged, file.content, file.path))
      } else {
        if (currentContent === file.content) continue

        diffs.push(formatColoredDiff(currentContent, file.content, file.path))
      }
    }

    if (diffs.length === 0) {
      consola.info(
        `Up to date. No upstream changes for ${pc.bold(entry.name)}.`
      )
      return
    }

    for (const diff of diffs) {
      consola.log(diff)
    }
  },
})
