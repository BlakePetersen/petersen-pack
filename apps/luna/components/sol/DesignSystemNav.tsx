// ABOUTME: Sticky navigation component for design system pages
// ABOUTME: Provides quick jump links to different sections of the design system

'use client'

import { useEffect, useState } from 'react'

interface Section {
  id: string
  label: string
  subsections?: { id: string; label: string }[]
}

interface DesignSystemNavProps {
  sections: Section[]
}

export function DesignSystemNav({ sections }: DesignSystemNavProps) {
  const [activeSection, setActiveSection] = useState<string>('')

  useEffect(() => {
    // Find the scrolling container (main element with overflow-y-auto)
    const scrollContainer = document.querySelector('main.overflow-y-auto')
    if (!scrollContainer) return

    const handleScroll = () => {
      const scrollPosition = scrollContainer.scrollTop + 150

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i]
        const element = document.getElementById(section.id)

        if (element && element.offsetTop <= scrollPosition) {
          setActiveSection(section.id)
          break
        }
      }
    }

    handleScroll()
    scrollContainer.addEventListener('scroll', handleScroll)
    return () => scrollContainer.removeEventListener('scroll', handleScroll)
  }, [sections])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    const scrollContainer = document.querySelector('main.overflow-y-auto')

    if (element && scrollContainer) {
      const offset = 100
      const elementPosition = element.offsetTop - offset
      scrollContainer.scrollTo({
        top: elementPosition,
        behavior: 'smooth',
      })
    }
  }

  return (
    <nav className="sticky top-24 h-fit max-h-[calc(100vh-8rem)] overflow-y-auto rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        On This Page
      </h3>
      <ul className="space-y-1">
        {sections.map((section) => (
          <li key={section.id}>
            <button
              onClick={() => scrollToSection(section.id)}
              className={`block w-full rounded px-3 py-2 text-left text-sm transition-colors ${
                activeSection === section.id
                  ? 'bg-blue-50 font-medium text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              {section.label}
            </button>
            {section.subsections && (
              <ul className="ml-3 mt-1 space-y-1 border-l-2 border-gray-200 pl-3 dark:border-gray-700">
                {section.subsections.map((subsection) => (
                  <li key={subsection.id}>
                    <button
                      onClick={() => scrollToSection(subsection.id)}
                      className={`block w-full rounded px-2 py-1 text-left text-xs transition-colors ${
                        activeSection === subsection.id
                          ? 'font-medium text-blue-600 dark:text-blue-400'
                          : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                      }`}
                    >
                      {subsection.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  )
}
