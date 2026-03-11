// ABOUTME: Server component and URL builder for the "Report a problem" link.
// ABOUTME: Constructs a pre-filled GitHub issue URL using the content-issue.yml template.

export function buildReportUrl(pageTitle: string, pageUrl: string): string {
  const url = new URL(
    'https://github.com/BlakePetersen/petersen-pack/issues/new',
  )
  url.searchParams.set('template', 'content-issue.yml')
  url.searchParams.set('title', `Content issue: ${pageTitle}`)
  url.searchParams.set('page-url', pageUrl)
  url.searchParams.set('labels', 'content')
  return url.toString()
}

export function ReportProblemLink({
  title,
  pageUrl,
}: {
  title: string
  pageUrl: string
}) {
  const href = buildReportUrl(title, pageUrl)

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-mono text-xs text-terminal-muted hover:text-terminal-text"
    >
      Report a problem &#8599;
    </a>
  )
}
