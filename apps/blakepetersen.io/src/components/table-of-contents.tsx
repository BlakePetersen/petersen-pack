// ABOUTME: Right-side table of contents with scroll spy highlighting.
// ABOUTME: Extracts h2/h3 headings from the DOM and highlights the active section.

'use client'

import { useCallback, useSyncExternalStore } from 'react'
import { useActiveHeading } from '../hooks/use-active-heading'

type TocEntry = {
  id: string
  text: string
  level: number
}

// Cache the snapshot to maintain referential stability for useSyncExternalStore
let cachedEntries: TocEntry[] = []
let cachedKey = ''

function getHeadingsSnapshot(): TocEntry[] {
  if (typeof document === 'undefined') {
    return emptyEntries
  }
  const headings = document.querySelectorAll('h2[id], h3[id]')
  const key = Array.from(headings)
    .map(h => h.id)
    .join(',')

  if (key !== cachedKey) {
    cachedKey = key
    cachedEntries = Array.from(headings).map(heading => ({
      id: heading.id,
      text: heading.textContent ?? '',
      level: heading.tagName === 'H2' ? 2 : 3
    }))
  }

  return cachedEntries
}

const emptyEntries: TocEntry[] = []

function getServerSnapshot(): TocEntry[] {
  return emptyEntries
}

export function TableOfContents() {
  const subscribe = useCallback((callback: () => void) => {
    // Re-check headings when DOM mutations occur (MDX content hydrating)
    const observer = new MutationObserver(callback)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  const entries = useSyncExternalStore(
    subscribe,
    getHeadingsSnapshot,
    getServerSnapshot
  )
  const activeId = useActiveHeading()

  if (entries.length === 0) {
    return null
  }

  return (
    <nav aria-label="Table of contents" className="p-4 font-mono text-xs">
      <p className="mb-3 text-muted-foreground">{'// on this page'}</p>
      <ul className="space-y-1.5">
        {entries.map(entry => (
          <li key={entry.id} className={entry.level === 3 ? 'pl-3' : ''}>
            <a
              href={`#${entry.id}`}
              className={
                activeId === entry.id
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }
            >
              {entry.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
