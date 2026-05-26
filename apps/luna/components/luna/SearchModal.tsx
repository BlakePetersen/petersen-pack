// ABOUTME: Modal search component with real-time results
// ABOUTME: Searches blog posts and portfolio galleries with keyboard navigation

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { trackSearch } from '@/lib/analytics'
import { shimmerDataUrl } from '@/lib/shimmer'
import { logger } from '@/lib/logger.edge'

type SearchResult = {
  id: string
  type: 'blog' | 'portfolio'
  title: string
  slug: string
  excerpt?: string | null
  description?: string | null
  coverImage?: string | null
  publishedAt?: Date | null
  categories?: string[]
  tags?: string[]
  imageCount?: number
}

type SearchModalProps = {
  isOpen: boolean
  onClose: () => void
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<{
    blog: SearchResult[]
    portfolio: SearchResult[]
  }>({ blog: [], portfolio: [] })
  const [isSearching, setIsSearching] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const allResults = [...results.blog, ...results.portfolio]

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      window.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      window.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults({ blog: [], portfolio: [] })
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(query)}`
        )
        const data = await response.json()
        setResults(data)
        setSelectedIndex(0)
        trackSearch(query)
      } catch (error) {
        logger.error({ err: error }, 'Search failed')
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) =>
        prev < allResults.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev))
    } else if (e.key === 'Enter' && allResults[selectedIndex]) {
      e.preventDefault()
      navigateToResult(allResults[selectedIndex])
    }
  }

  const navigateToResult = useCallback(
    (result: SearchResult) => {
      const url =
        result.type === 'blog'
          ? `/blog/${result.slug}`
          : `/portfolio/${result.slug}`
      router.push(url)
      onClose()
      setQuery('')
    },
    [router, onClose]
  )

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-20 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      <div
        className="mx-4 w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
        role="document"
      >
        {/* Search Input */}
        <div className="flex items-center gap-4 border-b border-gray-200 p-4 dark:border-gray-700">
          <svg
            className="h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search blog posts and galleries..."
            className="flex-1 bg-transparent text-lg text-gray-900 placeholder-gray-400 outline-none dark:text-white"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="Clear search"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {isSearching && (
            <div className="p-8 text-center text-gray-500">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-primary-600" />
              <p className="mt-2">Searching...</p>
            </div>
          )}

          {!isSearching && query && allResults.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <p>No results found for &quot;{query}&quot;</p>
            </div>
          )}

          {!isSearching && allResults.length > 0 && (
            <div className="py-2">
              {results.blog.length > 0 && (
                <div className="mb-4">
                  <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Blog Posts ({results.blog.length})
                  </div>
                  {results.blog.map((result, index) => (
                    <SearchResultItem
                      key={result.id}
                      result={result}
                      isSelected={selectedIndex === index}
                      onClick={() => navigateToResult(result)}
                    />
                  ))}
                </div>
              )}

              {results.portfolio.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Portfolio ({results.portfolio.length})
                  </div>
                  {results.portfolio.map((result, index) => (
                    <SearchResultItem
                      key={result.id}
                      result={result}
                      isSelected={selectedIndex === results.blog.length + index}
                      onClick={() => navigateToResult(result)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-4 border-t border-gray-200 px-4 py-3 text-xs text-gray-500 dark:border-gray-700">
          <div className="flex gap-4">
            <span className="flex items-center gap-1">
              <kbd className="rounded bg-gray-100 px-1.5 py-0.5 font-mono dark:bg-gray-800">
                ↑↓
              </kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded bg-gray-100 px-1.5 py-0.5 font-mono dark:bg-gray-800">
                ↵
              </kbd>
              Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded bg-gray-100 px-1.5 py-0.5 font-mono dark:bg-gray-800">
                ESC
              </kbd>
              Close
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function SearchResultItem({
  result,
  isSelected,
  onClick,
}: {
  result: SearchResult
  isSelected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-start gap-4 px-4 py-3 text-left transition-colors ${
        isSelected
          ? 'bg-primary-50 dark:bg-gray-800'
          : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
      }`}
    >
      {result.coverImage && (
        <div className="relative h-12 w-16 flex-shrink-0 overflow-hidden rounded bg-gray-100">
          <Image
            src={result.coverImage}
            alt={result.title}
            fill
            className="object-cover"
            sizes="64px"
            placeholder="blur"
            blurDataURL={shimmerDataUrl(64, 48)}
          />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <h3 className="truncate font-medium text-gray-900 dark:text-white">
            {result.title}
          </h3>
          <span className="flex-shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-400">
            {result.type}
          </span>
        </div>
        {result.excerpt && (
          <p className="line-clamp-1 text-sm text-gray-600 dark:text-gray-400">
            {result.excerpt}
          </p>
        )}
        {result.description && (
          <p className="line-clamp-1 text-sm text-gray-600 dark:text-gray-400">
            {result.description}
          </p>
        )}
        {result.categories && result.categories.length > 0 && (
          <div className="mt-1 flex gap-1">
            {result.categories.slice(0, 3).map((category) => (
              <span
                key={category}
                className="text-xs text-primary-600 dark:text-primary-400"
              >
                {category}
              </span>
            ))}
          </div>
        )}
      </div>
    </button>
  )
}
