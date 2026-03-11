// ABOUTME: Client wrapper that lifts giscus reaction state to the page header via context.
// ABOUTME: Renders the discussion section with terminal-styled header, report link, and giscus widget.

'use client'

import { useReactionCount } from './reaction-count'
import { ReportProblemLink } from './report-problem-link'
import { GiscusComments } from './giscus-comments'

export function DiscussionWithReactions({
  slug,
  title,
  pageUrl,
}: {
  slug: string
  title: string
  pageUrl: string
}) {
  const { setCount } = useReactionCount()

  return (
    <section className="mt-8 border border-terminal-border p-4">
      <div className="flex items-baseline justify-between">
        <h3 className="font-mono text-xs text-terminal-info">
          {'// discussion'}
        </h3>
        <ReportProblemLink title={title} pageUrl={pageUrl} />
      </div>
      <GiscusComments
        onMetadata={(data) => setCount(data.reactionCount)}
      />
    </section>
  )
}
