// ABOUTME: Reusable gradient divider component for visual separation
// ABOUTME: Supports static and animated variants including caustics effect

'use client'

import { useSyncExternalStore } from 'react'

// Hydration-safe mounting detection
const emptySubscribe = () => () => {}
const getClientSnapshot = () => true
const getServerSnapshot = () => false

// Fixed animation delay offsets for visual variety
const ANIMATION_DELAYS = { delay1: 2.3, delay2: 5.7 }

type GradientDividerProps = {
  className?: string
  variant?: 'primary' | 'subtle' | 'caustics'
  /** Height in pixels for thicker animated variants */
  height?: number
}

export function GradientDivider({
  className = '',
  variant = 'primary',
  height,
}: GradientDividerProps) {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot
  )

  if (variant === 'caustics') {
    const h = height || 2
    return (
      <div
        className={`relative w-full overflow-hidden transition-opacity duration-700 ${
          mounted ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        style={{ height: h }}
        role="separator"
        aria-hidden="true"
      >
        {/* Light mode: golden hour band */}
        <div className="absolute inset-0 dark:hidden">
          <div
            className="absolute inset-0 animate-caustics-medium"
            style={{
              background: `linear-gradient(90deg,
                transparent 0%,
                rgba(255, 183, 77, 0.6) 20%,
                rgba(255, 138, 101, 0.8) 40%,
                rgba(244, 143, 177, 0.6) 60%,
                rgba(206, 147, 216, 0.5) 80%,
                transparent 100%
              )`,
              animationDelay: `${ANIMATION_DELAYS.delay1}s`,
            }}
          />
          <div
            className="absolute inset-0 animate-caustics-fast"
            style={{
              background: `linear-gradient(90deg,
                transparent 10%,
                rgba(255, 213, 79, 0.4) 30%,
                rgba(255, 167, 38, 0.5) 50%,
                rgba(255, 183, 77, 0.4) 70%,
                transparent 90%
              )`,
              animationDelay: `${ANIMATION_DELAYS.delay2}s`,
            }}
          />
        </div>

        {/* Dark mode: underwater band */}
        <div className="absolute inset-0 hidden dark:block">
          <div
            className="absolute inset-0 animate-caustics-medium"
            style={{
              background: `linear-gradient(90deg,
                transparent 0%,
                rgba(56, 189, 248, 0.5) 20%,
                rgba(34, 211, 238, 0.7) 40%,
                rgba(45, 212, 191, 0.5) 60%,
                rgba(99, 102, 241, 0.4) 80%,
                transparent 100%
              )`,
              animationDelay: `${ANIMATION_DELAYS.delay1}s`,
            }}
          />
          <div
            className="absolute inset-0 animate-caustics-fast"
            style={{
              background: `linear-gradient(90deg,
                transparent 10%,
                rgba(125, 211, 252, 0.3) 30%,
                rgba(56, 189, 248, 0.4) 50%,
                rgba(34, 211, 238, 0.3) 70%,
                transparent 90%
              )`,
              animationDelay: `${ANIMATION_DELAYS.delay2}s`,
            }}
          />
        </div>
      </div>
    )
  }

  const gradients = {
    primary:
      'from-transparent via-orange-400/50 to-transparent dark:via-orange-500/30',
    subtle: 'from-transparent via-gray-300 to-transparent dark:via-gray-700',
  }

  return (
    <div
      className={`w-full bg-gradient-to-r ${gradients[variant]} ${className}`}
      style={{ height: height || 1 }}
      role="separator"
      aria-hidden="true"
    />
  )
}
