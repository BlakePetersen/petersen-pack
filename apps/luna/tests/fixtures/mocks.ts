// ABOUTME: vi.mock factories for external service boundaries (D-18)
// ABOUTME: NextAuth, Stripe SDK, Resend, Cloudinary — NOT Prisma (real test DB per D-18)

import { vi } from 'vitest'

/**
 * Apply standard external-service mocks. Call from a spec file's top-level
 * (vi.mock is hoisted per-file; cannot live globally in tests/setup.ts and have
 * deterministic behavior across spec files).
 *
 * Usage in a spec:
 *   vi.mock('@/auth', () => mockNextAuth())
 *   vi.mock('stripe', () => mockStripe())
 */

export function mockNextAuth(role: 'ADMIN' | 'CLIENT' | null = 'ADMIN') {
  return {
    auth: vi
      .fn()
      .mockResolvedValue(
        role
          ? { user: { id: 'usr_test', email: 'test@example.com', role } }
          : null
      ),
  }
}

export function mockStripe() {
  return {
    default: vi.fn().mockImplementation(() => ({
      webhooks: {
        constructEvent: vi.fn(), // tests override per-case
      },
      checkout: {
        sessions: { create: vi.fn() },
      },
    })),
  }
}

export function mockResend() {
  return {
    Resend: vi.fn().mockImplementation(() => ({
      emails: {
        send: vi
          .fn()
          .mockResolvedValue({ data: { id: 'eml_test' }, error: null }),
      },
    })),
  }
}

export function mockCloudinary() {
  return {
    v2: {
      uploader: { upload: vi.fn(), destroy: vi.fn() },
      config: vi.fn(),
    },
  }
}
