// ABOUTME: Sticky terminal-styled header with site branding and mobile navigation drawer.
// ABOUTME: Displays "// blake_petersen" as a link to the homepage with hamburger menu on mobile.

import Link from 'next/link'
import { buildNavSections } from '../lib/navigation'
import { SidebarDrawer } from './sidebar-drawer'

export function Header() {
  const sections = buildNavSections()

  return (
    <header className="sticky top-0 z-50 border-b border-terminal-border bg-terminal-bg">
      <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-4">
        <Link href="/" className="font-mono text-lg font-bold text-terminal-text">
          <span className="text-terminal-muted">{'// '}</span>
          blake_petersen
        </Link>
        <nav>
          <SidebarDrawer sections={sections} />
        </nav>
      </div>
    </header>
  )
}
