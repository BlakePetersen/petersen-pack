// ABOUTME: Hero-slide admin POST — composed wrapper chain per SEC-07
// ABOUTME: Long-tail; TYP-05 will Zod-ify the body shape. Audit row inside $transaction.

import { NextResponse } from 'next/server'
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

export const POST = withRequestContext(
  withRateLimit(
    'admin',
    withCsrf(
      withAdminAuth(
        withAudit('hero_slide.create', async (req, ctx) => {
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
              const slide = await tx.heroSlide.create({
                data: {
                  title,
                  galleryId: galleryId || null,
                  imageId: imageId || null,
                  imageUrl: imageUrl || null,
                  mobileImageUrl: mobileImageUrl || null,
                  focalX: focalX !== undefined ? parseFloat(focalX) : 0.5,
                  focalY: focalY !== undefined ? parseFloat(focalY) : 0.5,
                  mobileFocalX:
                    mobileFocalX !== undefined ? parseFloat(mobileFocalX) : 0.5,
                  mobileFocalY:
                    mobileFocalY !== undefined ? parseFloat(mobileFocalY) : 0.5,
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
                  action: 'hero_slide.create',
                  resourceType: AuditResourceType.GALLERY,
                  resourceId: slide.id,
                  requestId: ctx.requestId,
                  ip: ctx.ip,
                  ua: ctx.ua,
                  metadata: { title, sortOrder },
                  afterJson: { id: slide.id, title: slide.title },
                },
              })
              return NextResponse.json(slide)
            })
          } catch (error) {
            logger.error({ err: error }, 'Error creating hero slide')
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
