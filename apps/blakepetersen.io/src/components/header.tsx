// ABOUTME: Sticky header with site branding, theme toggle, and mobile navigation drawer.
// ABOUTME: Displays "// blake_petersen" as a link to the homepage with hamburger menu on mobile.

import Link from 'next/link'
import { buildNavSections } from '../lib/navigation'
import { CommandPalette } from './command-palette'
import { SidebarDrawer } from './sidebar-drawer'
import { ThemeToggle } from './theme-toggle'

export function Header() {
  const sections = buildNavSections()

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between px-4">
        <Link href="/" className="font-mono text-lg font-bold text-foreground">
          <span className="text-muted-foreground">{'// '}</span>
          blake_petersen
        </Link>
        <nav className="flex items-center gap-3">
          <Link href="/start-here" className="hidden font-mono text-xs text-muted-foreground transition-colors hover:text-foreground sm:block">
            start_here
          </Link>
          <Link href="/about" className="hidden font-mono text-xs text-muted-foreground transition-colors hover:text-foreground sm:block">
            about
          </Link>
          <ThemeToggle />
          <CommandPalette />
          <SidebarDrawer sections={sections} />
        </nav>
      </div>
    </header>
  )
}
