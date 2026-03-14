// ABOUTME: Zod schemas for Blink registry API responses.
// ABOUTME: Defines the registry index listing and individual registry item shapes.
import { z } from 'zod'

import { ArtifactTypeSchema, CalVerSchema, SlugSchema } from './primitives'
import { ArtifactMetadataSchema } from './artifact'

export const RegistryItemSchema = z.object({
  slug: SlugSchema,
  name: z.string(),
  type: ArtifactTypeSchema,
  version: CalVerSchema,
  description: z.string(),
})

export const RegistryIndexSchema = z.object({
  items: z.array(RegistryItemSchema),
  generatedAt: z.string().datetime(),
})

export const RegistryArtifactSchema = ArtifactMetadataSchema

export type RegistryItem = z.infer<typeof RegistryItemSchema>
export type RegistryIndex = z.infer<typeof RegistryIndexSchema>
export type RegistryArtifact = z.infer<typeof RegistryArtifactSchema>
