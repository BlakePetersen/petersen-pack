// ABOUTME: Expand/collapse display for GitHub release notes using native details/summary.
// ABOUTME: Renders release body as preformatted text matching the terminal aesthetic.

'use client'

export function ReleaseBody({ body }: { body: string }) {
  if (!body.trim()) return null

  const lines = body.split('\n')
  const preview = lines.slice(0, 5).join('\n')
  const hasMore = lines.length > 5

  if (!hasMore) {
    return (
      <pre className="mt-2 whitespace-pre-wrap font-mono text-xs text-terminal-secondary">
        {body}
      </pre>
    )
  }

  return (
    <details className="mt-2">
      <summary className="cursor-pointer font-mono text-xs text-terminal-muted hover:text-amber-accent">
        <span className="ml-1">
          {preview.slice(0, 120)}
          {preview.length > 120 ? '...' : ''}
        </span>
      </summary>
      <pre className="mt-2 whitespace-pre-wrap font-mono text-xs text-terminal-secondary">
        {body}
      </pre>
    </details>
  )
}
