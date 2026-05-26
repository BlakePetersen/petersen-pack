// ABOUTME: Zod schemas for client-gallery admin mutations (SEC-07)
// ABOUTME: Form-side schema lives in client-gallery.ts; this file covers admin API body shapes

import { z } from 'zod'

export const clientGalleryCreateApiSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  clientName: z.string().min(1, 'Client name is required').max(100),
  clientEmail: z.string().min(1, 'Email is required').email(),
  password: z.string().max(100).optional(),
  expiresInDays: z
    .union([
      z.string().refine(
        (val) => {
          const n = Number(val)
          return Number.isFinite(n) && n >= 0
        },
        { message: 'Must be a non-negative number' }
      ),
      z.coerce.number().int().min(0),
    ])
    .optional(),
})

export const clientGalleryUpdateApiSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  slug: z.string().min(1).max(200).optional(),
  expiresAt: z.union([z.coerce.date(), z.null()]).optional(),
  password: z.union([z.string().max(100), z.null()]).optional(),
  status: z.string().min(1).optional(),
  clientId: z.string().min(1).optional(),
})

export const clientGalleryReorderSchema = z.object({
  imageIds: z.array(z.string().min(1)).min(0),
})

export const clientGallerySendEmailSchema = z.object({
  clientName: z.string().min(1, 'clientName is required'),
  clientEmail: z.string().email('clientEmail must be valid'),
  galleryTitle: z.string().min(1, 'galleryTitle is required'),
  galleryUrl: z.string().min(1, 'galleryUrl is required'),
  password: z.string().optional(),
  expiresAt: z
    .union([z.coerce.date(), z.string(), z.null()])
    .nullish()
    .transform((v) => {
      if (v == null) return null
      if (v instanceof Date) return v
      const d = new Date(v)
      return Number.isNaN(d.getTime()) ? null : d
    }),
  imageCount: z.coerce.number().int().min(0).optional(),
})

export type ClientGalleryCreateApiInput = z.infer<
  typeof clientGalleryCreateApiSchema
>
export type ClientGalleryUpdateApiInput = z.infer<
  typeof clientGalleryUpdateApiSchema
>
export type ClientGalleryReorderInput = z.infer<
  typeof clientGalleryReorderSchema
>
export type ClientGallerySendEmailInput = z.infer<
  typeof clientGallerySendEmailSchema
>
