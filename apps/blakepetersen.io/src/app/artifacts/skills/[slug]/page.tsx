// ABOUTME: Variant 1 prototype — bare artifact viewer at /artifacts/skills/[slug].
// ABOUTME: Minimal chrome, full-width file render, no ApplyActionBar — pure file viewer feel.

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { readArtifactsJson } from '../../../../lib/artifacts'
import { ArtifactBody, ArtifactDataProvider } from '../../../../components/mdx/artifact-body'

export const dynamicParams = true

export default async function ArtifactBareViewerPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const all = readArtifactsJson()
  const artifact = all.find((a) => a.slug === slug)

  if (!artifact) notFound()

  const artifactData = all.map((a) => ({
    slug: a.slug,
    name: a.name,
    type: a.type,
    files: a.files.map((f) => ({ path: f.path, content: f.content })),
  }))

  return (
    <article className="mx-auto max-w-[1200px] px-4 py-8">
      <header className="mb-6">
        <p className="mb-2 font-mono text-xs text-muted-foreground">
          {'// artifact_viewer'}
        </p>
        <h1 className="mb-2 font-mono text-2xl font-bold">{artifact.name}</h1>
        <p className="font-mono text-sm text-muted-foreground">
          Raw artifact from{' '}
          <Link
            href={`/skills/${slug}`}
            className="text-primary hover:underline"
          >
            /skills/{slug}
          </Link>
        </p>
      </header>

      <ArtifactDataProvider artifacts={artifactData}>
        <ArtifactBody slug={slug} />
      </ArtifactDataProvider>
    </article>
  )
}
