// ABOUTME: Tests for the component registry module.
// ABOUTME: Validates types, lookup functions, sidebar sections, and completeness of all 15 components.

import {
  getComponent,
  getComponentsByTier,
  getSidebarSections,
  getAllComponents,
} from '@/lib/component-registry'
import type { ComponentDef } from '@/lib/component-registry'

// All 15 components expected in the registry, grouped by tier.
const EXPECTED_ATOMS = ['button', 'input', 'badge', 'separator', 'copy-button', 'toggle']
const EXPECTED_MOLECULES = ['card', 'table', 'callout', 'code-block', 'tabs', 'tooltip']
const EXPECTED_ORGANISMS = ['accordion', 'dialog', 'dropdown']

// Components with cva variant enums that must include a "Variants" code example.
const VARIANT_COMPONENTS = ['button', 'badge', 'toggle', 'callout']

// Multi-part components that must include a "Composition" code example showing sub-component usage.
const COMPOSITION_COMPONENTS = [
  'card',
  'table',
  'tabs',
  'tooltip',
  'accordion',
  'dialog',
  'dropdown',
]

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

  it('registry contains exactly 15 components', () => {
    expect(getAllComponents()).toHaveLength(15)
  })

  it('has 6 atoms, 6 molecules, and 3 organisms', () => {
    expect(getComponentsByTier('atoms')).toHaveLength(6)
    expect(getComponentsByTier('molecules')).toHaveLength(6)
    expect(getComponentsByTier('organisms')).toHaveLength(3)
  })

  it('has every expected atom slug registered', () => {
    const atoms = getComponentsByTier('atoms').map((c) => c.slug)
    EXPECTED_ATOMS.forEach((slug) => {
      expect(atoms).toContain(slug)
    })
  })

  it('has every expected molecule slug registered', () => {
    const molecules = getComponentsByTier('molecules').map((c) => c.slug)
    EXPECTED_MOLECULES.forEach((slug) => {
      expect(molecules).toContain(slug)
    })
  })

  it('has every expected organism slug registered', () => {
    const organisms = getComponentsByTier('organisms').map((c) => c.slug)
    EXPECTED_ORGANISMS.forEach((slug) => {
      expect(organisms).toContain(slug)
    })
  })

  it('every component has non-empty description, imports, props, codeExamples, and a11y', () => {
    const all = getAllComponents()
    all.forEach((c) => {
      expect(c.description.length).toBeGreaterThan(0)
      expect(c.imports.length).toBeGreaterThan(0)
      expect(c.imports).toMatch(/from ['"]artax-ui['"]/)
      expect(Array.isArray(c.props)).toBe(true)
      expect(c.props.length).toBeGreaterThan(0)
      expect(Array.isArray(c.codeExamples)).toBe(true)
      expect(c.codeExamples.length).toBeGreaterThan(0)
      expect(Array.isArray(c.a11y)).toBe(true)
      expect(c.a11y.length).toBeGreaterThan(0)
    })
  })

  it('every component has at least a "Basic" code example', () => {
    const all = getAllComponents()
    all.forEach((c) => {
      const labels = c.codeExamples.map((ex) => ex.label)
      expect(labels).toContain('Basic')
      // Each example must carry real code
      c.codeExamples.forEach((ex) => expect(ex.code.length).toBeGreaterThan(0))
    })
  })

  it('components with variants include a "Variants" code example', () => {
    VARIANT_COMPONENTS.forEach((slug) => {
      const comp = getAllComponents().find((c) => c.slug === slug)
      expect(comp).toBeDefined()
      const labels = comp!.codeExamples.map((ex) => ex.label)
      expect(labels).toContain('Variants')
    })
  })

  it('multi-part components include a "Composition" code example', () => {
    COMPOSITION_COMPONENTS.forEach((slug) => {
      const comp = getAllComponents().find((c) => c.slug === slug)
      expect(comp).toBeDefined()
      const labels = comp!.codeExamples.map((ex) => ex.label)
      expect(labels).toContain('Composition')
    })
  })

  it('every component has a preview function that returns a truthy ReactNode', () => {
    const all = getAllComponents()
    all.forEach((c) => {
      expect(typeof c.preview).toBe('function')
      const node = c.preview()
      // ReactNode can be many shapes; it must at minimum not be null or undefined
      expect(node).not.toBeNull()
      expect(node).not.toBeUndefined()
    })
  })

  it('every component slug is unique per tier', () => {
    const all = getAllComponents()
    const seen = new Set<string>()
    all.forEach((c) => {
      const key = `${c.tier}/${c.slug}`
      expect(seen.has(key)).toBe(false)
      seen.add(key)
    })
  })

  it('getComponent returns the right component for every registered pair', () => {
    getAllComponents().forEach((c) => {
      const found = getComponent(c.tier, c.slug)
      expect(found).toBeDefined()
      expect(found?.name).toBe(c.name)
    })
  })

  it('getComponent returns undefined for non-existent slug or tier', () => {
    expect(getComponent('atoms', 'does-not-exist')).toBeUndefined()
    expect(getComponent('unknown-tier', 'button')).toBeUndefined()
  })
})
