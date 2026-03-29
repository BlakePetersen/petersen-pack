// ABOUTME: Tabbed/sectioned code snippet display for component documentation.
// ABOUTME: Renders labeled code blocks using artax-ui CodeBlock with copy functionality.

import { CodeBlock, CopyButton } from 'artax-ui'
import type { CodeExample } from '@/lib/component-registry'

export function CodeExamples({ examples }: { examples: CodeExample[] }) {
  if (examples.length === 0) {
    return null
  }

  return (
    <div className="space-y-6">
      {examples.map((example) => (
        <div key={example.label}>
          <h3 className="font-mono text-sm text-muted-foreground mb-2">
            {example.label}
          </h3>
          <CodeBlock language="tsx" rawCode={example.code}>
            <pre className="p-4">
              <code>{example.code}</code>
            </pre>
          </CodeBlock>
        </div>
      ))}
    </div>
  )
}
