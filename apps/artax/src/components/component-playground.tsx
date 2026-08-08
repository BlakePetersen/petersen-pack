// ABOUTME: Playground tab body for interactive component previews.
// ABOUTME: Owns live preview canvas, props-form, and optional JSX editor state.

'use client'

import * as React from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Button,
  Input,
  Badge,
  Separator,
  CopyButton,
  Toggle,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Callout,
  CodeBlock,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from 'artax-ui'
import type { ComponentDef } from '@/lib/component-registry'
import {
  decodePlaygroundParams,
  pushPlaygroundParams
} from '@/lib/playground-url-state'
import { PlaygroundPropsForm } from '@/components/playground-props-form'
import { PlaygroundJsxEditor } from '@/components/playground-jsx-editor'

export interface ComponentPlaygroundProps {
  comp: ComponentDef
}

export function ComponentPlayground({ comp }: ComponentPlaygroundProps) {
  // Excluded per D-05 (Dialog/Dropdown/Tooltip/Accordion) or components with
  // no playground config. Early return keeps the gate clean — no stub UI.
  if (!comp.playground?.enabled) return null

  return <PlaygroundBody comp={comp} />
}

// Enumerated artax-ui scope for the JSX editor. Per 24-01-SPIKE-RESULT.md
// Open Question 2: use named exports rather than `...artaxUI` spread. Spreading
// 68 exports into every Playground LiveProvider would defeat tree-shaking and
// leak any new export into the sandbox automatically. The 22 names below match
// the playground-enabled registry entries (atoms + molecules minus the 4
// trigger-based excluded components).
const jsxEditorScope: Record<string, unknown> = {
  React,
  Button,
  Input,
  Badge,
  Separator,
  CopyButton,
  Toggle,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Callout,
  CodeBlock,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
}

// Split body from gate so hooks are never called on excluded components
// (avoids conditional-hook lint errors and preserves hook ordering).
function PlaygroundBody({ comp }: { comp: ComponentDef }) {
  const searchParams = useSearchParams()

  const initial = useMemo(
    () =>
      decodePlaygroundParams(
        searchParams
          ? new URLSearchParams(searchParams.toString())
          : new URLSearchParams()
      ),
    [searchParams]
  )

  const [values, setValues] = useState<Record<string, string>>(initial)

  const pushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleChange = (next: Record<string, string>) => {
    setValues(next)
    if (pushTimerRef.current) clearTimeout(pushTimerRef.current)
    pushTimerRef.current = setTimeout(() => pushPlaygroundParams(next), 300)
  }

  useEffect(
    () => () => {
      if (pushTimerRef.current) clearTimeout(pushTimerRef.current)
    },
    []
  )

  // JSX editor state — ephemeral per D-04 (URL never mutated by JSX edits).
  // resetCounter is passed as `key` on PlaygroundJsxEditor so onReset forces a
  // fresh mount with codeExamples[0].code as the seed (react-live's LiveEditor
  // owns its contenteditable buffer and does not respect seed-prop changes
  // after mount).
  const seedCode = comp.codeExamples[0]?.code ?? ''
  const [showJsx, setShowJsx] = useState(false)
  const [resetCounter, setResetCounter] = useState(0)

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-mono text-xs text-muted-foreground mb-3">
          {'// playground'}
        </h3>
        <div
          data-testid="playground-canvas"
          className="bg-[radial-gradient(circle,var(--color-border)_1px,transparent_1px)] bg-[length:16px_16px] border border-border"
        >
          <div className="flex items-center justify-center min-h-[120px] p-6">
            {comp.preview(values)}
          </div>
        </div>
      </div>
      <PlaygroundPropsForm
        props={comp.props}
        values={values}
        onChange={handleChange}
      />
      <div className="flex items-center gap-2 pt-4 border-t border-border">
        <Toggle pressed={showJsx} onPressedChange={setShowJsx}>
          Edit JSX
        </Toggle>
        <span className="font-mono text-xs text-muted-foreground">
          {'// toggle free-form jsx editor'}
        </span>
      </div>
      {showJsx && (
        <PlaygroundJsxEditor
          key={resetCounter}
          code={seedCode}
          scope={jsxEditorScope}
          onReset={() => setResetCounter(n => n + 1)}
        />
      )}
    </div>
  )
}
