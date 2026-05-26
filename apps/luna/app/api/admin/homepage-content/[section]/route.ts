// ABOUTME: Homepage-content [section] GET/PATCH — composed wrapper chain per SEC-07
// ABOUTME: GET stays public (homepage reads); PATCH gated by adminAuth + audit inside $transaction

import { NextResponse, type NextRequest } from 'next/server'
import { Prisma } from '@prisma/client'
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ section: string }> }
) {
  const { section } = await params
  // DEVIATION: GET is read-only and public-facing (homepage); rateLimit('anon')
  // tier reflects unauth callers. No adminAuth, no CSRF (safe method anyway), no audit.
  const handler = withRequestContext(
    withRateLimit('anon', async () => {
      try {
        const content = await prisma.homepageContent.findUnique({
          where: { section },
        })
        if (!content) {
          return NextResponse.json(
            { error: 'Content not found' },
            { status: 404 }
          )
        }
        return NextResponse.json(content)
      } catch (error) {
        logger.error({ err: error }, 'Error fetching homepage content')
        return NextResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        )
      }
    })
  )
  return handler(request)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ section: string }> }
) {
  const { section } = await params
  const handler = withRequestContext(
    withRateLimit(
      'admin',
      withCsrf(
        withAdminAuth(
          withAudit('homepage_content.update', async (req, ctx) => {
            try {
              const body = await req.json()
              const updateData: {
                content?: Prisma.InputJsonValue
                imageId?: string
              } = {}
              if (body.content !== undefined) {
                updateData.content = body.content as Prisma.InputJsonValue
              }
              if (body.imageId !== undefined) {
                updateData.imageId = body.imageId
              }
              return await prisma.$transaction(async (tx) => {
                const updated = await tx.homepageContent.update({
                  where: { section },
                  data: updateData,
                  include: { image: true },
                })
                await tx.auditLog.create({
                  data: {
                    actorId: ctx.actorId!,
                    actorRole: ctx.actorRole!,
                    actorEmail: ctx.actorEmail ?? '',
                    action: 'homepage_content.update',
                    resourceType: AuditResourceType.GALLERY,
                    resourceId: section,
                    requestId: ctx.requestId,
                    ip: ctx.ip,
                    ua: ctx.ua,
                    metadata: {
                      section,
                      fields: Object.keys(updateData),
                    },
                    afterJson: { section },
                  },
                })
                return NextResponse.json(updated)
              })
            } catch (error) {
              logger.error({ err: error }, 'Error updating homepage content')
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
