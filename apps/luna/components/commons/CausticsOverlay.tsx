// ABOUTME: Underwater visual effects with light rays and surface glow
// ABOUTME: Route-seeded glimmers with View Transitions for smooth route morphing

'use client'

import { ViewTransition } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'

// Seeded random number generator for deterministic glimmer positions
function seededRandom(seed: number): () => number {
  return () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    return seed / 0x7fffffff
  }
}

// Convert route string to numeric seed
function routeToSeed(route: string): number {
  let hash = 0
  for (let i = 0; i < route.length; i++) {
    hash = (hash << 5) - hash + route.charCodeAt(i)
    hash = hash & hash
  }
  return Math.abs(hash)
}

// Light mode color variations for rays
const LIGHT_RAY_COLORS = [
  { ray: 'rgba(255, 248, 235, 0.7)', rayMid: 'rgba(255, 240, 220, 0.4)' }, // cream
  { ray: 'rgba(255, 220, 150, 0.7)', rayMid: 'rgba(255, 200, 120, 0.4)' }, // golden
  { ray: 'rgba(255, 200, 200, 0.7)', rayMid: 'rgba(255, 180, 180, 0.4)' }, // pink
  { ray: 'rgba(220, 200, 255, 0.7)', rayMid: 'rgba(200, 180, 255, 0.4)' }, // purple
] as const

// Color palettes for light and dark modes
const PALETTE = {
  light: {
    // Surface glow - warm light filtering through
    surface: 'rgba(255, 235, 210, 0.4)',
    // Deep ocean - purple gradient matching light rays
    deep: 'rgba(200, 180, 255, 0.35)',
  },
  dark: {
    ray: 'rgba(148, 180, 210, 0.55)',
    rayMid: 'rgba(120, 150, 180, 0.3)',
    // Surface glow - lighter blue near the water surface
    surface: 'rgba(56, 130, 180, 0.3)',
    // Deep ocean - dark abyss at bottom
    deep: 'rgba(0, 0, 0, 0.8)',
  },
} as const

// Surface gradient starts at half viewport, recedes as user scrolls
const SURFACE_MAX_HEIGHT = 50 // vh - height at top of page
// Deep gradient parallaxes up from below viewport as user scrolls
const DEEP_HEIGHT = 50 // vh - fixed height, top reaches middle of viewport at max scroll

const GLIMMER_ANGLE = 18 // degrees - consistent angle for all glimmers
const PARALLAX_SPEED = 0.4 // glimmers move at 0.4x scroll speed
const GLIMMER_START_OFFSET = -100 // px - start glimmers above viewport

type Glimmer = {
  left: number
  width: number
  height: number
  opacity: number
  colorIndex: number
}

function generateGlimmers(seed: number): Glimmer[] {
  const random = seededRandom(seed)
  return Array.from({ length: 5 }, () => ({
    left: random() * 100,
    width: 80 + random() * 120,
    height: 135 + random() * 60,
    opacity: 0.3 + random() * 0.6,
    colorIndex: Math.floor(random() * LIGHT_RAY_COLORS.length),
  }))
}

interface CausticsOverlayProps {
  /** Overall intensity multiplier (0-1), default 0.5 */
  intensity?: number
  /** Additional CSS classes */
  className?: string
}

