// ABOUTME: Scroll spy hook that tracks which heading is currently visible.
// ABOUTME: Uses IntersectionObserver to highlight the active TOC section.

'use client'

import { useState, useEffect } from 'react'

export function useActiveHeading(): string | null {
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    const headings = document.querySelectorAll('h2[id], h3[id]')

    if (headings.length === 0) {
      return
    }

    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: '0px 0px -80% 0px' }
    )

    headings.forEach(heading => observer.observe(heading))

    return () => observer.disconnect()
  }, [])

  return activeId
}
