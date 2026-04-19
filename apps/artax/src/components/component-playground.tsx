// ABOUTME: Playground tab body for interactive component previews.
// ABOUTME: Owns live preview canvas, props-form, and optional JSX editor state.

'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import type { ComponentDef } from '@/lib/component-registry'
import {
  decodePlaygroundParams,
  pushPlaygroundParams,
} from '@/lib/playground-url-state'
import { PlaygroundPropsForm } from '@/components/playground-props-form'

export interface ComponentPlaygroundProps {
  comp: ComponentDef
}

export function ComponentPlayground({ comp }: ComponentPlaygroundProps) {
  // Excluded per D-05 (Dialog/Dropdown/Tooltip/Accordion) or components with
  // no playground config. Early return keeps the gate clean — no stub UI.
  if (!comp.playground?.enabled) return null

  return <PlaygroundBody comp={comp} />
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
            {/* NOTE: preview renders the registry default; form values flow to URL for shareability. Full prop→preview wiring deferred — see plan 24-05 <deferred> block. */}
            {comp.preview()}
          </div>
        </div>
      </div>
      <PlaygroundPropsForm
        props={comp.props}
        values={values}
        onChange={handleChange}
      />
    </div>
  )
}
