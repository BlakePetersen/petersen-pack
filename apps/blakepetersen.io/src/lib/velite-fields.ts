// ABOUTME: Side-effect-free Velite dxFields map, rebuilt from blink-registry's canonical
// ABOUTME: const arrays/regex so velite.config.ts and the schema-parity test share one source.
import { s } from 'velite'
import { DX_COLLECTIONS, VOICE_PRIMITIVES, crossRefRegex } from 'blink-registry'

// Cross-references in `dependencies` and `related` must be of shape
// `<dx-collection>/<slug-path>`. Catches typos like 'skill/foo' (singular) or
// 'foo' (no collection prefix) at frontmatter-parse time, before the cross-ref
// validator's existence check runs in the prepare hook.
export const CrossRefSchema = s
  .string()
  .regex(
    crossRefRegex(DX_COLLECTIONS),
    `must be '<collection>/<slug-path>' where collection is one of: ${DX_COLLECTIONS.join(', ')}`
  )

// Shared fields for DX content types (skills, hooks, configs, guides)
export const dxFields = {
  title: s.string().max(120),
  description: s.string().max(260),
  applies_to: s.array(s.string()),
  dependencies: s.array(CrossRefSchema).default([]),
  order: s.number().optional(),
  draft: s.boolean().default(false),
  tags: s.array(s.string()).default([]),
  voice: s.array(s.enum([...VOICE_PRIMITIVES])).default([]),
  requires_artifact: s.boolean().default(false),
  category: s.string().optional(),
  decisions: s
    .array(s.object({ choice: s.string(), rationale: s.string() }))
    .default([]),
  related: s.array(CrossRefSchema).default([]),
  updated_context: s.isodate().optional()
}
