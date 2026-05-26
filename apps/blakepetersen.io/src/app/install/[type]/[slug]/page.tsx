// ABOUTME: Install-context view at /install/<type>/<slug> for skills, configs, and hooks.
// ABOUTME: Foregrounds the `blink apply <slug>` command; file render is supporting context.

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { readArtifactsJson } from '../../../../lib/artifacts'
import { ArtifactBody, ArtifactDataProvider } from '../../../../components/mdx/artifact-body'
import { getCollection } from '../../../../lib/collection-registry'
import { CopyCommandBlock } from './copy-command-block'

export const dynamicParams = true

// Only artifact-bearing content types are reachable here. Guides have no
// artifacts per Phase 29 D-14, so /install/guides/<slug> intentionally 404s.
const INSTALLABLE_TYPES = new Set(['skills', 'configs', 'hooks'])

// Route segment uses plural collection names (matches /skills, /configs, /hooks);
// artifact metadata stores the singular type (skill, config, hook).
const TYPE_SEGMENT_TO_ARTIFACT_TYPE: Record<string, string> = {
  skills: 'skill',
  configs: 'config',
  hooks: 'hook',
}

const ARTIFACT_TYPE_TO_SEGMENT: Record<string, string> = {
  skill: 'skills',
  config: 'configs',
  hook: 'hooks',
}

// Pre-render every installable artifact at build time so the link checker
// can resolve `/install/<type>/<slug>` links from content pages, and so
// the install view doesn't pay an SSR cost on first paint.
export function generateStaticParams() {
  return readArtifactsJson()
    .filter((a) => ARTIFACT_TYPE_TO_SEGMENT[a.type])
    .map((a) => ({ type: ARTIFACT_TYPE_TO_SEGMENT[a.type], slug: a.slug }))
}

export default async function InstallContextViewPage({
  params,
}: {
  params: Promise<{ type: string; slug: string }>
}) {
  const { type, slug } = await params

  if (!INSTALLABLE_TYPES.has(type)) notFound()

  const artifactType = TYPE_SEGMENT_TO_ARTIFACT_TYPE[type]
  const all = readArtifactsJson()
  // Filter by type too — bare-slug uniqueness is only enforced within a
  // collection, so cross-collection basename collisions would otherwise let
  // /install/skills/foo resolve a config artifact named foo.
  const artifact = all.find((a) => a.slug === slug && a.type === artifactType)

  if (!artifact) notFound()

  // The content page URL is the velite slug verbatim. For nested content
  // (e.g. skills/claude-code/writing-custom-skills) the route only exposes
  // the bare trailing segment, so look up the sibling content entry to
  // recover the path-shaped slug.
  const contentItem = getCollection(type)
    .getter()
    .find(
      (item) =>
        item.slug === `${type}/${slug}` || item.slug.endsWith(`/${slug}`),
    )
  const contentHref = contentItem ? `/${contentItem.slug}` : null

  const command = `blink apply ${slug}`
  const fileCount = artifact.files.length
  const destinations = artifact.files.map((f) => f.path)

  const artifactForRoute = {
    slug: artifact.slug,
    name: artifact.name,
    type: artifact.type,
    files: artifact.files.map((f) => ({ path: f.path, content: f.content })),
  }

  return (
    <article className="mx-auto max-w-[900px] px-4 py-10">
      <header className="mb-8">
        <p className="mb-2 font-mono text-xs text-muted-foreground">
          {'// install_context_view'}
        </p>
        <h1 className="mb-1 font-mono text-2xl font-bold">{artifact.name}</h1>
        <p className="font-mono text-sm text-muted-foreground">
          Install context for{' '}
          {contentHref ? (
            <Link href={contentHref} className="text-primary hover:underline">
              {contentHref}
            </Link>
          ) : (
            <span>
              /{type}/{slug}
            </span>
          )}
        </p>
      </header>

      <CopyCommandBlock command={command} />

      <p className="mb-8 font-mono text-xs text-muted-foreground">
        Writes {fileCount === 1 ? 'this file' : `these ${fileCount} files`} into your project at{' '}
        {destinations.map((path, i) => (
          <span key={path}>
            <code className="text-foreground">{path}</code>
            {i < destinations.length - 1 ? ', ' : ''}
          </span>
        ))}
        . Existing files at those paths are replaced.
      </p>

      <section>
        <h2 className="mb-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">
          what gets written
        </h2>
        <ArtifactDataProvider artifacts={[artifactForRoute]}>
          <ArtifactBody slug={slug} />
        </ArtifactDataProvider>
      </section>
    </article>
  )
}
