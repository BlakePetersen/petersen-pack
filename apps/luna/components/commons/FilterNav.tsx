// ABOUTME: Reusable filter/navigation component for category filtering or section links
// ABOUTME: Supports both client-side filtering and anchor link navigation

'use client'

import { useState } from 'react'

type FilterItem = {
  label: string
  value: string
}

type FilterNavProps = {
  items: FilterItem[]
  mode?: 'filter' | 'anchor'
  onFilterChange?: (value: string | null) => void
  defaultAll?: boolean
}

export function FilterNav({
  items,
  mode = 'filter',
  onFilterChange,
  defaultAll = true,
}: FilterNavProps) {
  const [selected, setSelected] = useState<string | null>(null)

  const handleClick = (value: string | null) => {
    if (mode === 'filter') {
      setSelected(value)
      onFilterChange?.(value)
    }
  }

  const isSelected = (value: string | null) => {
    if (mode === 'anchor') {
      return false // Let browser handle active state for anchor links
    }
    return selected === value
  }

  const baseClasses =
    'rounded-full px-3 py-1 text-xs font-medium shadow-sm hover:shadow transition-all'
  const activeClasses =
    'bg-gradient-to-r from-primary-600 to-accent-600 text-white'
  const inactiveClasses =
    'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'

  if (items.length === 0) return null

  return (
    <div className="mb-4 flex flex-wrap justify-center gap-1.5">
      {defaultAll &&
        (mode === 'filter' ? (
          <button
            onClick={() => handleClick(null)}
            className={`${baseClasses} ${isSelected(null) ? activeClasses : inactiveClasses}`}
          >
            All
          </button>
        ) : (
          <a
            href="#all"
            onClick={(e) => {
              e.preventDefault()
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            className={`${baseClasses} ${inactiveClasses}`}
          >
            All
          </a>
        ))}
      {items.map((item) =>
        mode === 'filter' ? (
          <button
            key={item.value}
            onClick={() => handleClick(item.value)}
            className={`${baseClasses} ${isSelected(item.value) ? activeClasses : inactiveClasses}`}
          >
            {item.label}
          </button>
        ) : (
          <a
            key={item.value}
            href={`#${item.value}`}
            className={`${baseClasses} ${inactiveClasses}`}
          >
            {item.label}
          </a>
        )
      )}
    </div>
  )
}
