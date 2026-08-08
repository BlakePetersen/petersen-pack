// ABOUTME: Pagefind wrapper with lazy import and dev-mode fallback.
// ABOUTME: Provides searchContent() for full-text search across all site content.

export type SearchResult = {
  url: string
  title: string
  excerpt: string
  meta: Record<string, string>
}

type PagefindResult = {
  id: string
  data: () => Promise<{
    url: string
    title: string
    excerpt: string
    meta: Record<string, string>
  }>
}

type PagefindInstance = {
  search: (query: string) => Promise<{ results: PagefindResult[] }>
}

const MAX_RESULTS = 20

let pagefindInstance: PagefindInstance | null = null

async function getPagefind(): Promise<PagefindInstance | null> {
  if (pagefindInstance) return pagefindInstance

  try {
    const pagefindPath = '/pagefind/pagefind.js'
    pagefindInstance = await import(/* webpackIgnore: true */ pagefindPath)
    return pagefindInstance
  } catch {
    return null
  }
}

export async function searchContent(query: string): Promise<SearchResult[]> {
  const pagefind = await getPagefind()
  if (!pagefind) return []

  const response = await pagefind.search(query)
  const top = response.results.slice(0, MAX_RESULTS)

  const results = await Promise.all(
    top.map(async result => {
      const data = await result.data()
      return {
        url: data.url,
        title: data.title,
        excerpt: data.excerpt,
        meta: data.meta
      }
    })
  )

  return results
}
