// ABOUTME: Client-gallery image upload POST — composed wrapper chain per SEC-07
// ABOUTME: Multipart formData (no withValidation); audit row inside $transaction (D-10)

import { NextResponse, type NextRequest } from 'next/server'
import { withRequestContext } from '@/lib/request-context'
import {
  withRateLimit,
  withCsrf,
  withAdminAuth,
  withAudit,
} from '@/lib/wrappers'
import { prisma } from '@/lib/prisma'
import { AuditResourceType } from '@prisma/client'
import sharp from 'sharp'
import { put } from '@vercel/blob'
import { logger } from '@/lib/logger'
import { env } from '@/lib/env'

if (!process.env.BLOB_READ_WRITE_TOKEN && env.LUNA_READ_WRITE_TOKEN) {
  process.env.BLOB_READ_WRITE_TOKEN = env.LUNA_READ_WRITE_TOKEN
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: galleryId } = await params
  const handler = withRequestContext(
    withRateLimit(
      'admin',
      withCsrf(
        withAdminAuth(
          withAudit('client_gallery.upload_image', async (req, ctx) => {
            try {
              logger.info({ galleryId }, 'Uploading to client gallery')
              const formData = await req.formData()
              const file = formData.get('file') as File | null

              if (!file) {
                logger.warn('client_gallery.upload.missing_file')
                return NextResponse.json(
                  { error: 'Missing file' },
                  { status: 400 }
                )
              }

              logger.info(
                { name: file.name, size: file.size },
                'upload.file_received'
              )

              const gallery = await prisma.clientGallery.findUnique({
                where: { id: galleryId },
              })
              if (!gallery) {
                logger.warn({ galleryId }, 'client_gallery.not_found')
                return NextResponse.json(
                  { error: 'Client gallery not found' },
                  { status: 404 }
                )
              }

              const bytes = await file.arrayBuffer()
              const buffer = Buffer.from(bytes)
              const image = sharp(buffer)
              const optimizedBuffer = await image
                .resize(4800, 4800, {
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
              const blobPath = `images/client-gallery/${galleryId}/${timestamp}-${baseFilename}.webp`
              const blob = await put(blobPath, optimizedBuffer, {
                access: 'public',
                addRandomSuffix: false,
              })

              const lastImage = await prisma.clientImage.findFirst({
                where: { clientGalleryId: galleryId },
                orderBy: { sortOrder: 'desc' },
              })
              const sortOrder = lastImage ? lastImage.sortOrder + 1 : 0

              return await prisma.$transaction(async (tx) => {
                const imageRecord = await tx.clientImage.create({
                  data: {
                    url: blob.url,
                    altText: file.name.replace(/\.[^/.]+$/, ''),
                    width: optimizedMetadata.width || null,
                    height: optimizedMetadata.height || null,
                    clientGalleryId: galleryId,
                    sortOrder,
                  },
                })
                await tx.auditLog.create({
                  data: {
                    actorId: ctx.actorId!,
                    actorRole: ctx.actorRole!,
                    actorEmail: ctx.actorEmail ?? '',
                    action: 'client_gallery.upload_image',
                    resourceType: AuditResourceType.CLIENT_GALLERY,
                    resourceId: galleryId,
                    requestId: ctx.requestId,
                    ip: ctx.ip,
                    ua: ctx.ua,
                    metadata: {
                      imageId: imageRecord.id,
                      filename: file.name,
                      bytes: file.size,
                    },
                    afterJson: {
                      imageId: imageRecord.id,
                      url: imageRecord.url,
                    },
                  },
                })
                logger.info({ imageId: imageRecord.id }, 'upload.success')
                return NextResponse.json(imageRecord, { status: 201 })
              })
            } catch (error) {
              logger.error(
                { err: error },
                'Error uploading client gallery image'
              )
              const errorMessage =
                error instanceof Error
                  ? error.message
                  : 'Failed to upload image'
              return NextResponse.json({ error: errorMessage }, { status: 500 })
            }
          })
        )
      )
    )
  )
  return handler(request)
}
