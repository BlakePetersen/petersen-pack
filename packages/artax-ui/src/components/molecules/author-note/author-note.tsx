// ABOUTME: AuthorNote — generic editorial aside with optional byline + date header.
// ABOUTME: Single source of truth; mdxComponents.AuthorNote re-exports from here.
import type { ReactNode } from 'react'
import { cn } from '../../../lib/utils'

type AuthorNoteProps = {
  author?: { name: string; avatar?: string; href?: string }
  date?: string
  children: ReactNode
  className?: string
}

function AuthorNote({ author, date, children, className }: AuthorNoteProps) {
  const hasMeta = Boolean(author || date)
  return (
    <aside
      role="note"
      aria-label="Author's note"
      className={cn(
        'my-6 border-l-2 border-info bg-[var(--surface-info)] px-4 py-3',
        className
      )}
    >
      <p className="mb-2 font-mono text-xs text-info">{'// author_note'}</p>
      {hasMeta && (
        <p className="mb-2 font-mono text-xs text-muted-foreground">
          {author?.name}
          {author && date ? ' · ' : null}
          {date}
        </p>
      )}
      <div className="font-mono text-sm text-secondary-foreground leading-relaxed">
        {children}
      </div>
    </aside>
  )
}

export { AuthorNote }
export type { AuthorNoteProps }
