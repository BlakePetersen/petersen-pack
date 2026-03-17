// ABOUTME: Changelog page displaying GitHub Releases in a vertical timeline layout.
// ABOUTME: Uses ISR with 1-hour revalidation to fetch release data from the GitHub API.

import type { Metadata } from 'next'
import { getReleases } from '../../lib/github'
import { ContentShell } from '../../components/content-shell'
import { Sidebar } from '../../components/sidebar'
import { ReleaseBody } from '../../components/release-body'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Changelog',
  description: 'Release history for blakepetersen.io — browse all published versions and release notes.',
  alternates: {
    canonical: 'https://blakepetersen.io/changelog',
  },
}

function formatDate(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default async function ChangelogPage() {
  const releases = await getReleases()

  return (
    <ContentShell sidebar={<Sidebar />}>
      <div className="px-4 py-8">
        <h1 className="mb-1 font-mono text-sm text-muted-foreground">
          {'// '}changelog
        </h1>
        <p className="mb-8 font-mono text-xs text-muted-foreground">
          Release history
        </p>

        {releases.length === 0 ? (
          <div className="py-8 font-mono text-sm">
            <p className="text-muted-foreground">$ git log --releases</p>
            <p className="mt-1 text-secondary-foreground">No releases found.</p>
          </div>
        ) : (
          <div className="relative">
            {releases.map((release, index) => {
              const isLast = index === releases.length - 1
              return (
                <div key={release.tagName} className="flex gap-4 pb-8">
                  {/* Timeline connector */}
                  <div className="flex flex-col items-center font-mono text-muted-foreground">
                    <span className="text-sm">
                      {isLast ? '└─' : '├─'}
                    </span>
                    {!isLast && (
                      <div className="w-px flex-1 border-l border-border" />
                    )}
                  </div>

                  {/* Release content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-3">
                      <span className="font-mono text-sm text-primary">
                        {release.tagName}
                      </span>
                      {release.publishedAt && (
                        <time
                          dateTime={release.publishedAt}
                          className="font-mono text-xs text-muted-foreground"
                        >
                          {formatDate(release.publishedAt)}
                        </time>
                      )}
                      <a
                        href={release.htmlUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs text-muted-foreground hover:text-primary"
                      >
                        ↗ GitHub
                      </a>
                    </div>
                    {release.name && release.name !== release.tagName && (
                      <p className="mt-1 text-sm text-secondary-foreground">
                        {release.name}
                      </p>
                    )}
                    <ReleaseBody body={release.body} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </ContentShell>
  )
}
