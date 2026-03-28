// ABOUTME: Stub page for the Getting Started section.
// ABOUTME: Placeholder content to establish the URL route for Phase 23.

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Getting Started',
}

export default function GettingStartedPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold">Getting Started</h1>
      <p className="text-muted-foreground">
        Coming soon. This page will cover installation, setup, and
        configuration.
      </p>
    </div>
  )
}
