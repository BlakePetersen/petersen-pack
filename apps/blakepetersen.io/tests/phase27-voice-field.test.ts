// ABOUTME: Voice field — fixture-driven happy + failure path tests.
// ABOUTME: Uses the phase27-velite-runner helper to spawn isolated fixture builds.

import fs from 'node:fs'
import path from 'node:path'
import { runVeliteFixture, fixtureDir } from './lib/phase27-velite-runner'

describe('SCHEMA-01: voice field', () => {
  it('accepts voice: [author-note] in a fixture entry', () => {
    const dir = fixtureDir('voice-field-valid')
    const result = runVeliteFixture(dir)
    expect(result.exitCode).toBe(0)
    const skillsJson = path.join(dir, '.velite-fixture', 'skills.json')
    expect(fs.existsSync(skillsJson)).toBe(true)
    const skills = JSON.parse(fs.readFileSync(skillsJson, 'utf-8'))
    expect(skills).toHaveLength(1)
    expect(skills[0].voice).toEqual(['author-note'])
  })

  it('rejects voice: [not-a-real-voice-type]', () => {
    const dir = fixtureDir('voice-field-invalid')
    const result = runVeliteFixture(dir)
    expect(result.exitCode).not.toBe(0)
    expect(result.combined.toLowerCase()).toMatch(/voice/)
  })
})
