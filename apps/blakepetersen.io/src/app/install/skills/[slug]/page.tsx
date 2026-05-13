// ABOUTME: Variant 3 prototype — install-context view at /install/skills/[slug].
// ABOUTME: Foregrounds the `blink apply` command as protagonist; file render is supporting context.

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { readArtifactsJson } from '../../../../lib/artifacts'
import { ArtifactBody, ArtifactDataProvider } from '../../../../components/mdx/artifact-body'
import { CopyCommandBlock } from './copy-command-block'

export const dynamicParams = true

export default async function InstallContextViewPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const all = readArtifactsJson()
  const artifact = all.find((a) => a.slug === slug)

  if (!artifact) notFound()

  const command = `blink apply ${artifact.type}/${slug}`
  const fileCount = artifact.files.length
  const destinations = artifact.files.map((f) => f.path)

  const artifactData = all.map((a) => ({
    slug: a.slug,
    name: a.name,
    type: a.type,
    files: a.files.map((f) => ({ path: f.path, content: f.content })),
  }))

  return (
    <article className="mx-auto max-w-[900px] px-4 py-10">
      <header className="mb-8">
        <p className="mb-2 font-mono text-xs text-muted-foreground">
          {'// install_context_view'}
        </p>
        <h1 className="mb-1 font-mono text-2xl font-bold">{artifact.name}</h1>
        <p className="font-mono text-sm text-muted-foreground">
          Install context for{' '}
          <Link
            href={`/skills/${slug}`}
            className="text-primary hover:underline"
          >
            /skills/{slug}
          </Link>
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
        <ArtifactDataProvider artifacts={artifactData}>
          <ArtifactBody slug={slug} />
        </ArtifactDataProvider>
      </section>
    </article>
  )
}
