// ABOUTME: Integration tests for static JSON registry endpoint generation.
// ABOUTME: Validates registry output files against blink-registry Zod schemas after Velite build.

import { existsSync, readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import {
  RegistryIndexSchema,
  RegistryArtifactSchema,
} from '@blink-dx/registry'

const appRoot = join(__dirname, '..')
const registryDir = join(appRoot, 'public', 'r')
const indexPath = join(registryDir, 'index.json')

const registryExists = existsSync(indexPath)

describe('Registry Endpoints (REG-02/03/04/05)', () => {
  const skipReason = registryExists
    ? undefined
    : 'public/r/index.json not found — run pnpm build first'

  const conditionalTest = skipReason ? test.skip : test

  conditionalTest('index.json exists and is valid JSON', () => {
    const raw = readFileSync(indexPath, 'utf-8')
    const parsed = JSON.parse(raw)
    expect(parsed).toBeDefined()
  })

  conditionalTest('index.json validates against RegistryIndexSchema', () => {
    const raw = readFileSync(indexPath, 'utf-8')
    const parsed = JSON.parse(raw)
    const result = RegistryIndexSchema.safeParse(parsed)
    if (!result.success) {
      console.error('Validation errors:', result.error.format())
    }
    expect(result.success).toBe(true)
  })

  conditionalTest('index contains at least one item', () => {
    const raw = readFileSync(indexPath, 'utf-8')
    const parsed = JSON.parse(raw)
    expect(parsed.items.length).toBeGreaterThan(0)
  })

  conditionalTest('each index item has CalVer version', () => {
    const raw = readFileSync(indexPath, 'utf-8')
    const parsed = JSON.parse(raw)
    const calverPattern = /^\d{4}\.\d{2}\.\d{2}\.\d+$/
    for (const item of parsed.items) {
      expect(item.version).toMatch(calverPattern)
    }
  })

  conditionalTest('each index item has a url containing the base URL', () => {
    const raw = readFileSync(indexPath, 'utf-8')
    const parsed = JSON.parse(raw)
    for (const item of parsed.items) {
      expect(item.url).toContain('blakepetersen.io')
      expect(item.url).toMatch(/^https?:\/\//)
    }
  })

  conditionalTest('each index item has a matching detail JSON file', () => {
    const raw = readFileSync(indexPath, 'utf-8')
    const parsed = JSON.parse(raw)
    for (const item of parsed.items) {
      const detailPath = join(registryDir, item.type, `${item.slug}.json`)
      expect(existsSync(detailPath)).toBe(true)
    }
  })

  conditionalTest('detail files validate against RegistryArtifactSchema', () => {
    const raw = readFileSync(indexPath, 'utf-8')
    const parsed = JSON.parse(raw)
    for (const item of parsed.items) {
      const detailPath = join(registryDir, item.type, `${item.slug}.json`)
      const detailRaw = readFileSync(detailPath, 'utf-8')
      const detail = JSON.parse(detailRaw)
      const result = RegistryArtifactSchema.safeParse(detail)
      if (!result.success) {
        console.error(`Validation errors for ${item.slug}:`, result.error.format())
      }
      expect(result.success).toBe(true)
    }
  })

  conditionalTest('detail files include url field', () => {
    const raw = readFileSync(indexPath, 'utf-8')
    const parsed = JSON.parse(raw)
    for (const item of parsed.items) {
      const detailPath = join(registryDir, item.type, `${item.slug}.json`)
      const detailRaw = readFileSync(detailPath, 'utf-8')
      const detail = JSON.parse(detailRaw)
      expect(detail.url).toBeDefined()
      expect(detail.url).toContain('blakepetersen.io')
    }
  })

  conditionalTest('no stale type directories beyond what index references', () => {
    const raw = readFileSync(indexPath, 'utf-8')
    const parsed = JSON.parse(raw)
    const expectedTypes = new Set(parsed.items.map((item: { type: string }) => item.type))
    const actualDirs = readdirSync(registryDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
    for (const dir of actualDirs) {
      expect(expectedTypes.has(dir)).toBe(true)
    }
  })
})
