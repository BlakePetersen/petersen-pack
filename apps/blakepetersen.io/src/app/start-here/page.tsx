// ABOUTME: Guided onboarding page with numbered steps linking to content.
// ABOUTME: Resolves step slugs against content collections and skips missing items.

import type { Metadata } from 'next'
import Link from 'next/link'
import { getSkills, getHooks, getConfigs, getGuides } from '../../lib/content'

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

const collectionGetters = {
  configs: getConfigs,
  hooks: getHooks,
  skills: getSkills,
  guides: getGuides,
} as const

function resolveSteps() {
  const resolved: { title: string; href: string; why: string; number: number }[] = []
  let number = 1

  for (const step of steps) {
    const items = collectionGetters[step.collection]()
    const match = items.find((item) => item.slug === step.slug)
    if (match) {
      resolved.push({
        title: match.title,
        href: `/${step.slug}`,
        why: step.why,
        number,
      })
      number++
    }
  }

  return resolved
}

export default function StartHerePage() {
  const resolved = resolveSteps()

  return (
    <div className="mx-auto max-w-[80ch] px-4 py-8">
      <section className="mb-12">
        <p className="mb-4 font-mono text-xs text-terminal-muted">{'// start_here'}</p>
        <p className="mb-8 text-sm text-terminal-secondary">
          A guided path through the DX practices in recommended order.
        </p>

        <div className="space-y-6">
          {resolved.map((step) => (
            <div key={step.href} className="border border-terminal-border p-4">
              <Link
                href={step.href}
                className="font-mono text-sm text-amber-accent hover:underline"
              >
                {String(step.number).padStart(2, '0')}. {step.title}
              </Link>
              <p className="mt-2 text-sm text-terminal-muted">
                {step.why}
              </p>
            </div>
          ))}
        </div>

        {resolved.length === 0 && (
          <p className="font-mono text-sm text-terminal-muted">
            No content available yet. Check back soon.
          </p>
        )}
      </section>
    </div>
  )
}
