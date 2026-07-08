// ABOUTME: Runs integrity checks on blink-managed files and manifest.
// ABOUTME: Detects broken markers, orphaned entries, temp files, and local modifications.
import { defineCommand } from 'citty'
import { consola } from 'consola'
import pc from 'picocolors'
import { readFile } from 'node:fs/promises'
import { readdir, stat } from 'node:fs/promises'
import { join } from 'node:path'
import { readManifest, checksum } from '@/manifest'
import { validateMarkers, findManagedSections } from '@/markers'
import { resolveDestination, resolveManifestRoot } from '@/scope'

interface DoctorIssue {
  severity: 'error' | 'warning' | 'info'
  message: string
}

async function readFileSafe(path: string): Promise<string | null> {
  try {
    return await readFile(path, 'utf-8')
  } catch {
    return null
  }
}

async function findTempFiles(dir: string): Promise<string[]> {
  const results: string[] = []

  try {
    const entries = await readdir(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = join(dir, entry.name)

      if (entry.isFile() && entry.name.includes('.blink-tmp-')) {
        results.push(entry.name)
      } else if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.git') {
        const nested = await findTempFiles(fullPath)
        results.push(...nested.map((n) => join(entry.name, n)))
      }
    }
  } catch {
    // Directory may not be readable
  }

  return results
}

export default defineCommand({
  meta: {
    name: 'doctor',
    description: 'Check integrity of blink-managed files and manifest',
  },
  args: {
    global: {
      type: 'boolean',
      description: 'Operate on the global (home-directory) manifest',
      default: false,
    },
  },
  async run({ args }) {
    const cwd = process.cwd()
    const issues: DoctorIssue[] = []

    // 1. Read manifest
    const manifestRoot = resolveManifestRoot(args.global ? 'global' : 'project', cwd)
    const manifest = await readManifest(manifestRoot)

    if (!manifest) {
      consola.info(
        'No blink manifest found. Run blink init or blink apply to get started.'
      )
      return
    }

    // 2. Check each manifest entry
    for (const entry of manifest.items) {
      for (const file of entry.files) {
        const destPath = resolveDestination(file.path, entry.scope, cwd)
        const content = await readFileSafe(destPath)

        // Check file exists
        if (content === null) {
          issues.push({
            severity: 'error',
            message: `Orphaned manifest entry: ${file.path} (file not found)`,
          })
          continue
        }

        if (file.merge === 'section') {
          // Validate markers
          const validation = validateMarkers(content)
          if (!validation.valid) {
            for (const error of validation.errors) {
              issues.push({ severity: 'error', message: error })
            }
          }

          // Check for local modifications in managed section
          const sections = findManagedSections(content, entry.slug)
          if (sections.length > 0) {
            const managedChecksum = checksum(sections[0].content)
            if (managedChecksum !== file.checksum) {
              // Need to compare against what was originally written
              // The manifest checksum is for the full marked content (with markers)
              // Reconstruct: if managed content differs from what was stored, it's modified
              issues.push({
                severity: 'warning',
                message: `Locally modified: ${file.path}`,
              })
            }
          }
        } else {
          // Replace merge: compare full file checksum
          const currentChecksum = checksum(content)
          if (currentChecksum !== file.checksum) {
            issues.push({
              severity: 'warning',
              message: `Locally modified: ${file.path}`,
            })
          }
        }
      }
    }

    // 3. Scan for orphaned temp files
    const tempFiles = await findTempFiles(cwd)
    for (const tempFile of tempFiles) {
      issues.push({
        severity: 'warning',
        message: `Orphaned temp file: ${tempFile} (safe to delete)`,
      })
    }

    // 4. Report results
    if (issues.length === 0) {
      consola.success('No issues found.')
      return
    }

    const errors = issues.filter((i) => i.severity === 'error')
    const warnings = issues.filter((i) => i.severity === 'warning')
    const infos = issues.filter((i) => i.severity === 'info')

    for (const issue of issues) {
      const prefix =
        issue.severity === 'error'
          ? pc.red('error')
          : issue.severity === 'warning'
            ? pc.yellow('warning')
            : pc.blue('info')

      consola.log(`${prefix}: ${issue.message}`)
    }

    consola.info(
      `Found ${issues.length} issue(s): ${errors.length} error(s), ${warnings.length} warning(s)`
    )
  },
})
