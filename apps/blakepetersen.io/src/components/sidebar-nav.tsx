// ABOUTME: Client-side sidebar navigation with collapsible sections and active page highlighting.
// ABOUTME: Uses pathname matching for auto-expanding current section and amber accent on active item.

'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { NavSection } from '../lib/navigation'

export function SidebarNav({ sections }: { sections: NavSection[] }) {
  const pathname = usePathname()

  const [openSections, setOpenSections] = useState<string[]>(() => {
    const matching = sections
      .filter(s => pathname.startsWith(s.href))
      .map(s => s.label)
    return matching.length > 0 ? matching : []
  })

  const activeRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    requestAnimationFrame(() => {
      activeRef.current?.scrollIntoView({ block: 'nearest' })
    })
  }, [pathname])

  function toggleSection(label: string) {
    setOpenSections(prev =>
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    )
  }

  return (
    <nav className="p-4">
      {sections.map(section => {
        const isOpen = openSections.includes(section.label)
        return (
          <div key={section.label} className="mb-2">
            <button
              onClick={() => toggleSection(section.label)}
              className="flex w-full items-center justify-between py-1.5 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <span>
                <span
                  className="mr-1.5 text-[8px]"
                  style={{ color: section.color }}
                >
                  ●
                </span>
                {'// '}
                {section.label.toLowerCase()}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-muted-foreground/60">
                  {section.items.length}
                </span>
                <span>{isOpen ? '▼' : '▶'}</span>
              </span>
            </button>

            {isOpen && (
              <ul className="ml-2 mt-1 space-y-0.5">
                {section.items.map(item => {
                  const isActive = pathname === item.href
                  return (
                    <li key={item.href}>
                      <Link
                        ref={isActive ? activeRef : undefined}
                        href={item.href}
                        className={`block truncate py-1 pl-2 font-mono text-xs transition-colors ${
                          isActive
                            ? 'font-medium text-primary bg-accent -mx-2 px-4'
                            : 'text-secondary-foreground hover:text-foreground'
                        }`}
                      >
                        {item.title}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        )
      })}
    </nav>
  )
}
