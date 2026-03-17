// ABOUTME: Anchor link for headings that copies the URL with hash to clipboard.
// ABOUTME: Shows # on hover, briefly flashes a checkmark after successful copy.

'use client'

import { useState, useCallback } from 'react'

export function HeadingAnchor({ id }: { id?: string }) {
  const [copied, setCopied] = useState(false)

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      if (!id) return

      window.location.hash = id
      try {
        void navigator.clipboard.writeText(window.location.href)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      } catch {
        // Clipboard API may not be available
      }
    },
    [id],
  )

  if (!id) return null

  return (
    <a
      href={`#${id}`}
      onClick={handleClick}
      className="absolute -left-6 top-0 opacity-0 transition-opacity group-hover:opacity-100 text-muted-foreground hover:text-primary"
      aria-label={`Link to ${id}`}
    >
      {copied ? '✓' : '#'}
    </a>
  )
}
