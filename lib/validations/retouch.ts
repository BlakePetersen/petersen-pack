// ABOUTME: Zod schemas for retouch-request admin mutations (SEC-07)
// ABOUTME: TYP-05 (Phase 5) finishes long-tail admin schemas — this file covers SEC-07's first pass

import { z } from 'zod'

const retouchStatusSchema = z.enum([
  'PENDING',
  'IN_PROGRESS',
  'COMPLETED',
  'DECLINED',
])

export const retouchStatusUpdateSchema = z.object({
  status: retouchStatusSchema,
})

export type RetouchStatus = z.infer<typeof retouchStatusSchema>
export type RetouchStatusUpdateInput = z.infer<typeof retouchStatusUpdateSchema>
