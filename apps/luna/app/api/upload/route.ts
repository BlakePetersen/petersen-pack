// ABOUTME: Image upload API — withAdminAuth + file-type magic-byte MIME sniff (SEC-05)
// ABOUTME: Handler-trusted file.type rejected; sharp+Vercel Blob pipeline preserved

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import sharp from 'sharp'
import { put } from '@vercel/blob'
import { fileTypeFromBuffer } from 'file-type'
import { withRequestContext } from '@/lib/request-context'
import {
  withRateLimit,
  withCsrf,
  withAdminAuth,
  withAudit,
} from '@/lib/wrappers'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { env } from '@/lib/env'

// Vercel Blob SDK reads BLOB_READ_WRITE_TOKEN from process.env; mirror
// LUNA_READ_WRITE_TOKEN into that slot when the canonical name is unset.
if (!process.env.BLOB_READ_WRITE_TOKEN && env.LUNA_READ_WRITE_TOKEN) {
  process.env.BLOB_READ_WRITE_TOKEN = env.LUNA_READ_WRITE_TOKEN
}

// Magic-byte allowlist — sniffed via file-type, NOT trusted from file.type
// (Pre-SEC-05 the route accepted any file whose header CLAIMED these MIMEs.)
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/tiff',
  'image/avif',
] as const

const MAX_FILE_BYTES = 25 * 1024 * 1024 // 25 MiB; matches existing implicit cap

function validateCropValue(
  value: string | null,
  fieldName: string
): number | null {
  if (!value) return null
  const num = parseFloat(value)
  if (isNaN(num) || num < 0 || num > 1) {
    throw new Error(`${fieldName} must be between 0 and 1`)
  }
  return num
}

export const POST = withRequestContext(
  withRateLimit(
    'admin',
    withCsrf(
      withAdminAuth(
        withAudit('upload.create', async (request: NextRequest) => {
          try {
            const formData = await request.formData()
            const file = formData.get('file')
            const galleryId = formData.get('galleryId') as string | null
            const type = formData.get('type') as string | null

            if (!(file instanceof File)) {
              return NextResponse.json(
                { error: 'Missing file' },
                { status: 400 }
              )
            }

            if (file.size > MAX_FILE_BYTES) {
              return NextResponse.json(
                { error: 'file_too_large' },
                { status: 413 }
              )
            }

            // Read full buffer, then sniff magic bytes. file-type only needs the first
            // ~4100 bytes for image formats but we already need the full buffer for sharp.
            const bytes = await file.arrayBuffer()
            const buffer = Buffer.from(bytes)

            const detected = await fileTypeFromBuffer(buffer)
            if (
              !detected ||
              !ALLOWED_MIME_TYPES.includes(
                detected.mime as (typeof ALLOWED_MIME_TYPES)[number]
              )
            ) {
              logger.warn(
                {
                  detectedMime: detected?.mime,
                  claimedMime: file.type,
                  size: file.size,
                  filename: file.name,
                },
                'upload.invalid_file_type'
              )
              return NextResponse.json(
                { error: 'invalid_file_type' },
                { status: 400 }
              )
            }

            // If galleryId is provided, verify gallery exists
            if (galleryId) {
              const gallery = await prisma.gallery.findUnique({
                where: { id: galleryId },
              })

              if (!gallery) {
                return NextResponse.json(
                  { error: 'Gallery not found' },
                  { status: 404 }
                )
              }
            }

            // Process image with sharp (preserved from pre-SEC-05 implementation)
            const image = sharp(buffer)
            const maxSize = type === 'hero' ? 3840 : 2400
            const optimizedBuffer = await image
              .resize(maxSize, maxSize, {
                fit: 'inside',
                withoutEnlargement: true,
              })
              .webp({ quality: 85 })
              .toBuffer()

            const optimizedMetadata = await sharp(optimizedBuffer).metadata()

            const timestamp = Date.now()
            const baseFilename = file.name
              .replace(/\.[^/.]+$/, '')
              .replace(/[^a-zA-Z0-9.-]/g, '_')
            const blobPath =
              type === 'hero'
                ? `images/hero/${timestamp}-${baseFilename}.webp`
                : type === 'general'
                  ? `images/general/${timestamp}-${baseFilename}.webp`
                  : galleryId
                    ? `images/gallery/${galleryId}/${timestamp}-${baseFilename}.webp`
                    : `images/standalone/${timestamp}-${baseFilename}.webp`

            const blob = await put(blobPath, optimizedBuffer, {
              access: 'public',
              addRandomSuffix: false,
            })

            // For hero and general images, just return the URL
            if (type === 'hero' || type === 'general') {
              return NextResponse.json({ url: blob.url }, { status: 201 })
            }

            // Create database record for gallery or standalone images
            const imageRecord = await prisma.image.create({
              data: {
                url: blob.url,
                altText: file.name.replace(/\.[^/.]+$/, ''),
                width: optimizedMetadata.width || null,
                height: optimizedMetadata.height || null,
                focalX:
                  validateCropValue(
                    formData.get('focalX') as string | null,
                    'focalX'
                  ) ?? 0.5,
                focalY:
                  validateCropValue(
                    formData.get('focalY') as string | null,
                    'focalY'
                  ) ?? 0.5,
                cropX: validateCropValue(
                  formData.get('cropX') as string | null,
                  'cropX'
                ),
                cropY: validateCropValue(
                  formData.get('cropY') as string | null,
                  'cropY'
                ),
                cropWidth: validateCropValue(
                  formData.get('cropWidth') as string | null,
                  'cropWidth'
                ),
                cropHeight: validateCropValue(
                  formData.get('cropHeight') as string | null,
                  'cropHeight'
                ),
                cropAspectRatio:
                  (formData.get('cropAspectRatio') as string) || null,
                galleryId: galleryId || null,
              },
            })

            return NextResponse.json(imageRecord, { status: 201 })
          } catch (error) {
            logger.error({ err: error }, 'Error uploading image')
            return NextResponse.json(
              { error: 'Failed to upload image' },
              { status: 500 }
            )
          }
        })
      )
    )
  )
)
