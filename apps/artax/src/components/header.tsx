// ABOUTME: Lean header for the Artax UI reference site.
// ABOUTME: Displays hamburger (mobile), "Artax UI" wordmark, and theme toggle.

import Link from 'next/link'
import { Menu } from 'lucide-react'

import { ThemeToggle } from 'artax-ui'
import { SidebarDrawer } from '@/components/sidebar-drawer'
import { getSidebarSections } from '@/lib/component-registry'

// Hydration mismatch root cause (24.1-03 investigation):
// Radix Dialog (used inside SidebarDrawer) seeds its internal aria-controls/
// aria-labelledby/aria-describedby IDs from @radix-ui/react-id, which calls
// React.useId() for its initial useState value and then replaces it in a
// useLayoutEffect with a module-scoped counter fallback. The React 19 +
// Next 16 runtime produces a different aria-controls string between the
// server-rendered hamburger button and the client's hydrated trigger, firing
// a "hydrat ... did not match" warning against apps/artax/src/components/
// header.tsx:17 (the <SidebarDrawer> → Radix DialogTrigger subtree).
// Mitigation: gate the Radix subtree on a mounted flag inside SidebarDrawer
// so SSR emits a plain <button> shell with identical className + aria-label
// and the Radix-managed IDs only appear post-mount on the client.
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
        <Link href="/" className="font-mono font-bold text-foreground">
          Artax UI
        </Link>
      </div>
      <ThemeToggle />
    </header>
  )
}
