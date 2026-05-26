// ABOUTME: Zod schemas for preview-token admin mutations (SEC-07)
// ABOUTME: TYP-05 (Phase 5) finishes long-tail admin schemas — this file covers SEC-07's first pass

import { z } from 'zod'

export const previewTokenCreateSchema = z.object({
  resourceType: z.string().min(1, 'resourceType is required'),
  resourceId: z.string().min(1, 'resourceId is required'),
  duration: z.string().optional(),
})

export type PreviewTokenCreateInput = z.infer<typeof previewTokenCreateSchema>
