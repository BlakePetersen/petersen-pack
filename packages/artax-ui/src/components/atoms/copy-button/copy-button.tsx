'use client'

// ABOUTME: Client component for copying code to clipboard with checkmark confirmation.
// ABOUTME: Always visible in code block top-right corner, reverts to copy icon after 2s.

import { useState } from 'react'
import { cn } from '../../../lib/utils'

function CopyButton({
  text,
  className,
}: {
  text: string
  className?: string
}) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      aria-label="Copy code"
      className={cn(
        'text-terminal-muted hover:text-terminal-text transition-colors p-1 font-mono text-xs',
        className,
      )}
    >
      {copied ? '\u2713' : '\u2398'}
    </button>
  )
}

export { CopyButton }
