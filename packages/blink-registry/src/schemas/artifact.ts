// ABOUTME: Zod schemas for artifact metadata and individual artifact files.
// ABOUTME: Defines the shape of artifacts distributed through the Blink registry.
import { z } from 'zod'

import {
  ArtifactTypeSchema,
  CalVerSchema,
  MergeStrategySchema,
  SlugSchema
} from './primitives.ts'

export const ArtifactFileSchema = z.object({
  path: z.string(),
  content: z.string(),
  merge: MergeStrategySchema
})

export const ArtifactMetadataSchema = z.object({
  slug: SlugSchema,
  name: z.string(),
  type: ArtifactTypeSchema,
  version: CalVerSchema,
  description: z.string(),
  files: z.array(ArtifactFileSchema),
  dependencies: z.array(SlugSchema).optional(),
  devDependencies: z.record(z.string(), z.string()).optional()
})

export type ArtifactFile = z.infer<typeof ArtifactFileSchema>
export type ArtifactMetadata = z.infer<typeof ArtifactMetadataSchema>
