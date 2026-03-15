// ABOUTME: Step indicator components with CSS counters for sequential instructions.
// ABOUTME: Renders a vertical timeline with numbered steps and terminal-aesthetic styling.

'use client'

import type { ReactNode } from 'react'

function Steps({ children }: { children: ReactNode }) {
  return (
    <div className="my-6 space-y-0" style={{ counterReset: 'step-counter' }}>
      {children}
    </div>
  )
}

function Step({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div
      className="relative border-l-2 border-zinc-700 pb-6 pl-8 last:pb-0"
      style={{ counterIncrement: 'step-counter' }}
    >
      <div
        className="absolute -left-[13px] top-0 flex h-6 w-6 items-center justify-center border border-zinc-700 bg-zinc-900 font-mono text-xs text-amber-500 before:content-[counter(step-counter)]"
      />
      <h4 className="mb-2 font-mono text-sm font-semibold text-terminal-text">
        {title}
      </h4>
      <div className="text-sm text-terminal-muted">{children}</div>
    </div>
  )
}

export { Steps, Step }
