'use client'
// ABOUTME: Sticky action bar showing the blink apply command with copy-to-clipboard.
// ABOUTME: Displayed on DX content pages (skills, hooks, configs) below the page title.

import { useState } from 'react'

export function ApplyActionBar({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false)
  const command = `blink apply ${slug}`

  async function handleCopy() {
    await navigator.clipboard.writeText(command)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="sticky top-14 z-10 -mx-4 mt-4 border-y border-terminal-border bg-terminal-bg/95 px-4 py-2.5 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-terminal-muted">
          {'$ '}{command}
        </span>
        <button
          onClick={handleCopy}
          className="font-mono text-xs text-terminal-muted transition-colors hover:text-amber-accent"
        >
          {copied ? 'copied!' : 'copy'}
        </button>
      </div>
    </div>
  )
}
