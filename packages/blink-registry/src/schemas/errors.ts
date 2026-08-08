// ABOUTME: Error code enum and structured error schema for the Blink system.
// ABOUTME: Provides consistent error typing across CLI and web app consumers.
import { z } from 'zod'

export const BlinkErrorCode = z.enum([
  'ARTIFACT_NOT_FOUND',
  'REGISTRY_UNREACHABLE',
  'MANIFEST_CORRUPT',
  'CHECKSUM_MISMATCH',
  'MARKER_BROKEN',
  'DEPENDENCY_MISSING'
])

export const BlinkErrorSchema = z.object({
  code: BlinkErrorCode,
  message: z.string(),
  slug: z.string().optional()
})

export type BlinkErrorCodeType = z.infer<typeof BlinkErrorCode>
export type BlinkError = z.infer<typeof BlinkErrorSchema>
