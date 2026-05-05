// ABOUTME: Contract send admin POST — composed wrapper chain per SEC-07
// ABOUTME: Status transition + audit row inside $transaction (D-10); email send is post-tx side effect

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
import { Resend } from 'resend'
import ContractSentEmail from '@/lib/email/contract-sent'
import { logger } from '@/lib/logger'
import { env } from '@/lib/env'

const resend = new Resend(env.RESEND_API_KEY)

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
          withAudit('contract.send', async (_req, ctx) => {
            try {
              const contract = await prisma.contract.findUnique({
                where: { id },
                include: { client: true },
              })
              if (!contract) {
                return NextResponse.json(
                  { error: 'Contract not found' },
                  { status: 404 }
                )
              }
              if (contract.status !== 'DRAFT') {
                return NextResponse.json(
                  { error: 'Contract already sent' },
                  { status: 400 }
                )
              }

              const expiresAt = new Date()
              expiresAt.setDate(expiresAt.getDate() + 30)

              const updatedContract = await prisma.$transaction(async (tx) => {
                const updated = await tx.contract.update({
                  where: { id },
                  data: {
                    status: 'SENT',
                    sentAt: new Date(),
                    expiresAt,
                  },
                })
                await tx.auditLog.create({
                  data: {
                    actorId: ctx.actorId!,
                    actorRole: ctx.actorRole!,
                    actorEmail: ctx.actorEmail ?? '',
                    action: 'contract.send',
                    resourceType: AuditResourceType.CONTRACT,
                    resourceId: id,
                    requestId: ctx.requestId,
                    ip: ctx.ip,
                    ua: ctx.ua,
                    metadata: {
                      clientEmail: contract.client.email,
                    },
                    beforeJson: { status: 'DRAFT' },
                    afterJson: {
                      status: 'SENT',
                      expiresAt: updated.expiresAt?.toISOString() ?? null,
                    },
                  },
                })
                return updated
              })

              const contractUrl = `${env.NEXT_PUBLIC_APP_URL}/contract/${contract.id}`
              await resend.emails.send({
                from: 'Ashley Petersen Photography <contracts@ashleypetersenphoto.com>',
                to: contract.client.email,
                subject: 'Your Photography Contract is Ready',
                react: ContractSentEmail({
                  clientName: contract.client.name || 'there',
                  contractUrl,
                  depositAmount: contract.depositAmount,
                  shootDate: contract.shootDate.toISOString(),
                }),
              })

              return NextResponse.json(updatedContract)
            } catch (error) {
              logger.error({ err: error }, 'Send contract error')
              return NextResponse.json(
                { error: 'Failed to send contract' },
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
