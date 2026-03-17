// ABOUTME: Roadmap page with a prominent link to the GitHub Projects board.
// ABOUTME: Shows milestone history from releases data with ISR (1-hour revalidation).

import type { Metadata } from 'next'
import { getReleases } from '../../lib/github'
import { ContentShell } from '../../components/content-shell'
import { Sidebar } from '../../components/sidebar'

export const revalidate = 3600

const PROJECTS_URL = 'https://github.com/users/blakepetersen/projects'

export const metadata: Metadata = {
  title: 'Roadmap',
  description:
    'Project direction and milestone history for blakepetersen.io — see what has shipped and what is planned.',
  alternates: {
    canonical: 'https://blakepetersen.io/roadmap',
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

function groupByMajorVersion(
  releases: { tagName: string; name: string | null; publishedAt: string }[]
): Map<string, typeof releases> {
  const groups = new Map<string, typeof releases>()
  for (const release of releases) {
    // Extract major version from tag (e.g., "v1.2.3" -> "v1.x")
    const match = release.tagName.match(/^v?(\d+)/)
    const key = match ? `v${match[1]}.x` : 'other'
    const group = groups.get(key) ?? []
    group.push(release)
    groups.set(key, group)
  }
  return groups
}

export default async function RoadmapPage() {
  const releases = await getReleases()
  const groups = groupByMajorVersion(releases)

  return (
    <ContentShell sidebar={<Sidebar />}>
      <div className="px-4 py-8">
        <h1 className="mb-1 font-mono text-sm text-muted-foreground">
          {'// '}roadmap
        </h1>
        <p className="mb-8 font-mono text-xs text-muted-foreground">
          Project direction and milestone history
        </p>

        {/* GitHub Projects link */}
        <section className="mb-10">
          <p className="mb-3 font-mono text-xs text-muted-foreground">
            $ open github.com/projects
          </p>
          {PROJECTS_URL ? (
            <a
              href={PROJECTS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="block border border-border p-6 transition-colors hover:border-primary"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-sm text-primary">
                    GitHub Projects Board
                  </p>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">
                    View active work, upcoming plans, and project priorities
                  </p>
                </div>
                <span className="font-mono text-sm text-muted-foreground">
                  ↗
                </span>
              </div>
            </a>
          ) : (
            <div className="border border-border p-6 font-mono text-sm text-muted-foreground">
              Projects board coming soon.
            </div>
          )}
        </section>

        {/* Milestone history */}
        <section>
          <p className="mb-4 font-mono text-xs text-muted-foreground">
            {'// '}milestones
          </p>
          {releases.length === 0 ? (
            <div className="py-8 font-mono text-sm">
              <p className="text-muted-foreground">$ gh project view</p>
              <p className="mt-1 text-secondary-foreground">
                No milestones recorded yet.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Array.from(groups.entries()).map(([version, entries]) => (
                <div key={version}>
                  <h2 className="mb-2 font-mono text-sm text-secondary-foreground">
                    {version}
                  </h2>
                  <div className="space-y-0">
                    {entries.map((release) => (
                      <div
                        key={release.tagName}
                        className="flex items-baseline gap-3 border-l border-border py-1 pl-3"
                      >
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
                        {release.name && release.name !== release.tagName && (
                          <span className="truncate font-mono text-xs text-secondary-foreground">
                            {release.name}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </ContentShell>
  )
}
