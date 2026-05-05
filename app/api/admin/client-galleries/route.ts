// ABOUTME: Client-gallery admin POST — composed wrapper chain per SEC-07
// ABOUTME: Creates client User + ClientGallery; audit row inside $transaction (D-10)

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
import bcrypt from 'bcryptjs'
import { clientGalleryCreateApiSchema } from '@/lib/validations/client-galleries'
import { logger } from '@/lib/logger'

export const POST = withRequestContext(
  withRateLimit(
    'admin',
    withCsrf(
      withAdminAuth(
        withAudit(
          'client_gallery.create',
          withValidation(
            clientGalleryCreateApiSchema,
            async (_req, ctx, body) => {
              try {
                const { title, clientName, clientEmail, password } = body
                const expiresInDaysRaw = body.expiresInDays
                const expiresInDays =
                  typeof expiresInDaysRaw === 'number'
                    ? expiresInDaysRaw
                    : expiresInDaysRaw
                      ? parseInt(String(expiresInDaysRaw), 10)
                      : 0

                const slug = title
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, '-')
                  .replace(/^-+|-+$/g, '')

                const existingGallery = await prisma.clientGallery.findUnique({
                  where: { slug },
                })
                if (existingGallery) {
                  return NextResponse.json(
                    { error: 'A gallery with this name already exists' },
                    { status: 400 }
                  )
                }

                let client = await prisma.user.findUnique({
                  where: { email: clientEmail },
                })
                if (!client) {
                  const tempPassword = Math.random().toString(36).slice(-12)
                  const hashedPassword = await bcrypt.hash(tempPassword, 10)
                  client = await prisma.user.create({
                    data: {
                      email: clientEmail,
                      name: clientName,
                      password: hashedPassword,
                      role: 'CLIENT',
                    },
                  })
                }

                const expiresAt =
                  expiresInDays > 0
                    ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
                    : null
                const hashedGalleryPassword = password
                  ? await bcrypt.hash(password, 10)
                  : null

                return await prisma.$transaction(async (tx) => {
                  const clientGallery = await tx.clientGallery.create({
                    data: {
                      title,
                      slug,
                      clientId: client!.id,
                      password: hashedGalleryPassword,
                      expiresAt,
                    },
                  })
                  await tx.auditLog.create({
                    data: {
                      actorId: ctx.actorId!,
                      actorRole: ctx.actorRole!,
                      actorEmail: ctx.actorEmail ?? '',
                      action: 'client_gallery.create',
                      resourceType: AuditResourceType.CLIENT_GALLERY,
                      resourceId: clientGallery.id,
                      requestId: ctx.requestId,
                      ip: ctx.ip,
                      ua: ctx.ua,
                      metadata: {
                        clientId: client!.id,
                        clientEmail,
                        hasPassword: hashedGalleryPassword !== null,
                      },
                      afterJson: {
                        id: clientGallery.id,
                        title: clientGallery.title,
                        slug: clientGallery.slug,
                        expiresAt:
                          clientGallery.expiresAt?.toISOString() ?? null,
                      },
                    },
                  })
                  return NextResponse.json(clientGallery, { status: 201 })
                })
              } catch (error) {
                logger.error({ err: error }, 'Error creating client gallery')
                return NextResponse.json(
                  { error: 'Failed to create client gallery' },
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
