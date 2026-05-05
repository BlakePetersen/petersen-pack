// ABOUTME: Client-image admin PATCH/DELETE — composed wrapper chain per SEC-07
// ABOUTME: Audit row inside $transaction (D-10)

import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { withRequestContext } from '@/lib/request-context'
import {
  withRateLimit,
  withCsrf,
  withAdminAuth,
  withAudit,
  withValidation,
} from '@/lib/wrappers'
import { prisma } from '@/lib/prisma'
import { AuditResourceType } from '@prisma/client'
import { logger } from '@/lib/logger'

const clientImageUpdateSchema = z.object({
  altText: z.string().optional(),
  isFavorite: z.boolean().optional(),
  isArtistPick: z.boolean().optional(),
})

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
          withAudit(
            'client_image.update',
            withValidation(clientImageUpdateSchema, async (_req, ctx, body) => {
              try {
                const updateData: Record<string, unknown> = {}
                if (body.altText !== undefined)
                  updateData.altText = body.altText
                if (body.isFavorite !== undefined)
                  updateData.isFavorite = body.isFavorite
                if (body.isArtistPick !== undefined)
                  updateData.isArtistPick = body.isArtistPick

                return await prisma.$transaction(async (tx) => {
                  const image = await tx.clientImage.update({
                    where: { id },
                    data: updateData,
                  })
                  await tx.auditLog.create({
                    data: {
                      actorId: ctx.actorId!,
                      actorRole: ctx.actorRole!,
                      actorEmail: ctx.actorEmail ?? '',
                      action: 'client_image.update',
                      resourceType: AuditResourceType.CLIENT_GALLERY,
                      resourceId: image.clientGalleryId,
                      requestId: ctx.requestId,
                      ip: ctx.ip,
                      ua: ctx.ua,
                      metadata: {
                        clientImageId: id,
                        updatedFields: Object.keys(updateData),
                      },
                      afterJson: {
                        id: image.id,
                        altText: image.altText,
                        isFavorite: image.isFavorite,
                        isArtistPick: image.isArtistPick,
                      },
                    },
                  })
                  return NextResponse.json(image)
                })
              } catch (error) {
                logger.error({ err: error }, 'Error updating client image')
                return NextResponse.json(
                  { error: 'Failed to update image' },
                  { status: 500 }
                )
              }
            })
          )
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
          withAudit('client_image.delete', async (_req, ctx) => {
            try {
              const existing = await prisma.clientImage.findUnique({
                where: { id },
              })
              if (!existing) {
                return NextResponse.json(
                  { error: 'Image not found' },
                  { status: 404 }
                )
              }
              return await prisma.$transaction(async (tx) => {
                await tx.clientImage.delete({ where: { id } })
                await tx.auditLog.create({
                  data: {
                    actorId: ctx.actorId!,
                    actorRole: ctx.actorRole!,
                    actorEmail: ctx.actorEmail ?? '',
                    action: 'client_image.delete',
                    resourceType: AuditResourceType.CLIENT_GALLERY,
                    resourceId: existing.clientGalleryId,
                    requestId: ctx.requestId,
                    ip: ctx.ip,
                    ua: ctx.ua,
                    metadata: { clientImageId: id },
                    beforeJson: {
                      id: existing.id,
                      url: existing.url,
                      clientGalleryId: existing.clientGalleryId,
                    },
                  },
                })
                return NextResponse.json({ success: true })
              })
            } catch (error) {
              logger.error({ err: error }, 'Error deleting client image')
              return NextResponse.json(
                { error: 'Failed to delete image' },
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
