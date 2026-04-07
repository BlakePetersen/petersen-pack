// ABOUTME: Initializes blink tracking in a project.
// ABOUTME: Creates .blink/manifest.json, adds .blink/ to .gitignore, detects package manager.
import { defineCommand } from 'citty'
import { consola } from 'consola'
import pc from 'picocolors'
import { readManifest, writeManifest, createEmptyManifest } from '@/manifest'
import { detectPackageManager } from '@/pm'
import { formatDryRunHeader } from '@/output'
import { addToGitignore } from '@/gitignore'

export default defineCommand({
  meta: {
    name: 'init',
    description: 'Initialize blink in this project',
  },
  args: {
    yes: {
      type: 'boolean',
      description: 'Skip confirmation prompts',
      default: false,
    },
    'dry-run': {
      type: 'boolean',
      description: 'Preview what would be created without writing files',
      default: false,
    },
  },
  async run({ args }) {
    const cwd = process.cwd()
    const dryRun = args['dry-run']
    const existing = await readManifest(cwd)

    if (existing) {
      const count = existing.items.length
      const label = count === 1 ? 'item' : 'items'
      consola.info(`blink is already initialized (${count} ${label} tracked)`)
      return
    }

    if (dryRun) {
      consola.log(`${formatDryRunHeader()} Previewing init`)
      consola.log(`  Would create ${pc.dim('.blink/manifest.json')}`)
      consola.log(`  Would add ${pc.dim('.blink/')} to .gitignore`)
      const pm = detectPackageManager(cwd)
      consola.info(`Detected package manager: ${pc.bold(pm)}`)
      consola.log(pc.dim('\nNo changes made.'))
      return
    }

    const manifest = createEmptyManifest()
    await writeManifest(cwd, manifest)
    await addToGitignore(cwd)
    const pm = detectPackageManager(cwd)
    consola.success(`Initialized blink in ${pc.dim('.blink/')}`)
    consola.info(`Detected package manager: ${pc.bold(pm)}`)
  },
})
