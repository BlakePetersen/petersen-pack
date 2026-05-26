// ABOUTME: Contract link-gallery admin POST — composed wrapper chain per SEC-07
// ABOUTME: Audit row written inside handler's $transaction (D-10); multipart formData (no withValidation)

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
          withAudit('contract.link_gallery', async (req, ctx) => {
            try {
              const formData = await req.formData()
              const galleryId = formData.get('galleryId') as string

              if (!galleryId) {
                return NextResponse.json(
                  { error: 'Gallery ID required' },
                  { status: 400 }
                )
              }

              const contract = await prisma.contract.findUnique({
                where: { id },
              })
              if (!contract) {
                return NextResponse.json(
                  { error: 'Contract not found' },
                  { status: 404 }
                )
              }
              if (contract.status !== 'SIGNED') {
                return NextResponse.json(
                  { error: 'Contract must be signed before linking gallery' },
                  { status: 400 }
                )
              }

              const gallery = await prisma.clientGallery.findUnique({
                where: { id: galleryId },
              })
              if (!gallery) {
                return NextResponse.json(
                  { error: 'Gallery not found' },
                  { status: 404 }
                )
              }
              if (gallery.clientId !== contract.clientId) {
                return NextResponse.json(
                  {
                    error: "Gallery does not belong to this contract's client",
                  },
                  { status: 403 }
                )
              }
              if (gallery.contractId) {
                return NextResponse.json(
                  { error: 'Gallery is already linked to another contract' },
                  { status: 400 }
                )
              }

              const expiresAt = new Date()
              expiresAt.setDate(expiresAt.getDate() + 30)

              return await prisma.$transaction(async (tx) => {
                const updated = await tx.clientGallery.update({
                  where: { id: galleryId },
                  data: { contractId: id, expiresAt },
                })
                await tx.auditLog.create({
                  data: {
                    actorId: ctx.actorId!,
                    actorRole: ctx.actorRole!,
                    actorEmail: ctx.actorEmail ?? '',
                    action: 'contract.link_gallery',
                    resourceType: AuditResourceType.CONTRACT,
                    resourceId: id,
                    requestId: ctx.requestId,
                    ip: ctx.ip,
                    ua: ctx.ua,
                    metadata: { galleryId, clientId: contract.clientId },
                    beforeJson: {
                      galleryId,
                      contractId: gallery.contractId,
                    },
                    afterJson: {
                      galleryId,
                      contractId: id,
                      expiresAt: updated.expiresAt?.toISOString() ?? null,
                    },
                  },
                })
                return NextResponse.redirect(
                  new URL(`/admin/contracts/${id}`, req.url)
                )
              })
            } catch (error) {
              logger.error({ err: error }, 'Link gallery error')
              return NextResponse.json(
                { error: 'Failed to link gallery' },
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
