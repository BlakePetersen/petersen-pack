// ABOUTME: Client-side copy block for the install-context view's protagonist `blink apply` command.
// ABOUTME: Type-agnostic — `command` is a fully-formed string from the parent server component.

'use client'

import { useState } from 'react'

export function CopyCommandBlock({ command }: { command: string }) {
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>(
    'idle'
  )

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(command)
      setCopyState('copied')
    } catch {
      // Clipboard access can be denied (permissions policy, insecure context);
      // a mute button reads as broken, so surface the failure.
      setCopyState('failed')
    }
    setTimeout(() => setCopyState('idle'), 2000)
  }

  return (
    <section className="mb-6 rounded-md border border-border bg-muted/30 p-5">
      <p className="mb-3 font-mono text-[0.7rem] uppercase tracking-wider text-muted-foreground">
        run this command in your project root
      </p>
      <div className="flex items-center justify-between gap-3">
        <code className="overflow-x-auto whitespace-nowrap font-mono text-lg font-medium text-foreground">
          <span className="text-muted-foreground">$ </span>
          {command}
        </code>
        <button
          onClick={handleCopy}
          className="shrink-0 rounded border border-border bg-background px-3 py-1.5 font-mono text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          {copyState === 'copied'
            ? 'copied!'
            : copyState === 'failed'
              ? 'copy failed'
              : 'copy'}
        </button>
      </div>
    </section>
  )
}
