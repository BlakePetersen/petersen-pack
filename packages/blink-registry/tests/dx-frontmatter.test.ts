// ABOUTME: Tests for DxFrontmatterSchema — Zod 4 schema mirroring Velite dxFields.
// ABOUTME: Validates acceptance, rejection, defaults, and JSON Schema derivation.
import {
  DxFrontmatterSchema,
  getDxJsonSchema,
  DX_COLLECTIONS,
} from '../src/index'

describe('DxFrontmatterSchema', () => {
  const validSkillFrontmatter = {
    title: 'Writing Custom Claude Code Skills',
    description: 'How to structure SKILL.md files for effective AI assistance',
    applies_to: ['claude-code'],
  }

  it('accepts valid skill frontmatter with all required fields', () => {
    const result = DxFrontmatterSchema.safeParse(validSkillFrontmatter)
    expect(result.success).toBe(true)
  })

  it('rejects frontmatter missing required field title', () => {
    const result = DxFrontmatterSchema.safeParse({
      description: 'Some description',
      applies_to: ['test'],
    })
    expect(result.success).toBe(false)
  })

  it('applies correct defaults for optional fields', () => {
    const result = DxFrontmatterSchema.safeParse(validSkillFrontmatter)
    expect(result.success).toBe(true)
    if (!result.success) return

    expect(result.data.voice).toEqual([])
    expect(result.data.requires_artifact).toBe(false)
    expect(result.data.tags).toEqual([])
    expect(result.data.dependencies).toEqual([])
    expect(result.data.decisions).toEqual([])
    expect(result.data.related).toEqual([])
    expect(result.data.draft).toBe(false)
  })

  it('rejects invalid voice value', () => {
    const result = DxFrontmatterSchema.safeParse({
      ...validSkillFrontmatter,
      voice: ['not-a-voice'],
    })
    expect(result.success).toBe(false)
  })
})

describe('getDxJsonSchema', () => {
  it('returns a valid JSON Schema object with type object and all dxFields keys', () => {
    const jsonSchema = getDxJsonSchema()
    expect(jsonSchema.type).toBe('object')
    expect(jsonSchema.properties).toBeDefined()

    const expectedKeys = [
      'title',
      'description',
      'applies_to',
      'dependencies',
      'order',
      'draft',
      'tags',
      'voice',
      'requires_artifact',
      'category',
      'decisions',
      'related',
      'updated_context',
    ]
    for (const key of expectedKeys) {
      expect(jsonSchema.properties).toHaveProperty(key)
    }
  })
})

describe('DX_COLLECTIONS', () => {
  it("is exactly ['skills', 'hooks', 'configs', 'guides'] in that order", () => {
    expect(DX_COLLECTIONS).toEqual(['skills', 'hooks', 'configs', 'guides'])
  })
})
