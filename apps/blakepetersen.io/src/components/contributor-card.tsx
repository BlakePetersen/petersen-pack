// ABOUTME: Card component displaying a GitHub contributor's avatar, username, and stats.
// ABOUTME: Handles both full ContributorStats and basic Contributor types via union prop.

import Image from 'next/image'
import type { Contributor, ContributorStats } from '../lib/github'

function isContributorStats(
  contributor: ContributorStats | Contributor
): contributor is ContributorStats {
  return 'totalCommits' in contributor
}

function formatMonth(iso: string | null): string {
  if (!iso) return ''
  const date = new Date(iso)
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export function ContributorCard({
  contributor,
}: {
  contributor: ContributorStats | Contributor
}) {
  const full = isContributorStats(contributor)

  return (
    <div className="border border-border p-4">
      <div className="flex gap-3">
        <Image
          src={contributor.avatarUrl}
          alt={contributor.login}
          width={64}
          height={64}
          className="h-16 w-16"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <a
              href={contributor.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-sm text-primary hover:underline"
            >
              {contributor.login}
            </a>
            {contributor.isBot && (
              <span className="border border-border px-1 font-mono text-xs text-muted-foreground">
                [bot]
              </span>
            )}
          </div>
          <div className="mt-1 space-y-0.5 font-mono text-xs text-muted-foreground">
            <p>
              {full
                ? `${contributor.totalCommits} commits`
                : `${contributor.contributions} contributions`}
            </p>
            {full && (
              <p>
                +{contributor.totalAdditions} / -{contributor.totalDeletions}
              </p>
            )}
            {full &&
              contributor.firstContribution &&
              contributor.lastContribution && (
                <p>
                  {formatMonth(contributor.firstContribution)} –{' '}
                  {formatMonth(contributor.lastContribution)}
                </p>
              )}
          </div>
        </div>
      </div>
    </div>
  )
}
