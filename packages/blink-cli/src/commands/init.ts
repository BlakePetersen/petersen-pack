// ABOUTME: Initializes blink tracking in a project.
// ABOUTME: Creates .blink/manifest.json, adds .blink/ to .gitignore, detects package manager.
import { defineCommand } from 'citty'
import { consola } from 'consola'
import pc from 'picocolors'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { readManifest, writeManifest, createEmptyManifest } from '@/manifest'
import { detectPackageManager } from '@/pm'
import { formatDryRunHeader } from '@/output'

async function addToGitignore(cwd: string): Promise<void> {
  const gitignorePath = join(cwd, '.gitignore')
  let content: string

  try {
    content = await readFile(gitignorePath, 'utf-8')
  } catch {
    content = ''
  }

  if (content.includes('.blink/')) {
    return
  }

  if (content.length > 0 && !content.endsWith('\n')) {
    content += '\n'
  }

  content += '.blink/\n'
  await writeFile(gitignorePath, content)
}

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
