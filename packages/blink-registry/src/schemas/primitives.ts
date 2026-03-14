// ABOUTME: Shared primitive Zod schemas used across all blink-registry domain schemas.
// ABOUTME: Defines artifact types, slug format, calendar versioning, merge strategies, and scopes.
import { z } from 'zod'

export const ArtifactTypeSchema = z.enum(['config', 'skill', 'hook'])

export const SlugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)

export const CalVerSchema = z.string().regex(/^\d{4}\.\d{2}\.\d{2}\.\d+$/)

export const MergeStrategySchema = z.enum(['replace', 'section'])

export const ScopeSchema = z.enum(['project', 'global'])

export type ArtifactType = z.infer<typeof ArtifactTypeSchema>
export type Slug = z.infer<typeof SlugSchema>
export type CalVer = z.infer<typeof CalVerSchema>
export type MergeStrategy = z.infer<typeof MergeStrategySchema>
export type Scope = z.infer<typeof ScopeSchema>
