// ABOUTME: Floating side rail section navigator with vertical labels and logo progress
// ABOUTME: Shows page title, current section, and scroll progress via extending logo arm

'use client'

import { useEffect, useState } from 'react'
import { useSectionObserver } from '@/lib/hooks'

interface SectionNavigatorProps {
  title?: string
}

function LogoProgress({ progress }: { progress: number }) {
  // Max arm extension of 2rem (32px)
  const maxExtension = 32
  const armLength = progress * maxExtension

  return (
    <svg
      width={20 + armLength}
      height="20"
      viewBox={`0 0 ${20 + armLength} 20`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-gray-400 transition-all duration-300 ease-out dark:text-gray-500"
      aria-hidden="true"
    >
      {/* Crescent moon - more visible */}
      <path
        d="M 10 3 A 6 6 0 1 1 10 17 A 5 8 0 0 0 10 3 Z"
        fill="currentColor"
        stroke="none"
      />
      {/* Short ray at 3 o'clock that extends based on progress */}
      <line
        x1="17"
        y1="10"
        x2={17 + 2 + armLength}
        y2="10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function SectionNavigator({ title }: SectionNavigatorProps) {
  const [visible, setVisible] = useState(false)
  const { sections, activeSection, isInCta, overallProgress } =
    useSectionObserver()

  useEffect(() => {
    const handleScroll = () => {
      // Show after minimal scroll (200px) - works on all pages
      setVisible(window.scrollY > 200)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Don't render if no sections or on CTA
  if (sections.length === 0) return null

  const shouldShow = visible && !isInCta

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <nav
      aria-label="Page sections"
      className={`fixed left-6 top-32 z-30 hidden transition-all duration-500 lg:block xl:left-8 ${
        shouldShow
          ? 'translate-x-0 opacity-100'
          : 'pointer-events-none -translate-x-4 opacity-0'
      }`}
    >
      <div className="flex flex-col gap-6">
        {/* Page title */}
        {title && (
          <h2 className="font-serif text-sm text-gray-900 dark:text-white">
            {title}
          </h2>
        )}

        {/* Section labels */}
        <div className="flex flex-col gap-3">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => {
                const el = document.querySelector(
                  `[data-section="${section.label}"]`
                )
                if (el) {
                  const top =
                    el.getBoundingClientRect().top + window.scrollY - 120
                  window.scrollTo({ top, behavior: 'smooth' })
                }
              }}
              className={`group relative text-left text-xs font-medium uppercase tracking-wider transition-all duration-300 ${
                section.label === activeSection
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'
              }`}
            >
              <span className="relative">
                {section.label}
                {/* Underline indicator for active section */}
                <span
                  className={`absolute -bottom-0.5 left-0 h-px bg-gray-900 transition-all duration-300 dark:bg-white ${
                    section.label === activeSection
                      ? 'w-full'
                      : 'w-0 group-hover:w-full'
                  }`}
                />
              </span>
            </button>
          ))}
        </div>

        {/* Logo with extending arm + back to top */}
        <div className="flex items-center gap-2">
          <LogoProgress progress={overallProgress} />
          <button
            onClick={scrollToTop}
            className="text-[10px] uppercase tracking-wider text-gray-300 transition-colors hover:text-gray-500 dark:text-gray-600 dark:hover:text-gray-400"
          >
            Top
          </button>
        </div>
      </div>
    </nav>
  )
}
