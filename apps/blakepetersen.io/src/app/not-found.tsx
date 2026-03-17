// ABOUTME: Terminal-styled 404 page for unmatched routes.
// ABOUTME: Displays a "not_found" message with a link back to the homepage.

import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <div className="max-w-[80ch] text-center font-mono">
        <h1 className="mb-4 text-4xl font-bold text-foreground">
          404: not_found
        </h1>
        <p className="mb-8 text-muted-foreground">
          The requested path does not exist in the current directory.
        </p>
        <Link
          href="/"
          className="text-primary hover:underline"
        >
          $ cd /
        </Link>
      </div>
    </div>
  )
}
