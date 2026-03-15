// ABOUTME: Registry API client for fetching artifact index and individual artifacts.
// ABOUTME: Supports configurable base URL, request timeout, and retry with exponential backoff.
import {
  RegistryIndexSchema,
  RegistryArtifactSchema,
  type RegistryIndex,
  type RegistryArtifact,
  type ArtifactType,
} from 'blink-registry'

const TIMEOUT_MS = 10_000
const MAX_RETRIES = 3

function getBaseUrl(): string {
  return process.env.BLINK_REGISTRY_URL || 'https://blakepetersen.io'
}

async function fetchWithRetry(url: string): Promise<Response> {
  let lastError: Error | undefined

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(TIMEOUT_MS),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`)
      }

      return response
    } catch (error) {
      lastError = error as Error

      if (attempt < MAX_RETRIES - 1) {
        const delay = Math.min(1000 * 2 ** attempt, 5000)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError
}

export async function fetchIndex(): Promise<RegistryIndex> {
  const url = `${getBaseUrl()}/r/index.json`
  const response = await fetchWithRetry(url)
  const data = await response.json()
  return RegistryIndexSchema.parse(data)
}

export async function fetchArtifact(
  type: ArtifactType,
  slug: string
): Promise<RegistryArtifact> {
  const url = `${getBaseUrl()}/r/${type}/${slug}.json`
  const response = await fetchWithRetry(url)
  const data = await response.json()
  return RegistryArtifactSchema.parse(data)
}
