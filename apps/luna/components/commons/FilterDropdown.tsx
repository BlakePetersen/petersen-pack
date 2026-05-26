// ABOUTME: Dropdown filter component for categories and tags
// ABOUTME: Provides select-style filtering for large lists of options

'use client'

import { useState, useRef, useEffect } from 'react'

type FilterItem = {
  label: string
  value: string
}

type FilterDropdownProps = {
  items: FilterItem[]
  selected: string | null
  onFilterChange: (value: string | null) => void
  placeholder?: string
  label?: string
}

function FilterDropdown({
  items,
  selected,
  onFilterChange,
  placeholder = 'All',
  label,
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedItem = items.find((item) => item.value === selected)
  const displayText = selectedItem ? selectedItem.label : placeholder

  const handleSelect = (value: string | null) => {
    onFilterChange(value)
    setIsOpen(false)
  }

  if (items.length === 0) return null

  return (
    <div className="relative" ref={dropdownRef}>
      {label && (
        <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {label}
        </label>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-lg bg-white px-4 py-3 text-left text-sm font-medium text-gray-700 shadow-soft transition-all hover:shadow-glow dark:bg-gray-800 dark:text-gray-300"
      >
        <span className={selected ? '' : 'text-gray-500 dark:text-gray-400'}>
          {displayText}
        </span>
        <svg
          className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
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
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-2 max-h-60 w-full overflow-auto rounded-lg bg-white shadow-glow dark:bg-gray-800">
          <button
            onClick={() => handleSelect(null)}
            className={`w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${
              !selected
                ? 'bg-gradient-to-r from-primary-50 to-accent-50 font-semibold text-primary-700 dark:from-primary-900/30 dark:to-accent-900/30 dark:text-primary-300'
                : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            {placeholder}
          </button>
          {items.map((item) => (
            <button
              key={item.value}
              onClick={() => handleSelect(item.value)}
              className={`w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${
                selected === item.value
                  ? 'bg-gradient-to-r from-primary-50 to-accent-50 font-semibold text-primary-700 dark:from-primary-900/30 dark:to-accent-900/30 dark:text-primary-300'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
