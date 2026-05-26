// ABOUTME: Client-gallery send-email POST — composed wrapper chain per SEC-07
// ABOUTME: External email send is a side effect (not in $transaction); no DB write

import { NextResponse } from 'next/server'
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
import { sendClientGalleryAccessEmail } from '@/lib/email'
import { clientGallerySendEmailSchema } from '@/lib/validations/client-galleries'
import { logger } from '@/lib/logger'

export const POST = withRequestContext(
  withRateLimit(
    'admin',
    withCsrf(
      withAdminAuth(
        withAudit(
          'client_gallery.send_email',
          withValidation(
            clientGallerySendEmailSchema,
            async (_req, ctx, body) => {
              try {
                const result = await sendClientGalleryAccessEmail({
                  clientName: body.clientName,
                  clientEmail: body.clientEmail,
                  galleryTitle: body.galleryTitle,
                  galleryUrl: body.galleryUrl,
                  password: body.password ?? null,
                  expiresAt: body.expiresAt ?? null,
                  imageCount: body.imageCount ?? 0,
                })
                if (!result.success) {
                  return NextResponse.json(
                    { error: result.error || 'Failed to send email' },
                    { status: 500 }
                  )
                }
                // Audit row records the side effect; this endpoint has no DB
                // mutation, but the email send is a recorded admin action.
                await prisma.auditLog.create({
                  data: {
                    actorId: ctx.actorId!,
                    actorRole: ctx.actorRole!,
                    actorEmail: ctx.actorEmail ?? '',
                    action: 'client_gallery.send_email',
                    resourceType: AuditResourceType.CLIENT_GALLERY,
                    resourceId: body.galleryUrl,
                    requestId: ctx.requestId,
                    ip: ctx.ip,
                    ua: ctx.ua,
                    metadata: {
                      clientEmail: body.clientEmail,
                      galleryTitle: body.galleryTitle,
                    },
                  },
                })
                return NextResponse.json({ success: true })
              } catch (error) {
                logger.error({ err: error }, 'Error in send-email route')
                return NextResponse.json(
                  { error: 'Internal server error' },
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
