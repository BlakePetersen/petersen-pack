// ABOUTME: Server component wrapping the discussion header, report link, and giscus widget.
// ABOUTME: Composes the terminal-styled discussion section for content pages.

import { ReportProblemLink } from './report-problem-link'
import { GiscusComments } from './giscus-comments'

export function DiscussionSection({
  slug,
  title,
  pageUrl,
}: {
  slug: string
  title: string
  pageUrl: string
}) {
  return (
    <section className="mt-8 border border-terminal-border p-4">
      <div className="flex items-baseline justify-between">
        <h3 className="font-mono text-xs text-terminal-info">
          {'// discussion'}
        </h3>
        <ReportProblemLink title={title} pageUrl={pageUrl} />
      </div>
      <GiscusComments term={slug} />
    </section>
  )
}
