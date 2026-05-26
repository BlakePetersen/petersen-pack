// ABOUTME: Dark mode toggle switch component
// ABOUTME: Button to switch between light and dark themes with icon-only and dropdown variants

'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

type DarkModeToggleProps = {
  variant?: 'icon' | 'dropdown'
}

export default function DarkModeToggle({
  variant = 'icon',
}: DarkModeToggleProps) {
  const [mounted, setMounted] = useState(false)
  const { theme, resolvedTheme, setTheme } = useTheme()

  // This effect is intentional for hydration handling in Next.js
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  if (!mounted) {
    if (variant === 'dropdown') {
      return (
        <div className="h-8 w-24 rounded-md border border-gray-300 dark:border-orange-400/20" />
      )
    }
    return (
      <div className="h-9 w-9 rounded-md border border-gray-300 dark:border-orange-400/20" />
    )
  }

  if (variant === 'dropdown') {
    const ThemeIcon = resolvedTheme === 'dark' ? Moon : Sun

    return (
      <div className="relative inline-flex items-center">
        <ThemeIcon className="pointer-events-none absolute left-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
        <select
          value={resolvedTheme}
          onChange={(e) => setTheme(e.target.value)}
          className="appearance-none rounded-md border border-gray-300 bg-transparent py-1.5 pl-8 pr-8 font-serif text-sm tracking-wide text-gray-600 transition-colors hover:text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-300 dark:border-orange-400/20 dark:text-gray-400 dark:hover:text-white dark:focus:ring-orange-400/40"
          aria-label="Select theme"
        >
          <option value="dark">Dark</option>
          <option value="light">Light</option>
        </select>
        <svg
          className="pointer-events-none absolute right-2 h-4 w-4 text-gray-500 dark:text-gray-400"
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
    )
  }

  const toggleTheme = () => {
    const nextTheme = resolvedTheme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
  }

  const isDark = resolvedTheme === 'dark'

  return (
    <button
      onClick={toggleTheme}
      className="rounded-md border border-gray-300 p-2 text-gray-700 transition-colors hover:bg-gray-100 dark:border-orange-400/20 dark:text-gray-300 dark:hover:bg-gray-800"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <Sun className="h-5 w-5" aria-hidden="true" />
      ) : (
        <Moon className="h-5 w-5" aria-hidden="true" />
      )}
    </button>
  )
}
