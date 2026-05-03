// ABOUTME: Zod 4 schema mirroring Velite dxFields for CLI tooling (scaffold defaults, lint validation).
// ABOUTME: Fields frozen per v1.4-PLAN-02 — any change here must be reflected in velite.config.ts dxFields.
import { z } from 'zod'

/**
 * DX collection names — single source of truth shared with velite.config.ts.
 * Order: skills, hooks, configs, guides (matches Velite definition).
 */
export const DX_COLLECTIONS = ['skills', 'hooks', 'configs', 'guides'] as const

/**
 * Cross-reference format: `<collection>/<slug-path>`.
 * Mirrors the CrossRefSchema in velite.config.ts but uses project Zod (not Velite's `s`).
 */
const CrossRefSchema = z
  .string()
  .regex(
    new RegExp(`^(${DX_COLLECTIONS.join('|')})/[a-z0-9-]+(/[a-z0-9-]+)*$`),
  )

/**
 * Canonical schema for DX content frontmatter — mirrors the dxFields block
 * in apps/blakepetersen.io/velite.config.ts line-for-line.
 */
export const DxFrontmatterSchema = z.object({
  title: z.string().max(120),
  description: z.string().max(260),
  applies_to: z.array(z.string()),
  dependencies: z.array(CrossRefSchema).default([]),
  order: z.number().optional(),
  draft: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  voice: z.array(z.enum(['author-note', 'decision-rationale'])).default([]),
  requires_artifact: z.boolean().default(false),
  category: z.string().optional(),
  decisions: z
    .array(z.object({ choice: z.string(), rationale: z.string() }))
    .default([]),
  related: z.array(CrossRefSchema).default([]),
  updated_context: z.string().optional(),
})

export type DxFrontmatter = z.infer<typeof DxFrontmatterSchema>

/**
 * Derives a JSON Schema (draft-2020-12) from DxFrontmatterSchema.
 * Used by `blink lint` for frontmatter validation via Ajv.
 */
export function getDxJsonSchema() {
  return z.toJSONSchema(DxFrontmatterSchema)
}
