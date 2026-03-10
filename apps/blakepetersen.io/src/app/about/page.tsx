// ABOUTME: About page with bio, philosophy, and project explanation sections.
// ABOUTME: Terminal-styled static page with placeholder content for Blake to expand.

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About',
  description: 'About Blake Petersen and the DX workbench project.',
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[80ch] px-4 py-8">
      <section className="mb-12">
        <p className="mb-4 font-mono text-xs text-terminal-muted">{'// about'}</p>
        <div className="space-y-4 text-sm text-terminal-secondary">
          <p className="font-sans">
            Blake Petersen &mdash; software engineer focused on developer experience
            and AI-augmented workflows.
          </p>
          <p className="font-sans text-terminal-muted">
            [TODO: Blake to flesh out bio with professional context]
          </p>
        </div>
      </section>

      <section className="mb-12">
        <p className="mb-4 font-mono text-xs text-terminal-muted">{'// philosophy'}</p>
        <div className="space-y-4 text-sm text-terminal-secondary">
          <p className="font-sans">
            Why opinionated DX? Because every team reinvents the same linting configs,
            git hooks, and CI pipelines. This site documents one set of opinionated
            choices and makes them instantly applicable via Claude Code skills.
          </p>
          <p className="font-sans text-terminal-muted">
            [TODO: Blake to expand philosophy section]
          </p>
        </div>
      </section>

      <section className="mb-12">
        <p className="mb-4 font-mono text-xs text-terminal-muted">{'// this_project'}</p>
        <div className="space-y-4 text-sm text-terminal-secondary">
          <p className="font-sans">
            This site is both documentation and a reference implementation. Every
            practice documented here is applied to this codebase. The content pipeline,
            design system, and automation are all examples of the DX patterns described.
          </p>
          <p className="font-sans text-terminal-muted">
            [TODO: Blake to add more project context]
          </p>
        </div>
      </section>
    </div>
  )
}
