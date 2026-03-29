// ABOUTME: Lean header for the Artax UI reference site.
// ABOUTME: Displays hamburger (mobile), "Artax UI" wordmark, and theme toggle.

import Link from 'next/link'
import { Menu } from 'lucide-react'

import { ThemeToggle } from '@/components/theme-toggle'
import { SidebarDrawer } from '@/components/sidebar-drawer'
import { getSidebarSections } from '@/lib/component-registry'

export function Header() {
  const sections = getSidebarSections()

  return (
    <header className="flex items-center justify-between border-b border-border px-6 py-3">
      <div className="flex items-center gap-3">
        <div className="md:hidden">
          <SidebarDrawer sections={sections}>
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground"
              aria-label="Open navigation"
            >
              <Menu size={20} />
            </button>
          </SidebarDrawer>
        </div>
        <Link href="/" className="font-mono font-bold text-foreground">Artax UI</Link>
      </div>
      <ThemeToggle />
    </header>
  )
}
