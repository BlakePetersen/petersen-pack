// ABOUTME: Encode/decode helpers for Playground props in URL search params.
// ABOUTME: Uses ?p[key]=value format; pushState avoids RSC re-renders.

/**
 * Encode a plain string-map of Playground prop values into a query string
 * under the `p[*]` namespace. Other application-level params should be merged
 * by the caller — this helper owns only the playground namespace.
 */
export function encodePlaygroundParams(props: Record<string, string>): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(props)) {
    params.set(`p[${key}]`, value)
  }
  return params.toString()
}

/**
 * Extract `p[*]` entries from the given URLSearchParams. Params outside the
 * namespace are ignored so unrelated query args do not leak into playground
 * state.
 */
export function decodePlaygroundParams(
  searchParams: URLSearchParams,
): Record<string, string> {
  const result: Record<string, string> = {}
  for (const [key, value] of searchParams.entries()) {
    const match = key.match(/^p\[(.+)\]$/)
    if (match) result[match[1]] = value
  }
  return result
}

/**
 * Update the URL's search params to reflect the given props using
 * `window.history.pushState` rather than `router.replace`, which keeps the
 * update shallow (no RSC re-fetch). Preserves all non-`p[*]` query params
 * AND the URL hash so sibling features (e.g. analytics utm params, page
 * anchors) survive every playground state write. See RESEARCH.md Pattern 2
 * / Next.js discussion #49540.
 *
 * @remarks Client-only. Dereferences `window.location` / `window.history` and
 * will throw during SSR/prerender. Call from client components or effects.
 */
export function pushPlaygroundParams(props: Record<string, string>): void {
  const next = new URLSearchParams(window.location.search)
  // Drop any stale p[*] keys before setting the new ones.
  for (const key of [...next.keys()]) {
    if (/^p\[.+\]$/.test(key)) next.delete(key)
  }
  for (const [k, v] of Object.entries(props)) {
    next.set(`p[${k}]`, v)
  }
  const qs = next.toString()
  const url = qs
    ? `${window.location.pathname}?${qs}${window.location.hash}`
    : `${window.location.pathname}${window.location.hash}`
  window.history.pushState(null, '', url)
}