export function CausticsOverlay({
  intensity = 0.7,
  className = '',
}: CausticsOverlayProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [scrollY, setScrollY] = useState(0)
  const [maxScroll, setMaxScroll] = useState(1)
  const rafRef = useRef<number>(0)

  // Hide on admin pages
  const isAdminPage = pathname.startsWith('/admin')

  // Compute glimmers based on pathname + query params (for tab changes etc)
  const fullPath = `${pathname}?${searchParams.toString()}`
  const glimmers = useMemo(
    () => generateGlimmers(routeToSeed(fullPath)),
    [fullPath]
  )

  // Handle scroll for parallax
  useEffect(() => {
    if (isAdminPage) return

    const handleScroll = () => {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        setScrollY(window.scrollY)
        setMaxScroll(document.documentElement.scrollHeight - window.innerHeight)
      })
    }

    // Initialize values via rAF to avoid synchronous setState in effect
    handleScroll()

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
      cancelAnimationFrame(rafRef.current)
    }
  }, [isAdminPage])

  const parallaxOffset = -scrollY * PARALLAX_SPEED

  // Don't render anything on admin pages
  if (isAdminPage) {
    return null
  }

  // Surface gradient recedes fully by page bottom
  const surfaceProgress = maxScroll > 0 ? Math.min(1, scrollY / maxScroll) : 0
  const surfaceHeight = SURFACE_MAX_HEIGHT * (1 - surfaceProgress)
  const surfaceOpacity = 1 - surfaceProgress * 0.5 // fade to 50% opacity at bottom

  // Deep gradient fully visible by page bottom (inverse of surface)
  const deepProgress = maxScroll > 0 ? Math.min(1, scrollY / maxScroll) : 0
  // translateY goes from 100% (hidden below) to 0% (visible)
  const deepTranslateY = (1 - deepProgress) * 100

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 top-0 z-[1] h-screen overflow-hidden ${className}`}
      aria-hidden="true"
      style={{ viewTransitionName: 'caustics-container' }}
    >
      {/* Surface glow - "close to water surface" effect */}
      {surfaceHeight > 0 && (
        <ViewTransition name="caustics-surface">
          <div
            className="absolute inset-x-0 top-0"
            style={{ height: `${surfaceHeight}vh` }}
          >
            {/* Light mode surface */}
            <div
              className="absolute inset-0 dark:hidden"
              style={{
                opacity: surfaceOpacity,
                background: `radial-gradient(ellipse 150% 100% at 50% 0%, ${PALETTE.light.surface} 0%, transparent 80%)`,
              }}
            />
            {/* Dark mode surface */}
            <div
              className="absolute inset-0 hidden dark:block"
              style={{
                opacity: surfaceOpacity,
                background: `radial-gradient(ellipse 150% 100% at 50% 0%, ${PALETTE.dark.surface} 0%, transparent 80%)`,
              }}
            />
          </div>
        </ViewTransition>
      )}

      {/* Light mode glimmers */}
      <div
        className="absolute inset-0 dark:hidden"
        style={{ transform: `translateY(${parallaxOffset}px)` }}
      >
        {glimmers.map((g, i) => {
          const colors = LIGHT_RAY_COLORS[g.colorIndex]
          return (
            <ViewTransition key={i} name={`caustic-beam-light-${i}`}>
              <div
                className="absolute origin-top transition-[background] duration-700"
                style={{
                  top: `${GLIMMER_START_OFFSET}px`,
                  left: `${g.left}%`,
                  width: `${g.width * 1.5}px`,
                  height: `${g.height}%`,
                  opacity: g.opacity * intensity,
                  transform: `rotate(${GLIMMER_ANGLE}deg)`,
                  background: `linear-gradient(180deg,
                    ${colors.ray} 0%,
                    ${colors.rayMid} 40%,
                    transparent 100%
                  )`,
                  filter: 'blur(35px)',
                }}
              />
            </ViewTransition>
          )
        })}
      </div>

      {/* Dark mode glimmers */}
      <div
        className="absolute inset-0 hidden dark:block"
        style={{ transform: `translateY(${parallaxOffset}px)` }}
      >
        {glimmers.map((g, i) => (
          <ViewTransition key={i} name={`caustic-beam-dark-${i}`}>
            <div
              className="absolute origin-top"
              style={{
                top: `${GLIMMER_START_OFFSET}px`,
                left: `${g.left}%`,
                width: `${g.width * 1.44}px`,
                height: `${g.height}%`,
                opacity: g.opacity * intensity * 0.7,
                transform: `rotate(${GLIMMER_ANGLE}deg)`,
                background: `linear-gradient(180deg,
                  ${PALETTE.dark.ray} 0%,
                  ${PALETTE.dark.rayMid} 40%,
                  transparent 100%
                )`,
                filter: 'blur(20px)',
              }}
            />
          </ViewTransition>
        ))}
      </div>

      {/* Deep ocean - parallaxes up from below viewport as user scrolls */}
      <ViewTransition name="caustics-deep">
        <div
          className="absolute inset-x-0 bottom-0 z-10"
          style={{
            height: `${DEEP_HEIGHT}vh`,
            transform: `translateY(${deepTranslateY}%)`,
          }}
        >
          {/* Light mode deep */}
          <div
            className="absolute inset-0 mix-blend-multiply dark:hidden"
            style={{
              background: `radial-gradient(ellipse 180% 100% at 50% 100%, ${PALETTE.light.deep} 0%, transparent 80%)`,
            }}
          />
          {/* Dark mode deep */}
          <div
            className="absolute inset-0 hidden mix-blend-multiply dark:block"
            style={{
              background: `radial-gradient(ellipse 180% 100% at 50% 100%, ${PALETTE.dark.deep} 0%, transparent 80%)`,
            }}
          />
        </div>
      </ViewTransition>
    </div>
  )
}
