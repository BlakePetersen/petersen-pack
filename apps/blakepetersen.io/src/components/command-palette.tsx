// ABOUTME: Command palette with full-text search powered by Pagefind.
// ABOUTME: Opens via Cmd+K or search icon, shows results grouped by content type with keyboard navigation.

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Dialog } from 'radix-ui'
import { searchContent, type SearchResult } from '../lib/search'
import { SearchTrigger } from './search-trigger'

type RecentPage = {
  url: string
  title: string
}

const RECENT_PAGES_KEY = 'recent-pages'
const MAX_RECENT = 5
const DEBOUNCE_MS = 200

function getRecentPages(): RecentPage[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(RECENT_PAGES_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function recordRecentPage(url: string, title: string) {
  if (typeof window === 'undefined') return
  try {
    const pages = getRecentPages().filter((p) => p.url !== url)
    pages.unshift({ url, title })
    localStorage.setItem(
      RECENT_PAGES_KEY,
      JSON.stringify(pages.slice(0, MAX_RECENT))
    )
  } catch {
    // localStorage unavailable
  }
}

function groupByType(results: SearchResult[]): Map<string, SearchResult[]> {
  const groups = new Map<string, SearchResult[]>()
  for (const result of results) {
    const segments = result.url.split('/').filter(Boolean)
    const type = segments[0] ?? 'other'
    const label = type.charAt(0).toUpperCase() + type.slice(1)
    const group = groups.get(label) ?? []
    group.push(result)
    groups.set(label, group)
  }
  return groups
}

type CommandPaletteProps = {
  defaultOpen?: boolean
}

export function CommandPalette({ defaultOpen = false }: CommandPaletteProps) {
  const [open, setOpen] = useState(defaultOpen)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [recentPages, setRecentPages] = useState<RecentPage[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)

  // Track current page for recent pages
  useEffect(() => {
    if (typeof window !== 'undefined') {
      recordRecentPage(window.location.pathname, document.title)
    }
  }, [])

  // Load recent pages when palette opens
  useEffect(() => {
    if (open) {
      setRecentPages(getRecentPages())
      setQuery('')
      setResults([])
      setSelectedIndex(0)
    }
  }, [open])

  // Global keyboard shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Debounced search
  const handleQueryChange = useCallback((value: string) => {
    setQuery(value)
    setSelectedIndex(0)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!value.trim()) {
      setResults([])
      return
    }

    debounceRef.current = setTimeout(async () => {
      const searchResults = await searchContent(value)
      setResults(searchResults)
      setSelectedIndex(0)
    }, DEBOUNCE_MS)
  }, [])

  // Flatten grouped results for keyboard navigation indexing
  const allItems: { url: string; title: string }[] =
    query.trim()
      ? results.map((r) => ({ url: r.url, title: r.title }))
      : recentPages

  function navigateTo(url: string, title: string) {
    recordRecentPage(url, title)
    setOpen(false)
    window.location.href = url
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.min(prev + 1, allItems.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter' && allItems[selectedIndex]) {
      e.preventDefault()
      const item = allItems[selectedIndex]
      navigateTo(item.url, item.title)
    }
  }

  const grouped = query.trim() ? groupByType(results) : null

  // Track flat index for rendering grouped results with selection
  let flatIndex = 0

  return (
    <>
      <SearchTrigger onClick={() => setOpen(true)} />

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content
            className="fixed left-[50%] top-[20%] z-50 w-full max-w-lg translate-x-[-50%] border border-border bg-background shadow-lg"
            onKeyDown={handleKeyDown}
            onOpenAutoFocus={(e) => {
              e.preventDefault()
              inputRef.current?.focus()
            }}
          >
            <Dialog.Title className="sr-only">Search content</Dialog.Title>

            <div className="border-b border-border p-3">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                placeholder="Search content..."
                className="w-full bg-transparent font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>

            <div className="max-h-80 overflow-y-auto p-2">
              {!query.trim() && recentPages.length > 0 && (
                <>
                  <div className="px-2 py-1.5 font-mono text-xs text-muted-foreground">
                    Recent
                  </div>
                  {recentPages.map((page, i) => (
                    <button
                      key={page.url}
                      onClick={() => navigateTo(page.url, page.title)}
                      className={`flex w-full items-center rounded px-2 py-1.5 text-left font-mono text-sm transition-colors ${
                        selectedIndex === i
                          ? 'border-l-2 border-primary bg-accent text-foreground'
                          : 'text-muted-foreground hover:bg-accent'
                      }`}
                    >
                      {page.title || page.url}
                    </button>
                  ))}
                </>
              )}

              {query.trim() && results.length === 0 && (
                <div className="px-2 py-4 text-center font-mono text-sm text-muted-foreground">
                  No results found
                </div>
              )}

              {grouped &&
                Array.from(grouped.entries()).map(([group, items]) => (
                  <div key={group}>
                    <div className="px-2 py-1.5 font-mono text-xs text-muted-foreground">
                      {group}
                    </div>
                    {items.map((result) => {
                      const currentIndex = flatIndex++
                      return (
                        <button
                          key={result.url}
                          onClick={() => navigateTo(result.url, result.title)}
                          className={`flex w-full flex-col rounded px-2 py-1.5 text-left transition-colors ${
                            selectedIndex === currentIndex
                              ? 'border-l-2 border-primary bg-accent'
                              : 'hover:bg-accent'
                          }`}
                        >
                          <span className="font-mono text-sm text-foreground">
                            {result.title}
                          </span>
                          <span
                            className="line-clamp-1 text-xs text-muted-foreground [&_mark]:bg-primary/30 [&_mark]:text-foreground"
                            dangerouslySetInnerHTML={{ __html: result.excerpt }}
                          />
                        </button>
                      )
                    })}
                  </div>
                ))}

              {!query.trim() && recentPages.length === 0 && (
                <div className="px-2 py-4 text-center font-mono text-sm text-muted-foreground">
                  Type to search content
                </div>
              )}
            </div>

            <div className="border-t border-border px-3 py-2">
              <div className="flex gap-3 font-mono text-xs text-muted-foreground">
                <span>↑↓ navigate</span>
                <span>↵ open</span>
                <span>esc close</span>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}
