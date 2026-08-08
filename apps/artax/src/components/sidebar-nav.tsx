// ABOUTME: Client sidebar navigation with active state and tier groupings.
// ABOUTME: Renders navigation sections with terminal-style tier headings and active page indicator.

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export interface SidebarSection {
  label: string
  items: { name: string; href: string }[]
}

export function SidebarNav({ sections }: { sections: SidebarSection[] }) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1 py-4 px-3" aria-label="Sidebar">
      {sections.map((section, i) => (
        <div
          key={section.label || `section-${i}`}
          className={section.label ? 'mt-4' : ''}
        >
          {section.label && (
            <span className="block px-3 pb-1 font-mono text-xs text-muted-foreground">
              {section.label}
            </span>
          )}
          {section.items.map(item => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  isActive
                    ? 'block px-3 py-1.5 text-sm border-l-2 border-primary bg-accent text-foreground'
                    : 'block px-3 py-1.5 text-sm border-l-2 border-transparent text-secondary-foreground hover:text-foreground'
                }
              >
                {item.name}
              </Link>
            )
          })}
        </div>
      ))}
    </nav>
  )
}
