// ABOUTME: Terminal-styled footer with command-style links and copyright.
// ABOUTME: Displays GitHub and RSS links as terminal commands with hover effects.

import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-terminal-border">
      <div className="mx-auto max-w-[1600px] px-4 py-8">
        <div className="flex flex-wrap gap-6 font-mono text-sm text-terminal-muted">
          <a
            href="https://github.com/blakepetersen"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-amber-accent"
          >
            $ github
          </a>
          <Link href="/feed.xml" className="hover:text-amber-accent">
            $ rss
          </Link>
        </div>
        <p className="mt-4 font-mono text-xs text-terminal-muted">
          &copy; {new Date().getFullYear()} Blake Petersen
        </p>
      </div>
    </footer>
  )
}
