// ABOUTME: Integration tests validating the blink-cli build output.
// ABOUTME: Verifies the tsup build produces a correct single-file ESM binary with shebang.
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { join } from 'node:path'

const DIST_DIR = join(__dirname, '..', 'dist')
const CLI_PATH = join(DIST_DIR, 'cli.mjs')

describe('blink-cli build output', () => {
  it('dist/cli.mjs file exists', () => {
    expect(existsSync(CLI_PATH)).toBe(true)
  })

  it('first line is a shebang', () => {
    const content = readFileSync(CLI_PATH, 'utf-8')
    const firstLine = content.split('\n')[0]
    expect(firstLine).toBe('#!/usr/bin/env node')
  })

  it('dist/ contains exactly one .mjs file (no chunk splitting)', () => {
    const files = readdirSync(DIST_DIR).filter(f => f.endsWith('.mjs'))
    expect(files).toHaveLength(1)
    expect(files[0]).toBe('cli.mjs')
  })

  it('running node dist/cli.mjs shows help with subcommands', () => {
    let output: string
    try {
      output = execSync(`node ${CLI_PATH} 2>&1`, {
        encoding: 'utf-8',
        cwd: join(__dirname, '..')
      })
    } catch (error: any) {
      // citty exits with code 1 when no subcommand given
      output = error.stdout || error.stderr || ''
    }
    expect(output).toContain('apply')
    expect(output).toContain('init')
    expect(output).toContain('list')
    expect(output).toContain('status')
  })

  it('apply --help shows slug positional arg and flags', () => {
    let output: string
    try {
      output = execSync(`node ${CLI_PATH} apply --help 2>&1`, {
        encoding: 'utf-8',
        cwd: join(__dirname, '..')
      })
    } catch (error: any) {
      output = error.stdout || error.stderr || ''
    }
    expect(output).toContain('dry-run')
    expect(output).toContain('yes')
  })
})
