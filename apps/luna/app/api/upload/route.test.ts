// ABOUTME: SEC-05 contract — upload route gated by withAdminAuth + file-type magic-byte sniff
// ABOUTME: Asserts unauth/role gate, MIME-spoof rejection (header lies), happy path with sharp+blob mocked

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { auth } from '@/auth'

vi.mock('@/auth', () => ({ auth: vi.fn() }))

// sharp is a native module; mock at the module boundary so we never invoke it.
vi.mock('sharp', () => {
  const fakeBuffer = Buffer.from('fake-webp-bytes')
  const chain = {
    resize: vi.fn().mockReturnThis(),
    webp: vi.fn().mockReturnThis(),
    toBuffer: vi.fn(async () => fakeBuffer),
    metadata: vi.fn(async () => ({ width: 1024, height: 768 })),
  }
  return { default: vi.fn(() => chain) }
})

vi.mock('@vercel/blob', () => ({
  put: vi.fn(async (path: string) => ({
    url: `https://blob.example.test/${path}`,
  })),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    gallery: { findUnique: vi.fn() },
    image: { create: vi.fn() },
    // tests/setup.ts afterAll calls prisma.$disconnect — provide a noop so the
    // mocked client satisfies the global teardown without touching a real DB.
    $disconnect: vi.fn(async () => {}),
  },
}))

import { POST } from './route'

// Smallest valid PNG: 8-byte signature + IHDR chunk (1x1 px). file-type sniffs
// the signature; sharp is mocked, so chunk validity beyond the signature isn't
// strictly enforced, but a complete IHDR keeps file-type sniff stable across
// upgrades.
const PNG_HEADER = Buffer.from([
  // PNG signature
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  // IHDR chunk: length=13, type=IHDR
  0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
  // width=1, height=1, depth=8, color=2, compression=0, filter=0, interlace=0
  0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x02, 0x00, 0x00, 0x00,
  // CRC32 (placeholder; sharp is mocked so it isn't decoded)
  0x90, 0x77, 0x53, 0xde,
])
// Plain text — file-type returns undefined for unknown signatures
const TEXT_BYTES = Buffer.from(
  'this is not an image, just text bytes' + ' '.repeat(64)
)

function buildRequest(
  file: File,
  origin = 'http://localhost:3000'
): NextRequest {
  const fd = new FormData()
  fd.set('file', file)
  fd.set('type', 'general')
  return new NextRequest('http://localhost:3000/api/upload', {
    method: 'POST',
    headers: { origin },
    body: fd,
  })
}

describe('POST /api/upload — SEC-05 wrapper chain + MIME sniff', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when no session present', async () => {
    vi.mocked(auth).mockResolvedValue(null as never)
    const file = new File([PNG_HEADER], 'a.png', { type: 'image/png' })
    const res = await POST(buildRequest(file))
    expect(res.status).toBe(401)
  })

  it('returns 403 for non-admin (CLIENT) session', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'u1', role: 'CLIENT', email: 'client@example.test' },
    } as never)
    const file = new File([PNG_HEADER], 'a.png', { type: 'image/png' })
    const res = await POST(buildRequest(file))
    expect(res.status).toBe(403)
  })

  it('rejects MIME-spoofed file (text bytes claiming image/png) with 400', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin1', role: 'ADMIN', email: 'admin@example.test' },
    } as never)
    // Header lies — file.name + file.type say PNG, but bytes are plain text.
    const file = new File([TEXT_BYTES], 'fake.png', { type: 'image/png' })
    const res = await POST(buildRequest(file))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/invalid_file_type/)
  })

  it('accepts admin upload with valid PNG magic bytes', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin1', role: 'ADMIN', email: 'admin@example.test' },
    } as never)
    const file = new File([PNG_HEADER], 'a.png', { type: 'image/png' })
    const res = await POST(buildRequest(file))
    // type=general short-circuits before DB write and returns 201 with the blob URL
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.url).toContain('blob.example.test')
  })
})
