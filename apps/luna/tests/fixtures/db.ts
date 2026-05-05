// ABOUTME: DB reset helpers for transactional tables (D-18)
// ABOUTME: Truncates AuditLog/WebhookEvent/IdempotencyKey/business rows in beforeEach

import { prisma } from '@/lib/prisma'

/**
 * Truncates transactional tables in dependency order.
 * WebhookEvent and IdempotencyKey are added by P2.3 — guard their deleteMany behind
 * runtime existence so this file is safe to land in Wave 0 BEFORE the migration ships.
 */
export async function resetTransactionalTables(): Promise<void> {
  const ops: Array<Promise<unknown>> = []

  ops.push(prisma.auditLog.deleteMany())

  // P2.3 tables — exist after their migration runs; the model accessors are
  // generated alongside the schema. Until P2.3 lands they're absent from the
  // client; guard via runtime existence and swallow the access to keep this
  // helper Wave-0-compatible.
  const client = prisma as unknown as Record<
    string,
    { deleteMany: () => Promise<unknown> } | undefined
  >
  if (client.webhookEvent?.deleteMany) {
    ops.push(client.webhookEvent.deleteMany())
  }
  if (client.idempotencyKey?.deleteMany) {
    ops.push(client.idempotencyKey.deleteMany())
  }

  // Business rows touched by tests (extend as more specs land):
  ops.push(prisma.retouchRequest.deleteMany())
  ops.push(prisma.changeRequest.deleteMany())
  ops.push(prisma.payment.deleteMany())

  await Promise.all(ops)
}
