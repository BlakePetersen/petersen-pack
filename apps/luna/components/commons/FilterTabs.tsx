// ABOUTME: Shared filter tabs component with URL query param support
// ABOUTME: Desktop underline tabs with mobile dropdown, handles URL state
// fallow-ignore-file circular-dependencies

'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Container } from '@/components/commons'

export interface FilterTab {
  value: string
  label: string
}

interface FilterTabsProps {
  tabs: FilterTab[]
  paramName?: string
  defaultValue?: string
  mobileLabel?: string
  onTabChange?: (value: string) => void
}

export function FilterTabs({
  tabs,
  paramName = 'filter',
  defaultValue = tabs[0]?.value || '',
  mobileLabel = 'Filter',
  onTabChange,
}: FilterTabsProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // Get active value from URL or use default
  const paramValue = searchParams.get(paramName)
  const activeValue = paramValue
    ? tabs.find((t) => t.value.toLowerCase() === paramValue.toLowerCase())
        ?.value || defaultValue
    : defaultValue

  const handleChange = (value: string) => {
    if (value === activeValue) return

    // Call optional callback
    onTabChange?.(value)

    // Update URL
    const params = new URLSearchParams(searchParams.toString())
    if (value === defaultValue) {
      params.delete(paramName)
    } else {
      params.set(paramName, value.toLowerCase())
    }
    const newUrl = params.toString() ? `${pathname}?${params}` : pathname
    router.replace(newUrl, { scroll: false })
  }

  return (
    <>
      {/* Desktop: Compact underline tabs */}
      <div className="hidden border-b border-gray-200 px-gutter dark:border-gray-800 md:block">
        <Container>
          <nav className="flex items-center justify-center gap-0.5 py-1.5 sm:gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => handleChange(tab.value)}
                className={`group relative px-2 py-1 text-xs font-medium tracking-wide transition-colors sm:px-3 ${
                  activeValue === tab.value
                    ? 'text-gray-900 dark:text-white'
                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white'
                }`}
              >
                {tab.label}
                {/* Animated underline */}
                <span
                  className={`absolute bottom-0 left-1/2 h-0.5 -translate-x-1/2 bg-gray-900 transition-all duration-300 dark:bg-white ${
                    activeValue === tab.value
                      ? 'w-full'
                      : 'w-0 group-hover:w-1/2'
                  }`}
                />
              </button>
            ))}
          </nav>
        </Container>
      </div>

      {/* Mobile: Compact dropdown select */}
      <div className="px-gutter py-2 md:hidden">
        <Container>
          <div className="flex items-center gap-2">
            <label
              htmlFor={`${paramName}-select`}
              className="shrink-0 text-xs font-medium text-gray-700 dark:text-gray-300"
            >
              {mobileLabel}:
            </label>
            <div className="relative flex-1">
              <select
                id={`${paramName}-select`}
                value={activeValue}
                onChange={(e) => handleChange(e.target.value)}
                className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-1.5 pr-8 text-sm text-gray-900 transition-all focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:focus:border-white dark:focus:ring-white/20"
              >
                {tabs.map((tab) => (
                  <option key={tab.value} value={tab.value}>
                    {tab.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <svg
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </>
  )
}

// Hook to get the active filter value for components that need it
export function useFilterValue(
  tabs: FilterTab[],
  paramName: string = 'filter',
  defaultValue?: string
): string {
  const searchParams = useSearchParams()
  const paramValue = searchParams.get(paramName)
  const fallback = defaultValue || tabs[0]?.value || ''

  if (!paramValue) return fallback

  const matchedTab = tabs.find(
    (t) => t.value.toLowerCase() === paramValue.toLowerCase()
  )
  return matchedTab?.value || fallback
}
