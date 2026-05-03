// ABOUTME: LINT-01 — validates MDX frontmatter against JSON Schema derived from DxFrontmatterSchema.
// ABOUTME: Uses Ajv 8 with z.toJSONSchema() output. Severity: error (blocks CI per D-06).

import Ajv, { type ValidateFunction } from 'ajv'
import addFormats from 'ajv-formats'
import { getDxJsonSchema } from 'blink-registry'
import type { LintDiagnostic, LintRule, LintContext } from '@/lint/types'

const ajv = new Ajv({ allErrors: true, strict: false, validateSchema: false, useDefaults: true })
addFormats(ajv)

const fixAjv = new Ajv({ allErrors: true, strict: false, useDefaults: true, validateSchema: false })
addFormats(fixAjv)

let cachedValidate: ValidateFunction | null = null
let cachedFixValidate: ValidateFunction | null = null

function getSchema(): object {
  const schema = getDxJsonSchema() as Record<string, unknown>
  // Remove $schema field — Ajv 8 core doesn't support draft-2020-12 meta-schema
  // but all validation keywords used (type, properties, required, default, pattern) are compatible
  const { $schema, ...rest } = schema
  return rest
}

function getValidator(): ValidateFunction {
  if (!cachedValidate) {
    cachedValidate = ajv.compile(getSchema())
  }
  return cachedValidate
}

function getFixValidator(): ValidateFunction {
  if (!cachedFixValidate) {
    cachedFixValidate = fixAjv.compile(getSchema())
  }
  return cachedFixValidate
}

export const frontmatterSchemaRule: LintRule = {
  name: 'frontmatter-schema',

  check(ctx: LintContext): LintDiagnostic[] {
    const validate = getValidator()
    const data = structuredClone(ctx.frontmatter)
    const valid = validate(data)

    if (valid) return []

    return (validate.errors ?? []).map((err) => ({
      file: ctx.file,
      severity: 'error' as const,
      rule: 'frontmatter-schema',
      message: `${err.instancePath || '/'}: ${err.message}`,
    }))
  },

  fix(ctx: LintContext): { frontmatter?: Record<string, unknown>; body?: string } | null {
    const validate = getFixValidator()
    const normalized = structuredClone(ctx.frontmatter)
    validate(normalized)

    // Check if defaults were applied (object changed)
    const changed = JSON.stringify(normalized) !== JSON.stringify(ctx.frontmatter)
    if (!changed) return null

    return { frontmatter: normalized as Record<string, unknown> }
  },
}
