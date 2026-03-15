// ABOUTME: Fetches an artifact from the registry and applies it to the project.
// ABOUTME: Handles file writing, dependency installation, and manifest tracking.
import { defineCommand } from 'citty'
import { consola } from 'consola'
import pc from 'picocolors'
import { writeFile, mkdir, stat } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { execSync } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { fetchIndex, fetchArtifact } from '@/registry'
import {
  readManifest,
  writeManifest,
  createEmptyManifest,
  addManifestEntry,
  checksum,
  BLINK_DIR,
} from '@/manifest'
import { detectPackageManager, installDevCommand } from '@/pm'
import { formatActionLabel, formatDryRunHeader } from '@/output'
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

async function addToGitignore(cwd: string): Promise<void> {
  const gitignorePath = join(cwd, '.gitignore')
  let content: string

  try {
    content = await readFile(gitignorePath, 'utf-8')
  } catch {
    content = ''
  }

  if (content.includes('.blink/')) return

  if (content.length > 0 && !content.endsWith('\n')) {
    content += '\n'
  }

  content += '.blink/\n'
  await writeFile(gitignorePath, content)
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await stat(path)
    return true
  } catch {
    return false
  }
}

export default defineCommand({
  meta: {
    name: 'apply',
    description: 'Apply a config, skill, or hook from the registry',
  },
  args: {
    slug: {
      type: 'positional',
      description: 'Artifact slug to apply',
      required: true,
    },
    'dry-run': {
      type: 'boolean',
      description: 'Preview what would happen without making changes',
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
    const slug = args.slug as string
    const skipPrompt = args.yes || !process.stdout.isTTY
    const dryRun = args['dry-run']

    // 1. Resolve artifact
    const index = await fetchIndex()
    const item = index.items.find((i) => i.slug === slug)

    if (!item) {
      consola.error(`Artifact "${slug}" not found in registry.`)
      process.exit(1)
    }

    const artifact = await fetchArtifact(item.type, item.slug)

    // 2. Check already installed
    const cwd = process.cwd()
    let manifest = await readManifest(cwd)

    if (manifest && manifest.items.find((i) => i.slug === slug)) {
      consola.warn(
        `${pc.bold(slug)} is already installed. Use ${pc.dim('blink update')} to update.`
      )
      return
    }

    // 3. Dry-run header
    if (dryRun) {
      consola.log(
        `${formatDryRunHeader()} Previewing apply ${pc.bold(artifact.name)}`
      )
    }

    // 4. Auto-init
    if (!manifest) {
      manifest = createEmptyManifest()
      if (!dryRun) {
        await writeManifest(cwd, manifest)
        await addToGitignore(cwd)
      }
    }

    // 5. Write files
    const fileEntries: ManifestFileEntry[] = []

    for (const file of artifact.files) {
      const destPath = join(cwd, file.path)
      const exists = await fileExists(destPath)

      if (exists) {
        if (dryRun) {
          consola.log(
            `${formatActionLabel('write')} ${pc.dim(file.path)} ${pc.yellow('(exists, would overwrite)')}`
          )
          fileEntries.push({
            path: file.path,
            checksum: checksum(file.content),
            merge: file.merge,
          })
          continue
        }

        const confirmed = await confirmAction(
          `${file.path} already exists. Overwrite?`,
          skipPrompt
        )
        if (!confirmed) continue
      }

      if (dryRun) {
        consola.log(`${formatActionLabel('write')} ${pc.dim(file.path)}`)
        fileEntries.push({
          path: file.path,
          checksum: checksum(file.content),
          merge: file.merge,
        })
        continue
      }

      await mkdir(dirname(destPath), { recursive: true })
      await writeFile(destPath, file.content)
      consola.success(`${formatActionLabel('write')} ${pc.dim(file.path)}`)
      fileEntries.push({
        path: file.path,
        checksum: checksum(file.content),
        merge: file.merge,
      })
    }

    // 6. Install dependencies
    if (
      artifact.devDependencies &&
      Object.keys(artifact.devDependencies).length > 0
    ) {
      const pm = detectPackageManager(cwd)
      const deps = Object.entries(artifact.devDependencies).map(
        ([k, v]) => `${k}@${v}`
      )

      if (dryRun) {
        consola.log(
          `${formatActionLabel('install')} ${deps.join(', ')} via ${pm}`
        )
      } else {
        const confirmed = await confirmAction(
          `Install dev dependencies? ${deps.join(', ')}`,
          skipPrompt
        )

        if (confirmed) {
          const cmd = installDevCommand(pm, deps)
          consola.info(`Installing dependencies via ${pc.bold(pm)}...`)
          try {
            execSync(cmd, { cwd, stdio: 'inherit' })
          } catch {
            consola.error(
              'Dependency installation failed. Run manually: ' + cmd
            )
          }
        }
      }
    }

    // 7. Update manifest
    const entry: ManifestEntry = {
      slug: artifact.slug,
      name: artifact.name,
      type: artifact.type,
      version: artifact.version,
      scope: 'project',
      installedAt: new Date().toISOString(),
      files: fileEntries,
    }

    if (dryRun) {
      consola.log(
        `${formatActionLabel('manifest')} Track ${pc.bold(artifact.name)} in manifest`
      )
      consola.log(pc.dim('\nNo changes made.'))
      return
    }

    manifest = addManifestEntry(manifest, entry)
    await writeManifest(cwd, manifest)
    consola.success(
      `Applied ${pc.bold(artifact.name)} ${pc.dim(artifact.version)}`
    )
  },
})
