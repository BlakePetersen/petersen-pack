// ABOUTME: Server component displaying content freshness metadata.
// ABOUTME: Shows relative last-modified date and change frequency label derived from git history.

import { getGitHistory } from '../lib/content'
import { getFreshnessLabel, formatRelativeDate } from '../lib/git-history'

export function ContentFreshness({ slug }: { slug: string }) {
  const history = getGitHistory(slug)
  if (!history) return null

  const label = getFreshnessLabel(history.commitCount, history.lastModified)

  if (label === 'New') {
    return <span className="font-mono text-xs text-primary">New</span>
  }

  const absoluteDate = new Date(history.lastModified).toLocaleDateString(
    'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' },
  )
  const relativeDate = formatRelativeDate(history.lastModified)

  return (
    <span className="font-mono text-xs text-muted-foreground">
      <span title={absoluteDate}>Updated {relativeDate}</span>
      {' \u00b7 '}
      {label}
    </span>
  )
}
