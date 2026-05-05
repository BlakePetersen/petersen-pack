// ABOUTME: Process-step [id] PUT/DELETE — composed wrapper chain per SEC-07
// ABOUTME: Audit row inside $transaction (D-10); usage check rejects deletes for in-use steps

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
          withAudit('process_step.update', async (req, ctx) => {
            try {
              const data = await req.json()
              const { title, content, stepNumber, icon } = data
              return await prisma.$transaction(async (tx) => {
                const step = await tx.processStep.update({
                  where: { id },
                  data: { title, content, stepNumber, icon },
                })
                await tx.auditLog.create({
                  data: {
                    actorId: ctx.actorId!,
                    actorRole: ctx.actorRole!,
                    actorEmail: ctx.actorEmail ?? '',
                    action: 'process_step.update',
                    resourceType: AuditResourceType.SERVICE,
                    resourceId: id,
                    requestId: ctx.requestId,
                    ip: ctx.ip,
                    ua: ctx.ua,
                    metadata: {},
                    afterJson: { id: step.id, title: step.title },
                  },
                })
                return NextResponse.json(step)
              })
            } catch (error) {
              logger.error({ err: error }, 'Error updating process step')
              return NextResponse.json(
                { error: 'Failed to update process step' },
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
          withAudit('process_step.delete', async (_req, ctx) => {
            try {
              const usage = await prisma.serviceProcessStep.count({
                where: { processStepId: id },
              })
              if (usage > 0) {
                return NextResponse.json(
                  {
                    error: `Cannot delete step that is used by ${usage} service(s)`,
                  },
                  { status: 400 }
                )
              }
              const existing = await prisma.processStep.findUnique({
                where: { id },
              })
              if (!existing) {
                return NextResponse.json(
                  { error: 'Process step not found' },
                  { status: 404 }
                )
              }
              return await prisma.$transaction(async (tx) => {
                await tx.processStep.delete({ where: { id } })
                await tx.auditLog.create({
                  data: {
                    actorId: ctx.actorId!,
                    actorRole: ctx.actorRole!,
                    actorEmail: ctx.actorEmail ?? '',
                    action: 'process_step.delete',
                    resourceType: AuditResourceType.SERVICE,
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
              logger.error({ err: error }, 'Error deleting process step')
              return NextResponse.json(
                { error: 'Failed to delete process step' },
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
