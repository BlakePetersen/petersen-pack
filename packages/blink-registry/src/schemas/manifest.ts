// ABOUTME: Zod schemas for the local Blink manifest that tracks installed artifacts.
// ABOUTME: Defines per-file checksum tracking and scoped artifact entries.
import { z } from 'zod'

import {
  ArtifactTypeSchema,
  CalVerSchema,
  MergeStrategySchema,
  ScopeSchema,
  SlugSchema
} from './primitives.ts'

export const ManifestFileEntrySchema = z.object({
  path: z.string(),
  checksum: z.string(),
  merge: MergeStrategySchema
})

export const ManifestEntrySchema = z.object({
  slug: SlugSchema,
  name: z.string(),
  type: ArtifactTypeSchema,
  version: CalVerSchema,
  scope: ScopeSchema,
  installedAt: z.string().datetime(),
  files: z.array(ManifestFileEntrySchema)
})

export const ManifestSchema = z.object({
  version: z.literal(1),
  items: z.array(ManifestEntrySchema)
})

export type ManifestFileEntry = z.infer<typeof ManifestFileEntrySchema>
export type ManifestEntry = z.infer<typeof ManifestEntrySchema>
export type Manifest = z.infer<typeof ManifestSchema>
