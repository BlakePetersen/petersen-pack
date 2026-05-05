// ABOUTME: Preview token generation, expiry, and revocation-aware lookup
// ABOUTME: SEC-06 — getPreviewToken filters out revoked rows so callers fail-closed by default

import { randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'
import type { PreviewToken } from '@prisma/client'

export function generatePreviewToken(): string {
  return randomBytes(32).toString('hex')
}

export function getExpiryDate(duration: string): Date {
  const now = new Date()
  switch (duration) {
    case '1h':
      return new Date(now.getTime() + 60 * 60 * 1000)
    case '24h':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000)
    case '7d':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    default:
      return new Date(now.getTime() + 24 * 60 * 60 * 1000) // default 24h
  }
}

/**
 * Look up an active preview token by its public string.
 *
 * SEC-06: returns null when the token is revoked (`revokedAt IS NOT NULL`) OR
 * expired. Callers should treat null as "not a valid preview" — render 404 or
 * the existing invalid-link state. Pair with `Cache-Control: no-store` on the
 * caller's response so revocation propagates within one request.
 */
export async function getPreviewToken(
  token: string
): Promise<PreviewToken | null> {
  return prisma.previewToken.findFirst({
    where: {
      token,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
  })
}
