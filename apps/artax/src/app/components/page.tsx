// ABOUTME: Stub page for the Components catalog section.
// ABOUTME: Placeholder content to establish the URL route for Phase 23.

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Components',
}

export default function ComponentsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold">Components</h1>
      <p className="text-muted-foreground">
        Coming soon. Browse all components organized by Atomic Design tier.
      </p>
    </div>
  )
}
