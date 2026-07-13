// ABOUTME: Shared primitive Zod schemas used across all blink-registry domain schemas.
// ABOUTME: Defines artifact types, slug format, calendar versioning, merge strategies, and scopes.
import { z } from 'zod'

export const ARTIFACT_TYPES = ['config', 'skill', 'hook', 'guide'] as const
export const MERGE_STRATEGIES = ['replace', 'section'] as const

export const ArtifactTypeSchema = z.enum(ARTIFACT_TYPES)

export const SlugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)

export const CalVerSchema = z.string().regex(/^\d{4}\.\d{2}\.\d{2}\.\d+$/)

export const MergeStrategySchema = z.enum(MERGE_STRATEGIES)

export const ScopeSchema = z.enum(['project', 'global'])

export const Sha256HexSchema = z.string().regex(/^[a-f0-9]{64}$/)

export type ArtifactType = z.infer<typeof ArtifactTypeSchema>
export type Slug = z.infer<typeof SlugSchema>
export type CalVer = z.infer<typeof CalVerSchema>
export type MergeStrategy = z.infer<typeof MergeStrategySchema>
export type Scope = z.infer<typeof ScopeSchema>
export type Sha256Hex = z.infer<typeof Sha256HexSchema>
