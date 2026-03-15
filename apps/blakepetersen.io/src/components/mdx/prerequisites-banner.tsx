// ABOUTME: Renders a prerequisites banner at the top of article content.
// ABOUTME: Resolves dependency slugs to linked items with terminal-aesthetic styling.

import Link from 'next/link'
import { resolveRelatedSlugs } from '../../lib/content'

function PrerequisitesBanner({ slugs }: { slugs: string[] }) {
  if (!slugs || slugs.length === 0) return null

  const items = resolveRelatedSlugs(slugs)
  if (items.length === 0) return null

  return (
    <div className="mb-6 border-l-2 border-amber-500 bg-zinc-900/50 px-4 py-3">
      <span className="mb-1 block font-mono text-xs text-terminal-muted">
        {'// '}prerequisites
      </span>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="group font-mono text-sm text-terminal-text transition-colors hover:text-amber-500"
            >
              <span className="text-terminal-muted group-hover:text-amber-500">
                {'-> '}
              </span>
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export { PrerequisitesBanner }
