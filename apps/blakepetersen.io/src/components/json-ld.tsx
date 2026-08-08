// ABOUTME: Reusable JSON-LD script tag renderer for structured data.
// ABOUTME: Server component that injects schema.org data into page head.

import type { Thing, WithContext } from 'schema-dts'

export function JsonLd({ data }: { data: WithContext<Thing> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c')
      }}
    />
  )
}
