// ABOUTME: Contributors page displaying GitHub contributor avatars and commit stats.
// ABOUTME: Uses ISR with 1-hour revalidation; falls back to basic contributor data if stats unavailable.

import type { Metadata } from 'next'
import {
  getContributorStats,
  getContributors,
  type Contributor,
  type ContributorStats
} from '../../lib/github'
import { ContentShell } from '../../components/content-shell'
import { Sidebar } from '../../components/sidebar'
import { ContributorCard } from '../../components/contributor-card'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Contributors',
  description:
    'People who have contributed to blakepetersen.io — avatars, commit stats, and contribution history.',
  alternates: {
    canonical: 'https://blakepetersen.io/contributors'
  }
}

export default async function ContributorsPage() {
  let contributors: (ContributorStats | Contributor)[] =
    await getContributorStats()

  if (contributors.length === 0) {
    contributors = await getContributors()
  }

  // Sort by commit count descending
  contributors.sort((a, b) => {
    const aCount = 'totalCommits' in a ? a.totalCommits : a.contributions
    const bCount = 'totalCommits' in b ? b.totalCommits : b.contributions
    return bCount - aCount
  })

  return (
    <ContentShell sidebar={<Sidebar />}>
      <div className="px-4 py-8">
        <h1 className="mb-1 font-mono text-sm text-muted-foreground">
          {'// '}contributors
        </h1>
        <p className="mb-8 font-mono text-xs text-muted-foreground">
          {contributors.length} contributor
          {contributors.length !== 1 ? 's' : ''}
        </p>

        {contributors.length === 0 ? (
          <div className="py-8 font-mono text-sm">
            <p className="text-muted-foreground">$ git shortlog -sn</p>
            <p className="mt-1 text-secondary-foreground">
              No contributors found.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {contributors.map(contributor => (
              <ContributorCard
                key={contributor.login}
                contributor={contributor}
              />
            ))}
          </div>
        )}
      </div>
    </ContentShell>
  )
}
