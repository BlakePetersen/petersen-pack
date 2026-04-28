// ABOUTME: Phase 27 SCHEMA-07 perf-baseline capture — four measurements + metadata to JSON.
// ABOUTME: Manual run via `pnpm perf:baseline`. Spawns subprocesses with argv arrays (no shell).

import { spawnSync, spawn } from 'node:child_process'
import { performance } from 'node:perf_hooks'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

interface SyncTiming {
  wallMs: number
  stdout: string
  stderr: string
  status: number | null
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function timeSync(cmd: string, args: string[]): SyncTiming {
  const t0 = performance.now()
  const r = spawnSync(cmd, args, { stdio: 'pipe', encoding: 'utf-8' })
  const t1 = performance.now()
  return {
    wallMs: t1 - t0,
    stdout: r.stdout ?? '',
    stderr: r.stderr ?? '',
    status: r.status,
  }
}

// Warm next dev — spawn, watch for "Ready in Xs", kill the process.
async function timeNextDev(): Promise<number> {
  return new Promise((resolve, reject) => {
    const proc = spawn('pnpm', ['--filter', 'blakepetersen.io', 'dev'], {
      stdio: 'pipe',
    })
    const timer = setTimeout(() => {
      proc.kill()
      reject(new Error('next dev did not become ready within 60s'))
    }, 60_000)
    proc.stdout?.on('data', (chunk: Buffer) => {
      const s = chunk.toString()
      const m = s.match(/Ready in\s+([\d.]+)\s*(s|ms)/i)
      if (m) {
        const ms = Number(m[1]) * (m[2].toLowerCase() === 's' ? 1000 : 1)
        clearTimeout(timer)
        proc.kill()
        resolve(ms)
      }
    })
    proc.on('error', (err) => {
      clearTimeout(timer)
      reject(err)
    })
  })
}

// Content count: count *.mdx files across content/.
function countMdx(root: string): number {
  let n = 0
  function walk(dir: string): void {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name)
      if (entry.isDirectory()) walk(p)
      else if (entry.isFile() && entry.name.endsWith('.mdx')) n++
    }
  }
  walk(root)
  return n
}

async function main(): Promise<void> {
  // 1. Cold full build (next build --webpack runs velite as part of next build).
  console.log(
    '[perf-baseline] Running full build (pnpm --filter blakepetersen.io build)...',
  )
  const fullBuild = timeSync('pnpm', [
    '--filter',
    'blakepetersen.io',
    'build',
  ])
  if (fullBuild.status !== 0) {
    console.error('Full build failed; cannot capture baseline.')
    console.error(fullBuild.stderr)
    process.exit(1)
  }

  // 2. Velite-only.
  console.log(
    '[perf-baseline] Running velite-only (pnpm --filter blakepetersen.io velite)...',
  )
  const velite = timeSync('pnpm', ['--filter', 'blakepetersen.io', 'velite'])
  if (velite.status !== 0) {
    console.error('Velite build failed; cannot capture baseline.')
    console.error(velite.stderr)
    process.exit(1)
  }

  // 3. Extract webpack compile time from fullBuild.stdout.
  // Next.js logs "Compiled successfully in 5.2s" or " 5234ms" — match either.
  const webpackMatch = fullBuild.stdout.match(
    /Compiled successfully in\s+([\d.]+)\s*(s|ms)/i,
  )
  const webpackCompileMs: number | null = webpackMatch
    ? Number(webpackMatch[1]) *
      (webpackMatch[2].toLowerCase() === 's' ? 1000 : 1)
    : null

  // 4. Warm next dev.
  console.log('[perf-baseline] Measuring warm next dev time-to-ready...')
  const nextDevReadyMs = await timeNextDev()

  // 5. Content count + metadata.
  const appRoot = path.resolve(__dirname, '..')
  const contentCount = countMdx(path.join(appRoot, 'content'))

  const baseline = {
    capturedAt: new Date().toISOString(),
    nodeVersion: process.version,
    contentCount,
    metrics: {
      fullBuildWallMs: fullBuild.wallMs,
      veliteWallMs: velite.wallMs,
      webpackCompileMs,
      nextDevReadyMs,
    },
  }

  const outDir = path.resolve(appRoot, '..', '..', '.planning', 'intel')
  fs.mkdirSync(outDir, { recursive: true })
  const outFile = path.join(outDir, 'build-perf-baseline.json')
  fs.writeFileSync(outFile, JSON.stringify(baseline, null, 2) + '\n')

  console.log('Baseline written to', outFile)
  console.log(JSON.stringify(baseline, null, 2))
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
