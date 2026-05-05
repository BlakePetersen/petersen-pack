// ABOUTME: Scroll-triggered sticky page header with frosted glass effect
// ABOUTME: Supports section navigation with animated subheader labels

'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useSectionObserver } from '@/lib/hooks'

type BreadcrumbItem = {
  label: string
  href: string
}

type PageHeaderProps = {
  title: string
  breadcrumb?: BreadcrumbItem[]
  subheader?: string
  enableSectionNav?: boolean
  heroSelector?: string
}

export function PageHeader({
  title,
  breadcrumb,
  subheader,
  enableSectionNav = false,
  heroSelector,
}: PageHeaderProps) {
  const [visible, setVisible] = useState(false)
  const [animationKey, setAnimationKey] = useState(0)
  const prevSubheaderRef = useRef<string | null>(null)

  const { activeSection, isInCta } = useSectionObserver()

  // Determine current subheader: prop takes precedence, then active section
  const currentSubheader =
    subheader || (enableSectionNav ? activeSection : null)

  // Update animation key when subheader changes (triggers re-animation)
  useEffect(() => {
    if (currentSubheader !== prevSubheaderRef.current && currentSubheader) {
      prevSubheaderRef.current = currentSubheader
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional: key update triggers animation
      setAnimationKey((prev) => prev + 1)
    }
  }, [currentSubheader])

  const handleScroll = useCallback(() => {
    // Check if hero is scrolled past
    if (heroSelector) {
      const hero = document.querySelector(heroSelector)
      if (hero) {
        const heroBottom = hero.getBoundingClientRect().bottom
        setVisible(heroBottom < 64)
        return
      }
    }
    // Default: show after scrolling 100px
    setVisible(window.scrollY > 100)
  }, [heroSelector])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional: initial scroll position check
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  // Determine visibility based on scroll position and CTA
  const shouldShow = visible && !isInCta

  return (
    <header
      className={`fixed left-0 right-0 top-[var(--header-height)] z-40 border-b border-gray-200/50 bg-white/80 backdrop-blur-md transition-opacity duration-200 dark:border-gray-700/50 dark:bg-gray-900/80 ${
        shouldShow ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      <div className="mx-auto flex h-12 max-w-[1075px] items-center justify-between px-gutter md:h-14">
        {breadcrumb && breadcrumb.length > 0 ? (
          <>
            <nav className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              {breadcrumb.map((item, index) => (
                <span key={item.href} className="flex items-center gap-2">
                  <Link
                    href={item.href}
                    className="hover:text-gray-900 dark:hover:text-white"
                  >
                    {item.label}
                  </Link>
                  {index < breadcrumb.length - 1 && (
                    <span className="text-gray-400 dark:text-gray-600">›</span>
                  )}
                </span>
              ))}
            </nav>
            <h1 className="font-serif text-base text-gray-900 dark:text-white md:text-lg">
              {title}
            </h1>
          </>
        ) : (
          <div className="flex w-full items-center justify-center gap-3">
            <h1 className="font-serif text-base text-gray-900 dark:text-white md:text-lg">
              {title}
            </h1>
            {currentSubheader && (
              <>
                <span className="hidden text-gray-400 dark:text-gray-600 lg:inline">
                  /
                </span>
                <span
                  key={animationKey}
                  className="animate-section-in hidden font-sans text-sm text-gray-500 dark:text-gray-400 lg:inline"
                >
                  {currentSubheader}
                </span>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
