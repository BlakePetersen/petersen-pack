// ABOUTME: react-live JSX editor wrapper for the Playground tab.
// ABOUTME: Renders LiveProvider/LiveEditor/LivePreview with artax terminal theme.

'use client'

import { LiveProvider, LiveEditor, LivePreview, LiveError } from 'react-live'
import { artaxTerminalTheme } from '@/lib/playground-theme'

export interface PlaygroundJsxEditorProps {
  code: string
  scope: Record<string, unknown>
  onReset: () => void
}

export function PlaygroundJsxEditor({
  code,
  scope,
  onReset
}: PlaygroundJsxEditorProps) {
  return (
    <div className="bg-card border border-border overflow-hidden font-mono text-sm">
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <span className="text-muted-foreground text-xs font-mono">
          {'// jsx editor'}
        </span>
      </div>
      <LiveProvider
        code={code}
        scope={scope}
        theme={artaxTerminalTheme}
        language="tsx"
      >
        <LivePreview />
        <LiveError />
        <LiveEditor />
      </LiveProvider>
      <button
        type="button"
        onClick={onReset}
        className="font-mono text-xs text-muted-foreground px-4 py-2 border-t border-border w-full text-left"
      >
        {'// reset to example'}
      </button>
    </div>
  )
}
