// ABOUTME: Sticky terminal-styled header with site branding.
// ABOUTME: Displays "// blake_petersen" as a link to the homepage with a nav placeholder.

import Link from 'next/link'

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-terminal-border bg-terminal-bg">
      <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-4">
        <Link href="/" className="font-mono text-lg font-bold text-terminal-text">
          <span className="text-terminal-muted">{'// '}</span>
          blake_petersen
        </Link>
        <nav />
      </div>
    </header>
  )
}
