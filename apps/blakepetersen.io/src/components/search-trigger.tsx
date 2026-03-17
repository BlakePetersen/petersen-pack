// ABOUTME: Search icon button that opens the command palette.
// ABOUTME: Shows search icon with Cmd+K hint text, responsive for mobile.

'use client'

import { Search } from 'lucide-react'

type SearchTriggerProps = {
  onClick: () => void
}

export function SearchTrigger({ onClick }: SearchTriggerProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 font-mono text-sm text-muted-foreground transition-colors hover:text-primary"
      aria-label="Search content (Cmd+K)"
    >
      <Search className="h-4 w-4" />
      <kbd className="hidden rounded border border-border px-1.5 py-0.5 text-xs sm:inline-block">
        ⌘K
      </kbd>
    </button>
  )
}
