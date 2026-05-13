// ABOUTME: Variant 3 client-side copy block — protagonist `blink apply` command with copy button.
// ABOUTME: Larger, prouder version of ApplyActionBar tailored for the dedicated install-context page.

'use client'

import { useState } from 'react'

export function CopyCommandBlock({ command }: { command: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(command)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
          {copied ? 'copied!' : 'copy'}
        </button>
      </div>
    </section>
  )
}
