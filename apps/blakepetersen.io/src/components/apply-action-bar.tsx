'use client'
// ABOUTME: Sticky action bar showing the blink apply command with copy-to-clipboard.
// ABOUTME: Displayed on DX content pages (skills, hooks, configs) below the page title.

import { useState } from 'react'

export function ApplyActionBar({ type, slug }: { type: string; slug: string }) {
  const [copied, setCopied] = useState(false)
  const command = `blink apply ${type}/${slug}`

  async function handleCopy() {
    await navigator.clipboard.writeText(command)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="sticky top-14 z-10 -mx-4 mt-4 border-y border-border bg-background/95 px-4 py-2.5 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-muted-foreground">
          {'$ '}
          {command}
        </span>
        <button
          onClick={handleCopy}
          className="font-mono text-xs text-muted-foreground transition-colors hover:text-primary"
        >
          {copied ? 'copied!' : 'copy'}
        </button>
      </div>
    </div>
  )
}
