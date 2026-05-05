// ABOUTME: Retouch-request approve admin POST — composed wrapper chain per SEC-07
// ABOUTME: Multipart formData parse inline (no withValidation); audit row inside $transaction (D-10)

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
import { sendRetouchStatusEmail } from '@/lib/email'
import { put } from '@vercel/blob'
import sharp from 'sharp'
import { logger } from '@/lib/logger'
import { env } from '@/lib/env'

if (!process.env.BLOB_READ_WRITE_TOKEN && env.LUNA_READ_WRITE_TOKEN) {
  process.env.BLOB_READ_WRITE_TOKEN = env.LUNA_READ_WRITE_TOKEN
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const handler = withRequestContext(
    withRateLimit(
      'admin',
      withCsrf(
        withAdminAuth(
          withAudit('retouch_request.approve', async (req, ctx) => {
            try {
              let retouchedImageUrl: string | null = null

              const contentType = req.headers.get('content-type') || ''
              if (contentType.includes('multipart/form-data')) {
                const formData = await req.formData()
                const file = formData.get('file') as File | null
                if (file) {
                  const bytes = await file.arrayBuffer()
                  const buffer = Buffer.from(bytes)
                  const optimizedBuffer = await sharp(buffer)
                    .resize(4800, 4800, {
                      fit: 'inside',
                      withoutEnlargement: true,
                    })
                    .webp({ quality: 90 })
                    .toBuffer()
                  const timestamp = Date.now()
                  const baseFilename = file.name
                    .replace(/\.[^/.]+$/, '')
                    .replace(/[^a-zA-Z0-9.-]/g, '_')
                  const blobPath = `images/retouched/${id}/${timestamp}-${baseFilename}.webp`
                  const blob = await put(blobPath, optimizedBuffer, {
                    access: 'public',
                    addRandomSuffix: false,
                  })
                  retouchedImageUrl = blob.url
                }
              }

              const retouchRequest = await prisma.retouchRequest.findUnique({
                where: { id },
                include: {
                  clientImage: {
                    include: {
                      clientGallery: { include: { client: true } },
                    },
                  },
                },
              })
              if (!retouchRequest) {
                return NextResponse.json(
                  { error: 'Retouch request not found' },
                  { status: 404 }
                )
              }

              const updatedRequest = await prisma.$transaction(async (tx) => {
                const updated = await tx.retouchRequest.update({
                  where: { id },
                  data: {
                    status: 'COMPLETED',
                    resolvedAt: new Date(),
                    resolvedById: ctx.actorId!,
                    retouchedImageUrl,
                  },
                })
                if (retouchedImageUrl) {
                  await tx.clientImage.update({
                    where: { id: retouchRequest.clientImageId },
                    data: { url: retouchedImageUrl },
                  })
                }
                await tx.auditLog.create({
                  data: {
                    actorId: ctx.actorId!,
                    actorRole: ctx.actorRole!,
                    actorEmail: ctx.actorEmail ?? '',
                    action: 'retouch_request.approve',
                    resourceType: AuditResourceType.CLIENT_GALLERY,
                    resourceId: id,
                    requestId: ctx.requestId,
                    ip: ctx.ip,
                    ua: ctx.ua,
                    metadata: {
                      clientImageId: retouchRequest.clientImageId,
                      retouchedImageUploaded: retouchedImageUrl !== null,
                    },
                    beforeJson: { status: retouchRequest.status },
                    afterJson: {
                      status: updated.status,
                      retouchedImageUrl,
                    },
                  },
                })
                return updated
              })

              const completedCount = await prisma.retouchRequest.count({
                where: {
                  clientGalleryId: retouchRequest.clientGalleryId,
                  status: 'COMPLETED',
                },
              })

              const gallery = retouchRequest.clientImage.clientGallery
              if (gallery) {
                const baseUrl =
                  env.NEXT_PUBLIC_APP_URL || 'http://localhost:3333'
                await sendRetouchStatusEmail({
                  clientName: gallery.client.name || 'Valued Client',
                  clientEmail: gallery.client.email,
                  galleryTitle: gallery.title,
                  galleryUrl: `${baseUrl}/client/${gallery.slug}`,
                  imageCount: completedCount,
                  status: 'COMPLETED',
                })
              }

              return NextResponse.json(updatedRequest)
            } catch (error) {
              logger.error({ err: error }, 'Retouch approval error')
              return NextResponse.json(
                { error: 'Failed to approve retouch request' },
                { status: 500 }
              )
            }
          })
        )
      )
    )
  )
  return handler(request)
}
