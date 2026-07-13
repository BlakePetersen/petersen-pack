// ABOUTME: Zod 4 schema mirroring Velite dxFields for CLI tooling (scaffold defaults, lint validation).
// ABOUTME: Fields frozen per v1.4-PLAN-02 — any change here must be reflected in velite.config.ts dxFields.
import { z } from 'zod'

/**
 * DX collection names — single source of truth shared with velite.config.ts.
 * Order: skills, hooks, configs, guides (matches Velite definition).
 */
export const DX_COLLECTIONS = ['skills', 'hooks', 'configs', 'guides'] as const

/**
 * Builds the anchored cross-reference regex for a set of collections.
 * Shared with velite.config.ts (rebuilt via Velite's `s`) so both validators
 * derive the SAME pattern from one source. Keep `^…$` / `[a-z0-9-]` intact —
 * a path-traversal-shaped slug (`../`, `/`) cannot match.
 */
export function crossRefRegex(collections: readonly string[]): RegExp {
  return new RegExp(`^(${collections.join('|')})/[a-z0-9-]+(/[a-z0-9-]+)*$`)
}

/**
 * Cross-reference format: `<collection>/<slug-path>`.
 * Mirrors the CrossRefSchema in velite.config.ts but uses project Zod (not Velite's `s`).
 */
const CrossRefSchema = z.string().regex(crossRefRegex(DX_COLLECTIONS))

/**
 * Voice primitives — single source of truth shared with velite.config.ts.
 * Order matters: velite rebuilds `s.enum([...VOICE_PRIMITIVES])`.
 */
export const VOICE_PRIMITIVES = ['author-note', 'decision-rationale'] as const
export const VoiceSchema = z.enum(VOICE_PRIMITIVES)
export type Voice = z.infer<typeof VoiceSchema>

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
  voice: z.array(VoiceSchema).default([]),
  requires_artifact: z.boolean().default(false),
  category: z.string().optional(),
  decisions: z
    .array(z.object({ choice: z.string(), rationale: z.string() }))
    .default([]),
  related: z.array(CrossRefSchema).default([]),
  updated_context: z.iso.date().optional(),
})

export type DxFrontmatter = z.infer<typeof DxFrontmatterSchema>

/**
 * Derives a JSON Schema (draft-2020-12) from DxFrontmatterSchema.
 * Used by `blink lint` for frontmatter validation via Ajv.
 */
export function getDxJsonSchema() {
  return z.toJSONSchema(DxFrontmatterSchema)
}
