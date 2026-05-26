// ABOUTME: Zod validation schema for gallery creation and editing
// ABOUTME: Used in GalleryForm component and gallery API routes

import { z } from 'zod'
import { slugSchema } from './common'

export const galleryFormSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be 200 characters or less'),
  slug: slugSchema,
  description: z
    .string()
    .max(1000, 'Description must be 1000 characters or less')
    .optional()
    .or(z.literal('')),
  featured: z.boolean(),
})

export type GalleryFormInput = z.infer<typeof galleryFormSchema>
