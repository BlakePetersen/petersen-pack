// ABOUTME: Client-gallery [id] PATCH/DELETE — composed wrapper chain per SEC-07
// ABOUTME: Audit row inside $transaction (D-10); cascade delete preserved at schema level

import { NextResponse, type NextRequest } from 'next/server'
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
import { clientGalleryUpdateApiSchema } from '@/lib/validations/client-galleries'
import { logger } from '@/lib/logger'

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
            'client_gallery.update',
            withValidation(
              clientGalleryUpdateApiSchema,
              async (_req, ctx, body) => {
                try {
                  const existing = await prisma.clientGallery.findUnique({
                    where: { id },
                  })
                  if (!existing) {
                    return NextResponse.json(
                      { error: 'Gallery not found' },
                      { status: 404 }
                    )
                  }

                  const updateData: Record<string, unknown> = {}
                  if (body.title !== undefined) updateData.title = body.title
                  if (body.slug !== undefined) updateData.slug = body.slug
                  if (body.expiresAt !== undefined)
                    updateData.expiresAt = body.expiresAt ?? null
                  if (body.password !== undefined)
                    updateData.password = body.password || null
                  if (body.status !== undefined) updateData.status = body.status
                  if (body.clientId !== undefined)
                    updateData.clientId = body.clientId

                  return await prisma.$transaction(async (tx) => {
                    const gallery = await tx.clientGallery.update({
                      where: { id },
                      data: updateData,
                      include: { client: true },
                    })
                    await tx.auditLog.create({
                      data: {
                        actorId: ctx.actorId!,
                        actorRole: ctx.actorRole!,
                        actorEmail: ctx.actorEmail ?? '',
                        action: 'client_gallery.update',
                        resourceType: AuditResourceType.CLIENT_GALLERY,
                        resourceId: id,
                        requestId: ctx.requestId,
                        ip: ctx.ip,
                        ua: ctx.ua,
                        metadata: {
                          updatedFields: Object.keys(updateData),
                        },
                        beforeJson: {
                          title: existing.title,
                          slug: existing.slug,
                          status: existing.status,
                          expiresAt: existing.expiresAt?.toISOString() ?? null,
                        },
                        afterJson: {
                          title: gallery.title,
                          slug: gallery.slug,
                          status: gallery.status,
                          expiresAt: gallery.expiresAt?.toISOString() ?? null,
                        },
                      },
                    })
                    return NextResponse.json(gallery)
                  })
                } catch (error) {
                  logger.error({ err: error }, 'Error updating client gallery')
                  return NextResponse.json(
                    { error: 'Failed to update gallery' },
                    { status: 500 }
                  )
                }
              }
            )
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
          withAudit('client_gallery.delete', async (_req, ctx) => {
            try {
              const existing = await prisma.clientGallery.findUnique({
                where: { id },
              })
              if (!existing) {
                return NextResponse.json(
                  { error: 'Gallery not found' },
                  { status: 404 }
                )
              }
              return await prisma.$transaction(async (tx) => {
                await tx.clientGallery.delete({ where: { id } })
                await tx.auditLog.create({
                  data: {
                    actorId: ctx.actorId!,
                    actorRole: ctx.actorRole!,
                    actorEmail: ctx.actorEmail ?? '',
                    action: 'client_gallery.delete',
                    resourceType: AuditResourceType.CLIENT_GALLERY,
                    resourceId: id,
                    requestId: ctx.requestId,
                    ip: ctx.ip,
                    ua: ctx.ua,
                    metadata: { clientId: existing.clientId },
                    beforeJson: {
                      id: existing.id,
                      title: existing.title,
                      slug: existing.slug,
                    },
                  },
                })
                return NextResponse.json({ success: true })
              })
            } catch (error) {
              logger.error({ err: error }, 'Error deleting client gallery')
              return NextResponse.json(
                { error: 'Failed to delete gallery' },
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
