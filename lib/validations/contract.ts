// ABOUTME: Zod validation schemas for contract creation and updates
// ABOUTME: Used in admin forms and API routes

import { z } from 'zod'

export const contractFormSchema = z.object({
  // Client
  clientId: z.string().min(1, 'Client is required'),
  inquiryId: z.string().optional(),
  bookingId: z.string().optional(),

  // Shoot details
  shootType: z.string().min(1, 'Shoot type is required'),
  shootDate: z.coerce.date(),
  shootLocation: z.string().min(1, 'Location is required'),
  sessionDuration: z.string().min(1, 'Duration is required'),
  deliverablesDescription: z
    .string()
    .min(1, 'Deliverables description is required'),

  // Pricing
  totalAmount: z.coerce.number().positive('Total must be positive'),
  depositAmount: z.coerce.number().positive('Deposit must be positive'),
  retouchesIncluded: z.coerce.number().int().min(0),
  pricePerExtraRetouch: z.coerce.number().int().min(0),
  downloadQuota: z.coerce
    .number()
    .int()
    .positive('Download quota must be positive'),
  maxFileSizePx: z.coerce.number().int().positive(),

  // Usage rights
  usageRightIds: z.array(z.string()).min(1, 'Select at least one usage right'),
})

const signContractSchema = z.object({
  signatureType: z.enum(['TYPED', 'DRAWN']),
  signatureData: z.string().min(1, 'Signature is required'),
})

export type ContractFormInput = z.infer<typeof contractFormSchema>
export type SignContractInput = z.infer<typeof signContractSchema>
