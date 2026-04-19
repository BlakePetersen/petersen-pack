// ABOUTME: Client-side component page body for dynamic component documentation.
// ABOUTME: Looks up registry data client-side to avoid passing functions across server/client boundary.

'use client'

import { Separator, Tabs, TabsList, TabsTrigger, TabsContent } from 'artax-ui'
import { getComponent } from '@/lib/component-registry'
import { ComponentPreview } from '@/components/component-preview'
import { PropsTable } from '@/components/props-table'
import { CodeExamples } from '@/components/code-examples'
import { ComponentPlayground } from '@/components/component-playground'

export function ComponentPageClient({
  tier,
  slug,
}: {
  tier: string
  slug: string
}) {
  const comp = getComponent(tier, slug)

  if (!comp) {
    return null
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{comp.name}</h1>
        <p className="mt-1 text-muted-foreground">{comp.description}</p>
        <p className="mt-2 font-mono text-xs text-muted-foreground">
          {comp.imports}
        </p>
      </div>

      <ComponentPreview
        variants={comp.variants}
        renderPreview={comp.preview}
      />

      <Separator />

      <Tabs defaultValue="code">
        <TabsList>
          <TabsTrigger value="code">Code</TabsTrigger>
          <TabsTrigger value="props">Props</TabsTrigger>
          {comp.playground?.enabled && (
            <TabsTrigger value="playground">Playground</TabsTrigger>
          )}
        </TabsList>
        <TabsContent value="code">
          <CodeExamples examples={comp.codeExamples} />
        </TabsContent>
        <TabsContent value="props">
          <PropsTable props={comp.props} />
        </TabsContent>
        {comp.playground?.enabled && (
          <TabsContent value="playground">
            <ComponentPlayground comp={comp} />
          </TabsContent>
        )}
      </Tabs>

      <Separator />

      <div>
        <h2 className="font-mono text-xs text-muted-foreground mb-3">
          {'// accessibility'}
        </h2>
        <ul className="space-y-1 text-sm text-foreground">
          {comp.a11y.map((note) => (
            <li key={note} className="flex gap-2">
              <span className="text-muted-foreground">-</span>
              {note}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
