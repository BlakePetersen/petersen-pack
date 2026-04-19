// ABOUTME: PrevNextNav — symmetric prev/next article navigation at the foot of content pages.
// ABOUTME: Consumers resolve slugs and pass { href, label } slots; this primitive is presentation-only.
import Link from 'next/link'
import { cn } from '../../../lib/utils'

type NavSlot = { href: string; label: string }

type PrevNextNavProps = {
  prev?: NavSlot
  next?: NavSlot
  className?: string
}

export function PrevNextNav({ prev, next, className }: PrevNextNavProps) {
  if (!prev && !next) return null
  return (
    <nav
      aria-label="Article navigation"
      className={cn(
        'mt-12 flex justify-between border-t border-border pt-6 font-mono text-sm',
        className
      )}
    >
      <div>
        {prev && (
          <Link
            href={prev.href}
            className="text-muted-foreground transition-colors hover:text-primary hover:underline"
          >
            {'← prev: '}
            {prev.label}
          </Link>
        )}
      </div>
      <div className="ml-auto">
        {next && (
          <Link
            href={next.href}
            className="text-muted-foreground transition-colors hover:text-primary hover:underline"
          >
            {'next: '}
            {next.label}
            {' →'}
          </Link>
        )}
      </div>
    </nav>
  )
}
