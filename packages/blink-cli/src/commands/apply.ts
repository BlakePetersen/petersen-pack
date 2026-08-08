// ABOUTME: Fetches an artifact from the registry and applies it to the project.
// ABOUTME: Orchestrates resolve → prepare → execute → record pipeline stages.

import { defineCommand } from 'citty'
import { consola } from 'consola'
import pc from 'picocolors'
import { execSync } from 'node:child_process'
import { detectPackageManager, installDevCommand } from '@/pm'
import { formatActionLabel, formatDryRunHeader } from '@/output'
import { confirmAction } from '@/modules/prompt'
import {
  resolve,
  prepare,
  executeFileWrite,
  buildFileEntry,
  record,
  type Scope
} from '@/pipeline'
import type { ManifestFileEntry } from 'blink-registry'

export default defineCommand({
  meta: {
    name: 'apply',
    description: 'Apply a config, skill, or hook from the registry'
  },
  args: {
    slug: {
      type: 'positional',
      description: 'Artifact slug to apply',
      required: true
    },
    'dry-run': {
      type: 'boolean',
      description: 'Preview what would happen without making changes',
      default: false
    },
    yes: {
      type: 'boolean',
      alias: 'y',
      description: 'Skip confirmation prompts',
      default: false
    },
    project: {
      type: 'boolean',
      description: 'Apply to project scope (default)',
      default: true
    },
    global: {
      type: 'boolean',
      description: 'Apply to global scope (~/.claude/)',
      default: false
    }
  },
  async run({ args }) {
    const slug = args.slug as string
    const skipPrompt = args.yes || !process.stdout.isTTY
    const dryRun = args['dry-run']
    const scope: Scope = args.global ? 'global' : 'project'
    const cwd = process.cwd()

    // 1. Resolve artifact and manifest
    const resolved = await resolve(slug, scope, cwd)
    const { artifact, manifest } = resolved

    // 2. Check already installed
    if (manifest.items.find(i => i.slug === slug)) {
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

    // 4. Prepare file and dependency plans
    const { filePlans, depPlan } = await prepare(resolved, scope, cwd)

    // 5. Dependency resolution
    if (depPlan.missing.length > 0) {
      const confirmed = await confirmAction(
        `Missing dependencies: ${depPlan.missing.join(', ')}. Apply them first?`,
        skipPrompt
      )

      if (!confirmed) {
        consola.warn(
          'Continuing without dependencies. Some features may not work.'
        )
      }
    }

    // 6. Write files — conflicts are known up-front, so check them all before
    // writing anything. The old mid-loop check wrote earlier files, then
    // returned exit 0, leaving an untracked partial install in the repo.
    const conflicts = filePlans.filter(plan => plan.markerConflict)
    if (conflicts.length > 0) {
      for (const plan of conflicts) {
        consola.error(
          `${pc.bold(slug)} is already installed in ${plan.path}. Use ${pc.dim('blink update')} to update.`
        )
      }
      process.exitCode = 1
      return
    }

    const fileEntries: ManifestFileEntry[] = []

    for (const plan of filePlans) {
      if (plan.exists && plan.merge === 'replace') {
        if (dryRun) {
          consola.log(
            `${formatActionLabel('write')} ${pc.dim(plan.path)} ${pc.yellow('(exists, would overwrite)')}`
          )
          fileEntries.push(buildFileEntry(plan))
          continue
        }

        const confirmed = await confirmAction(
          `${plan.path} already exists. Overwrite?`,
          skipPrompt
        )
        if (!confirmed) continue
      }

      if (dryRun) {
        consola.log(`${formatActionLabel('write')} ${pc.dim(plan.path)}`)
        fileEntries.push(buildFileEntry(plan))
        continue
      }

      const entry = await executeFileWrite(plan)
      consola.success(`${formatActionLabel('write')} ${pc.dim(plan.path)}`)
      fileEntries.push(entry)
    }

    // 7. Install dev dependencies
    if (Object.keys(depPlan.devDeps).length > 0) {
      const pm = detectPackageManager(cwd)
      const deps = Object.entries(depPlan.devDeps).map(([k, v]) => `${k}@${v}`)

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

    // 8. Record to manifest
    if (dryRun) {
      consola.log(
        `${formatActionLabel('manifest')} Track ${pc.bold(artifact.name)} in manifest`
      )
      consola.log(pc.dim('\nNo changes made.'))
      return
    }

    await record(resolved, fileEntries, scope, cwd)
    consola.success(
      `Applied ${pc.bold(artifact.name)} ${pc.dim(artifact.version)}`
    )
  }
})
