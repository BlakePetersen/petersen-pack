// ABOUTME: Lean header for the Artax UI reference site.
// ABOUTME: Displays "Artax UI" wordmark on the left and theme toggle on the right.

import { ThemeToggle } from '@/components/theme-toggle'

export function Header() {
  return (
    <header className="flex items-center justify-between border-b border-border px-6 py-3">
      <span className="font-mono font-bold text-foreground">Artax UI</span>
      <ThemeToggle />
    </header>
  )
}
