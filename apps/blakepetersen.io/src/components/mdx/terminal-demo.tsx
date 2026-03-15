// ABOUTME: Animated terminal replay that renders scripted lines on scroll into view.
// ABOUTME: Respects prefers-reduced-motion and uses Intersection Observer for activation.

'use client'

import { useEffect, useReducer, useRef, useCallback } from 'react'

type TerminalLine = {
  text: string
  type: 'input' | 'output' | 'prompt'
  delay?: number
  typing?: boolean
}

type State = {
  visibleLines: number
  charPosition: number
  isTyping: boolean
  started: boolean
}

type Action =
  | { type: 'START' }
  | { type: 'SHOW_LINE' }
  | { type: 'TYPE_CHAR' }
  | { type: 'FINISH_TYPING' }
  | { type: 'SHOW_ALL'; lineCount: number }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'START':
      return { ...state, started: true, visibleLines: 0 }
    case 'SHOW_LINE':
      return {
        ...state,
        visibleLines: state.visibleLines + 1,
        charPosition: 0,
        isTyping: false,
      }
    case 'TYPE_CHAR':
      return { ...state, isTyping: true, charPosition: state.charPosition + 1 }
    case 'FINISH_TYPING':
      return { ...state, isTyping: false }
    case 'SHOW_ALL':
      return {
        ...state,
        started: true,
        visibleLines: action.lineCount,
        isTyping: false,
        charPosition: 0,
      }
  }
}

function TerminalDemo({
  title,
  lines,
}: {
  title: string
  lines: TerminalLine[]
}) {
  const ref = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useRef(false)
  const animationRef = useRef<number | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [state, dispatch] = useReducer(reducer, {
    visibleLines: 0,
    charPosition: 0,
    isTyping: false,
    started: false,
  })

  const animateLine = useCallback(
    (lineIndex: number) => {
      if (lineIndex >= lines.length) return

      const line = lines[lineIndex]
      const delay = line.delay ?? 300

      if (line.typing) {
        // Type character by character
        let charIdx = 0
        const typeNext = () => {
          if (charIdx < line.text.length) {
            dispatch({ type: 'TYPE_CHAR' })
            charIdx++
            animationRef.current = requestAnimationFrame(() => {
              timeoutRef.current = setTimeout(typeNext, 30)
            })
          } else {
            dispatch({ type: 'FINISH_TYPING' })
            dispatch({ type: 'SHOW_LINE' })
            timeoutRef.current = setTimeout(() => animateLine(lineIndex + 1), delay)
          }
        }
        dispatch({ type: 'SHOW_LINE' })
        timeoutRef.current = setTimeout(typeNext, delay)
      } else {
        dispatch({ type: 'SHOW_LINE' })
        timeoutRef.current = setTimeout(() => animateLine(lineIndex + 1), delay)
      }
    },
    [lines],
  )

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    if (prefersReducedMotion.current) {
      dispatch({ type: 'SHOW_ALL', lineCount: lines.length })
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !state.started) {
          dispatch({ type: 'START' })
          animateLine(0)
        }
      },
      { threshold: 0.3 },
    )

    if (ref.current) observer.observe(ref.current)

    return () => {
      observer.disconnect()
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [lines.length, state.started, animateLine])

  const visibleSlice = lines.slice(0, state.visibleLines)
  const currentTypingLine =
    state.isTyping && state.visibleLines > 0
      ? lines[state.visibleLines - 1]
      : null

  return (
    <div ref={ref} className="my-6 border border-zinc-700 bg-zinc-950">
      <div className="flex items-center gap-1.5 border-b border-zinc-700 px-3 py-2">
        <span className="h-2.5 w-2.5 bg-red-500/80" />
        <span className="h-2.5 w-2.5 bg-yellow-500/80" />
        <span className="h-2.5 w-2.5 bg-green-500/80" />
        <span className="ml-2 font-mono text-xs text-terminal-muted">
          {title}
        </span>
      </div>
      <div className="p-4 font-mono text-sm leading-relaxed">
        {visibleSlice.map((line, i) => {
          const isCurrentlyTyping =
            currentTypingLine && i === state.visibleLines - 1

          return (
            <div key={i} className="whitespace-pre-wrap">
              {line.type === 'prompt' && (
                <span className="text-green-400">$ </span>
              )}
              {line.type === 'input' && (
                <span className="text-amber-500">{'> '}</span>
              )}
              <span
                className={
                  line.type === 'output'
                    ? 'text-terminal-muted'
                    : 'text-terminal-text'
                }
              >
                {isCurrentlyTyping
                  ? line.text.slice(0, state.charPosition)
                  : line.text}
              </span>
              {isCurrentlyTyping && (
                <span className="animate-[blink_1s_step-end_infinite] text-amber-500">
                  _
                </span>
              )}
            </div>
          )
        })}
        {state.started && state.visibleLines === 0 && (
          <span className="animate-[blink_1s_step-end_infinite] text-amber-500">
            _
          </span>
        )}
      </div>
    </div>
  )
}

export { TerminalDemo }
export type { TerminalLine }
