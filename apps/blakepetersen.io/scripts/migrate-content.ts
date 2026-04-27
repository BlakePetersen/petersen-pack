// ABOUTME: Phase 27 SCHEMA-06 codemod harness — discovers and runs migrations from scripts/migrations/.
// ABOUTME: Skeleton: ships with 000-noop only. Real migrations land as new <NNN>-<name>.ts files.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

interface Migration {
  name: string
  description: string
  run(contentRoot: string): Promise<{ filesChanged: number }>
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const migrationsDir = path.join(__dirname, 'migrations')
const contentRoot = path.resolve(__dirname, '..', 'content')

async function loadMigrations(): Promise<Migration[]> {
  if (!fs.existsSync(migrationsDir)) {
    throw new Error(`Migrations directory not found: ${migrationsDir}`)
  }
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => /^\d{3}-[a-z0-9-]+\.ts$/.test(f))
    .sort()

  const loaded: Migration[] = []
  for (const f of files) {
    const filePath = path.join(migrationsDir, f)
    const mod = await import(pathToFileURL(filePath).href)
    const candidate = (mod.default ?? mod) as Migration
    if (
      typeof candidate.name !== 'string' ||
      typeof candidate.description !== 'string' ||
      typeof candidate.run !== 'function'
    ) {
      throw new Error(
        `Migration ${f} must export default { name, description, run(contentRoot) }`
      )
    }
    loaded.push(candidate)
  }
  return loaded
}

function printUsage(): void {
  console.log('Usage: pnpm migrate [--list | --dry-run <name> | <name>]')
  console.log('  --list                  Enumerate available migrations')
  console.log('  --dry-run <name>        Preview a migration (do not write)')
  console.log('  <name>                  Execute the named migration')
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const migrations = await loadMigrations()

  if (args.length === 0) {
    printUsage()
    return
  }

  if (args[0] === '--list') {
    for (const m of migrations) {
      console.log(`${m.name}\t${m.description}`)
    }
    return
  }

  if (args[0] === '--dry-run') {
    const name = args[1]
    if (!name) {
      console.error('--dry-run requires a migration name')
      process.exitCode = 1
      return
    }
    const m = migrations.find((x) => x.name === name)
    if (!m) {
      console.error(`Migration not found: ${name}`)
      process.exitCode = 1
      return
    }
    console.log(`[dry-run] ${m.name}: ${m.description}`)
    console.log(`[dry-run] would run against contentRoot=${contentRoot}`)
    console.log(`[dry-run] filesChanged: 0`)
    return
  }

  // Positional: execute
  const name = args[0]
  const m = migrations.find((x) => x.name === name)
  if (!m) {
    console.error(`Migration not found: ${name}`)
    process.exitCode = 1
    return
  }
  console.log(`Running ${m.name}: ${m.description}`)
  const result = await m.run(contentRoot)
  console.log(`filesChanged: ${result.filesChanged}`)
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
