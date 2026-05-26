// ABOUTME: Hero-slide [id] admin PUT/PATCH/DELETE — composed wrapper chain per SEC-07
// ABOUTME: Audit row inside $transaction (D-10)

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
import { logger } from '@/lib/logger'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const handler = withRequestContext(
    withRateLimit(
      'admin',
      withCsrf(
        withAdminAuth(
          withAudit('hero_slide.update', async (req, ctx) => {
            try {
              const data = await req.json()
              const {
                title,
                galleryId,
                imageId,
                imageUrl,
                mobileImageUrl,
                focalX,
                focalY,
                mobileFocalX,
                mobileFocalY,
                cropX,
                cropY,
                cropWidth,
                cropHeight,
                cropAspectRatio,
                linkUrl,
                linkText,
                sortOrder,
                isActive,
              } = data
              if (!title || sortOrder === undefined) {
                return NextResponse.json(
                  { error: 'Missing required fields' },
                  { status: 400 }
                )
              }
              if (!galleryId && !imageId && !imageUrl) {
                return NextResponse.json(
                  { error: 'Must provide gallery, image, or image URL' },
                  { status: 400 }
                )
              }
              return await prisma.$transaction(async (tx) => {
                const slide = await tx.heroSlide.update({
                  where: { id },
                  data: {
                    title,
                    galleryId: galleryId || null,
                    imageId: imageId || null,
                    imageUrl: imageUrl || null,
                    mobileImageUrl: mobileImageUrl || null,
                    focalX: focalX !== undefined ? parseFloat(focalX) : 0.5,
                    focalY: focalY !== undefined ? parseFloat(focalY) : 0.5,
                    mobileFocalX:
                      mobileFocalX !== undefined
                        ? parseFloat(mobileFocalX)
                        : 0.5,
                    mobileFocalY:
                      mobileFocalY !== undefined
                        ? parseFloat(mobileFocalY)
                        : 0.5,
                    cropX: cropX !== undefined ? parseFloat(cropX) : null,
                    cropY: cropY !== undefined ? parseFloat(cropY) : null,
                    cropWidth:
                      cropWidth !== undefined ? parseFloat(cropWidth) : null,
                    cropHeight:
                      cropHeight !== undefined ? parseFloat(cropHeight) : null,
                    cropAspectRatio: cropAspectRatio || null,
                    linkUrl: linkUrl || null,
                    linkText: linkText || null,
                    sortOrder: parseInt(sortOrder),
                    isActive: isActive ?? true,
                  },
                })
                await tx.auditLog.create({
                  data: {
                    actorId: ctx.actorId!,
                    actorRole: ctx.actorRole!,
                    actorEmail: ctx.actorEmail ?? '',
                    action: 'hero_slide.update',
                    resourceType: AuditResourceType.GALLERY,
                    resourceId: id,
                    requestId: ctx.requestId,
                    ip: ctx.ip,
                    ua: ctx.ua,
                    metadata: { title },
                    afterJson: { id: slide.id, title: slide.title },
                  },
                })
                return NextResponse.json(slide)
              })
            } catch (error) {
              logger.error({ err: error }, 'Error updating hero slide')
              return NextResponse.json(
                { error: 'Internal server error' },
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const handler = withRequestContext(
    withRateLimit(
      'admin',
      withCsrf(
        withAdminAuth(
          withAudit('hero_slide.patch', async (req, ctx) => {
            try {
              const data = await req.json()
              return await prisma.$transaction(async (tx) => {
                const slide = await tx.heroSlide.update({
                  where: { id },
                  data,
                })
                await tx.auditLog.create({
                  data: {
                    actorId: ctx.actorId!,
                    actorRole: ctx.actorRole!,
                    actorEmail: ctx.actorEmail ?? '',
                    action: 'hero_slide.patch',
                    resourceType: AuditResourceType.GALLERY,
                    resourceId: id,
                    requestId: ctx.requestId,
                    ip: ctx.ip,
                    ua: ctx.ua,
                    metadata: { fields: Object.keys(data) },
                    afterJson: { id: slide.id },
                  },
                })
                return NextResponse.json(slide)
              })
            } catch (error) {
              logger.error({ err: error }, 'Error updating hero slide')
              return NextResponse.json(
                { error: 'Internal server error' },
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const handler = withRequestContext(
    withRateLimit(
      'admin',
      withCsrf(
        withAdminAuth(
          withAudit('hero_slide.delete', async (_req, ctx) => {
            try {
              const existing = await prisma.heroSlide.findUnique({
                where: { id },
              })
              if (!existing) {
                return NextResponse.json(
                  { error: 'Hero slide not found' },
                  { status: 404 }
                )
              }
              return await prisma.$transaction(async (tx) => {
                await tx.heroSlide.delete({ where: { id } })
                await tx.auditLog.create({
                  data: {
                    actorId: ctx.actorId!,
                    actorRole: ctx.actorRole!,
                    actorEmail: ctx.actorEmail ?? '',
                    action: 'hero_slide.delete',
                    resourceType: AuditResourceType.GALLERY,
                    resourceId: id,
                    requestId: ctx.requestId,
                    ip: ctx.ip,
                    ua: ctx.ua,
                    metadata: {},
                    beforeJson: { id: existing.id, title: existing.title },
                  },
                })
                return NextResponse.json({ success: true })
              })
            } catch (error) {
              logger.error({ err: error }, 'Error deleting hero slide')
              return NextResponse.json(
                { error: 'Internal server error' },
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
