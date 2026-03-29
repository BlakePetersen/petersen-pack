// ABOUTME: Tests for the component registry module.
// ABOUTME: Validates types, lookup functions, sidebar sections, and static params generation.

import {
  getComponent,
  getComponentsByTier,
  getSidebarSections,
  getAllComponents,
} from '@/lib/component-registry'
import type { ComponentDef } from '@/lib/component-registry'

describe('component-registry', () => {
  it('ComponentDef has required fields', () => {
    const components = getAllComponents()
    expect(components.length).toBeGreaterThan(0)

    const component = components[0] as ComponentDef
    expect(component).toHaveProperty('name')
    expect(component).toHaveProperty('slug')
    expect(component).toHaveProperty('tier')
    expect(component).toHaveProperty('description')
    expect(component).toHaveProperty('imports')
    expect(component).toHaveProperty('props')
    expect(component).toHaveProperty('codeExamples')
    expect(component).toHaveProperty('a11y')
    expect(component).toHaveProperty('preview')
  })

  it('getComponent(tier, slug) returns matching component or undefined', () => {
    const button = getComponent('atoms', 'button')
    expect(button).toBeDefined()
    expect(button?.name).toBe('Button')
    expect(button?.tier).toBe('atoms')

    const notFound = getComponent('atoms', 'nonexistent')
    expect(notFound).toBeUndefined()
  })

  it('getComponentsByTier(tier) returns components filtered by tier', () => {
    const atoms = getComponentsByTier('atoms')
    expect(atoms.length).toBeGreaterThan(0)
    atoms.forEach((c) => expect(c.tier).toBe('atoms'))

    const molecules = getComponentsByTier('molecules')
    expect(molecules.length).toBeGreaterThan(0)
    molecules.forEach((c) => expect(c.tier).toBe('molecules'))
  })

  it('getSidebarSections() returns navigation sections with correct structure', () => {
    const sections = getSidebarSections()
    expect(sections.length).toBeGreaterThanOrEqual(5)

    // First section: Overview + Getting Started
    expect(sections[0].items.some((i) => i.name === 'Overview')).toBe(true)
    expect(sections[0].items.some((i) => i.name === 'Getting Started')).toBe(true)

    // Tier sections with labels
    const atomsSection = sections.find((s) => s.label === '// atoms')
    expect(atomsSection).toBeDefined()
    expect(atomsSection!.items.length).toBe(6)

    const moleculesSection = sections.find((s) => s.label === '// molecules')
    expect(moleculesSection).toBeDefined()
    expect(moleculesSection!.items.length).toBe(6)

    const organismsSection = sections.find((s) => s.label === '// organisms')
    expect(organismsSection).toBeDefined()
    expect(organismsSection!.items.length).toBe(3)

    // Last section: Tokens
    const lastSection = sections[sections.length - 1]
    expect(lastSection.items.some((i) => i.name === 'Tokens')).toBe(true)
  })

  it('getAllComponents generates params for static generation', () => {
    const components = getAllComponents()
    // Should have at least 2 placeholder components (Button and Card)
    expect(components.length).toBeGreaterThanOrEqual(2)

    components.forEach((c) => {
      expect(['atoms', 'molecules', 'organisms']).toContain(c.tier)
      expect(c.slug).toBeTruthy()
    })
  })
})
