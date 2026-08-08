// ABOUTME: Tests for the registry API client module.
// ABOUTME: Validates fetch, retry, timeout, Zod validation, and configurable base URL.
import { fetchIndex, fetchArtifact } from '@/registry'
import type { RegistryIndex, RegistryArtifact } from 'blink-registry'

const validIndex: RegistryIndex = {
  items: [
    {
      slug: 'prettier',
      name: 'Prettier',
      type: 'config',
      version: '2026.03.14.1',
      description: 'Prettier config',
      url: 'https://blakepetersen.io/r/config/prettier.json'
    }
  ],
  generatedAt: '2026-03-14T00:00:00.000Z'
}

const validArtifact: RegistryArtifact = {
  slug: 'prettier',
  name: 'Prettier',
  type: 'config',
  version: '2026.03.14.1',
  description: 'Prettier config',
  url: 'https://blakepetersen.io/r/config/prettier.json',
  files: [{ path: '.prettierrc', content: '{}', merge: 'replace' }]
}

let originalFetch: typeof globalThis.fetch
let originalEnv: string | undefined

beforeEach(() => {
  originalFetch = globalThis.fetch
  originalEnv = process.env.BLINK_REGISTRY_URL
  delete process.env.BLINK_REGISTRY_URL
})

afterEach(() => {
  globalThis.fetch = originalFetch
  if (originalEnv !== undefined) {
    process.env.BLINK_REGISTRY_URL = originalEnv
  } else {
    delete process.env.BLINK_REGISTRY_URL
  }
})

describe('fetchIndex', () => {
  it('fetches from default base URL and parses through schema', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(validIndex)
    })
    globalThis.fetch = mockFetch

    const result = await fetchIndex()

    expect(mockFetch).toHaveBeenCalledTimes(1)
    const [url, options] = mockFetch.mock.calls[0]
    expect(url).toBe('https://blakepetersen.io/r/index.json')
    expect(options.signal).toBeDefined()
    expect(result).toEqual(validIndex)
  })

  it('uses BLINK_REGISTRY_URL env var as base URL', async () => {
    process.env.BLINK_REGISTRY_URL = 'https://custom.example.com'
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(validIndex)
    })
    globalThis.fetch = mockFetch

    // Need to re-import to pick up env change - test the URL construction
    await fetchIndex()

    const [url] = mockFetch.mock.calls[0]
    expect(url).toBe('https://custom.example.com/r/index.json')
  })

  it('throws on invalid schema data', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ invalid: true })
    })

    await expect(fetchIndex()).rejects.toThrow()
  })

  it('retries up to 3 times on fetch failure', async () => {
    const mockFetch = jest
      .fn()
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(validIndex)
      })
    globalThis.fetch = mockFetch

    const result = await fetchIndex()

    expect(mockFetch).toHaveBeenCalledTimes(3)
    expect(result).toEqual(validIndex)
  })

  it('throws after exhausting all retries', async () => {
    globalThis.fetch = jest.fn().mockRejectedValue(new Error('Network error'))

    await expect(fetchIndex()).rejects.toThrow('Network error')
  })

  it('retries on non-ok HTTP responses', async () => {
    const mockFetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable'
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(validIndex)
      })
    globalThis.fetch = mockFetch

    const result = await fetchIndex()

    expect(mockFetch).toHaveBeenCalledTimes(2)
    expect(result).toEqual(validIndex)
  })

  it('does not retry 4xx responses — a 404 will not heal on backoff', async () => {
    const mockFetch = jest
      .fn()
      .mockResolvedValue({ ok: false, status: 404, statusText: 'Not Found' })
    globalThis.fetch = mockFetch

    await expect(fetchIndex()).rejects.toThrow(/404/)
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it('includes the failing URL in HTTP error messages', async () => {
    globalThis.fetch = jest
      .fn()
      .mockResolvedValue({ ok: false, status: 404, statusText: 'Not Found' })

    await expect(fetchIndex()).rejects.toThrow(/r\/index\.json/)
  })
})

describe('fetchArtifact', () => {
  it('fetches artifact by type and slug', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(validArtifact)
    })

    const result = await fetchArtifact('config', 'prettier')

    const [url] = (globalThis.fetch as jest.Mock).mock.calls[0]
    expect(url).toBe('https://blakepetersen.io/r/config/prettier.json')
    expect(result).toEqual(validArtifact)
  })

  it('throws on invalid artifact data', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ slug: 'x' })
    })

    await expect(fetchArtifact('config', 'prettier')).rejects.toThrow()
  })
})
