// ABOUTME: Footer with command-style links and copyright.
// ABOUTME: Displays GitHub and RSS links as terminal commands with hover effects.

import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-[1600px] px-4 py-8">
        <div className="flex flex-wrap gap-6 font-mono text-sm text-muted-foreground">
          <a
            href="https://github.com/blakepetersen"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary"
          >
            $ github
          </a>
          <Link href="/feed.xml" className="hover:text-primary">
            $ rss
          </Link>
        </div>
        <p className="mt-4 font-mono text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Blake Petersen
        </p>
      </div>
    </footer>
  )
}
