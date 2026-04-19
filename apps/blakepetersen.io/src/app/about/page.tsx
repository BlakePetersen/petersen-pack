// ABOUTME: About page with bio, philosophy, and project explanation sections.
// ABOUTME: Pencil-matched recompose (SITE-05): Badge meta row, mono prose, shell CTAs.

import type { Metadata } from 'next'
import { Badge } from 'artax-ui'

export const metadata: Metadata = {
  title: 'About',
  description: 'About Blake Petersen and the DX workbench project.',
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-prose px-4 py-12">
      <section className="mb-12">
        <p className="mb-4 font-mono text-xs text-muted-foreground">{'// about'}</p>
        <h1 className="mb-6 font-mono-alt text-3xl leading-tight">
          Blake Petersen
        </h1>

        <div className="mb-8 flex flex-wrap gap-2">
          <Badge variant="outline">Blake Petersen</Badge>
          <Badge variant="outline">software engineer</Badge>
          <Badge variant="outline">developer experience</Badge>
        </div>

        <div className="space-y-4 font-mono text-lg leading-relaxed">
          <p>
            Blake Petersen &mdash; software engineer focused on developer experience
            and AI-augmented workflows.
          </p>
          <p className="text-muted-foreground">
            [TODO: Blake to flesh out bio with professional context]
          </p>
        </div>
      </section>

      <section className="mb-12">
        <p className="mb-4 font-mono text-xs text-muted-foreground">{'// philosophy'}</p>
        <div className="space-y-4 font-mono text-lg leading-relaxed">
          <p>
            Why opinionated DX? Because every team reinvents the same linting configs,
            git hooks, and CI pipelines. This site documents one set of opinionated
            choices and makes them instantly applicable via Claude Code skills.
          </p>
          <p className="text-muted-foreground">
            [TODO: Blake to expand philosophy section]
          </p>
        </div>
      </section>

      <section className="mb-12">
        <p className="mb-4 font-mono text-xs text-muted-foreground">{'// this_project'}</p>
        <div className="space-y-4 font-mono text-lg leading-relaxed">
          <p>
            This site is both documentation and a reference implementation. Every
            practice documented here is applied to this codebase. The content pipeline,
            design system, and automation are all examples of the DX patterns described.
          </p>
          <p className="text-muted-foreground">
            [TODO: Blake to add more project context]
          </p>
        </div>
      </section>

      <section className="mb-12">
        <p className="mb-4 font-mono text-xs text-muted-foreground">{'// interests'}</p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">typescript</Badge>
          <Badge variant="secondary">next.js</Badge>
          <Badge variant="secondary">design systems</Badge>
          <Badge variant="secondary">AI tooling</Badge>
          <Badge variant="secondary">monorepos</Badge>
          <Badge variant="secondary">terminal UX</Badge>
        </div>
      </section>

      <section>
        <p className="mb-4 font-mono text-xs text-muted-foreground">{'// contact'}</p>
        <div className="mt-2 space-y-2 font-mono text-base">
          <div>
            <a href="mailto:blake@blakepetersen.io" className="text-primary hover:underline">
              $ email-blake
            </a>
          </div>
          <div>
            <a
              href="https://github.com/BlakePetersen"
              className="text-primary hover:underline"
            >
              $ find-me-on-github
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
