// ABOUTME: Zod schemas for inquiry admin mutations (SEC-07)
// ABOUTME: TYP-05 (Phase 5) finishes long-tail admin schemas — this file covers SEC-07's first pass

import { z } from 'zod'

const inquiryStatusSchema = z.enum(['NEW', 'CONTACTED', 'CONVERTED', 'CLOSED'])

export const inquiryUpdateSchema = z.object({
  status: inquiryStatusSchema,
})

export type InquiryStatus = z.infer<typeof inquiryStatusSchema>
export type InquiryUpdateInput = z.infer<typeof inquiryUpdateSchema>
