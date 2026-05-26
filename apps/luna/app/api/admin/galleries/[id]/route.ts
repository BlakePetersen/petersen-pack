// ABOUTME: Gallery [id] DELETE — composed wrapper chain per SEC-07
// ABOUTME: Audit row inside $transaction (D-10); cascade delete preserved at schema level

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
          withAudit('gallery.delete', async (_req, ctx) => {
            try {
              const existing = await prisma.gallery.findUnique({
                where: { id },
              })
              if (!existing) {
                return NextResponse.json(
                  { error: 'Gallery not found' },
                  { status: 404 }
                )
              }
              return await prisma.$transaction(async (tx) => {
                await tx.gallery.delete({ where: { id } })
                await tx.auditLog.create({
                  data: {
                    actorId: ctx.actorId!,
                    actorRole: ctx.actorRole!,
                    actorEmail: ctx.actorEmail ?? '',
                    action: 'gallery.delete',
                    resourceType: AuditResourceType.GALLERY,
                    resourceId: id,
                    requestId: ctx.requestId,
                    ip: ctx.ip,
                    ua: ctx.ua,
                    metadata: { gallerySlug: existing.slug },
                    beforeJson: {
                      id: existing.id,
                      slug: existing.slug,
                      title: existing.title,
                    },
                  },
                })
                return NextResponse.json({ success: true })
              })
            } catch (error) {
              logger.error({ err: error }, 'Failed to delete gallery')
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
