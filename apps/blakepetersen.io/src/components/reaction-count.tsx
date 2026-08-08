// ABOUTME: Client component displaying thumbs-up reaction count from giscus metadata.
// ABOUTME: Provides React Context to lift reaction state from giscus iframe to header metadata.

'use client'

import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

type ReactionCountContextValue = {
  count: number
  setCount: (n: number) => void
}

const ReactionCountContext = createContext<ReactionCountContextValue | null>(
  null
)

export function ReactionCountProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0)
  return (
    <ReactionCountContext.Provider value={{ count, setCount }}>
      {children}
    </ReactionCountContext.Provider>
  )
}

export function useReactionCount(): ReactionCountContextValue {
  const ctx = useContext(ReactionCountContext)
  if (!ctx) {
    throw new Error(
      'useReactionCount must be used within ReactionCountProvider'
    )
  }
  return ctx
}

export function ReactionCount() {
  const { count } = useReactionCount()
  return (
    <span className="font-mono text-xs text-muted-foreground">
      <span>👍</span> <span>{count}</span>
    </span>
  )
}
