// ABOUTME: Guided onboarding page with numbered steps linking to content.
// ABOUTME: Resolves step slugs against content collections and skips missing items.

import type { Metadata } from 'next'
import Link from 'next/link'
import { getCollection } from '../../lib/collection-registry'

export const metadata: Metadata = {
  title: 'Start Here',
  description: 'A guided introduction to the DX practices documented on this site.',
}

type Step = {
  collection: 'configs' | 'hooks' | 'skills' | 'guides'
  slug: string
  why: string
}

const steps: Step[] = [
  { collection: 'configs', slug: 'configs/eslint-flat-config', why: 'Consistent code style is the foundation everything else builds on.' },
  { collection: 'hooks', slug: 'hooks/pre-commit/lint-staged-setup', why: 'Automated quality gates on every commit.' },
  { collection: 'guides', slug: 'guides/monorepo-setup', why: 'Structure your project for scale from day one.' },
  { collection: 'skills', slug: 'skills/claude-code/writing-custom-skills', why: 'Teach your AI assistant project-specific patterns.' },
]

function resolveSteps() {
  const resolved: { title: string; href: string; why: string; number: number; collection: Step['collection'] }[] = []
  let number = 1

  for (const step of steps) {
    const items = getCollection(step.collection).getter()
    const match = items.find((item) => item.slug === step.slug)
    if (match) {
      resolved.push({
        title: match.title,
        href: `/${step.slug}`,
        why: step.why,
        number,
        collection: step.collection,
      })
      number++
    }
  }

  return resolved
}

export default function StartHerePage() {
  const resolved = resolveSteps()

  return (
    <div className="mx-auto max-w-[72ch] px-4 py-12">
      <section className="mb-12">
        <p className="mb-4 font-mono text-xs text-muted-foreground">{'// start_here'}</p>
        <h1 className="mb-3 font-mono-alt text-3xl leading-tight">
          A guided path through the practices.
        </h1>
        <p className="mb-6 font-mono text-lg leading-relaxed text-muted-foreground">
          Four steps, in order. Each one builds the foundation for the next.
        </p>
        <a href="#steps" className="font-mono text-base text-primary hover:underline">
          $ start-here
        </a>
      </section>

      {resolved.length > 0 ? (
        <ol id="steps" className="mt-12 space-y-6">
          {resolved.map((step) => (
            <li
              key={step.href}
              className="bg-card p-6 border border-border"
            >
              <div className="mb-2 flex items-baseline gap-3">
                <span className="text-primary font-mono text-lg">
                  {String(step.number).padStart(2, '0')}
                </span>
                <h3 className="font-mono text-base font-medium text-foreground">
                  {step.title}
                </h3>
              </div>
              <p className="font-mono text-base leading-relaxed text-muted-foreground">
                {step.why}
              </p>
              <Link
                href={step.href}
                className="mt-3 inline-block font-mono text-base text-primary hover:underline"
              >
                {`$ go-to-${step.collection}`}
              </Link>
            </li>
          ))}
        </ol>
      ) : (
        <p className="font-mono text-base text-muted-foreground">
          No content available yet. Check back soon.
        </p>
      )}

      <section className="mt-12 border-t border-border pt-6">
        <p className="mb-2 font-mono text-xs text-muted-foreground">{'// next'}</p>
        <p className="font-mono text-base">
          <Link href="/skills" className="text-primary hover:underline">[skills]</Link>
          {' or head back to the '}
          <Link href="/" className="text-primary hover:underline">[home]</Link>
          .
        </p>
      </section>
    </div>
  )
}
