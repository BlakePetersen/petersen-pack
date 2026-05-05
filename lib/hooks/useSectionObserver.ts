// ABOUTME: IntersectionObserver hook for tracking active page sections
// ABOUTME: Returns current section, all sections, and CTA visibility for navigation

'use client'

import { useEffect, useState, useCallback } from 'react'

export type SectionInfo = {
  id: string
  label: string
  isActive: boolean
  progress: number // 0-1, how much of this section has been scrolled through
}

type SectionObserverResult = {
  activeSection: string | null
  sections: SectionInfo[]
  isInCta: boolean
  overallProgress: number // 0-1, overall page scroll progress
}

export function useSectionObserver(): SectionObserverResult {
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [sections, setSections] = useState<SectionInfo[]>([])
  const [isInCta, setIsInCta] = useState(false)
  const [overallProgress, setOverallProgress] = useState(0)

  const updateProgress = useCallback(() => {
    const scrollTop = window.scrollY
    const docHeight = document.documentElement.scrollHeight - window.innerHeight
    const progress = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0
    setOverallProgress(progress)
  }, [])

  useEffect(() => {
    const sectionElements = document.querySelectorAll('[data-section]')
    const ctaSection = document.querySelector('[data-section-cta]')

    if (sectionElements.length === 0) return

    // Initialize sections list
    const sectionList: SectionInfo[] = Array.from(sectionElements).map(
      (el) => ({
        id: el.getAttribute('data-section') || '',
        label: el.getAttribute('data-section') || '',
        isActive: false,
        progress: 0,
      })
    )
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional: initialize section list from DOM
    setSections(sectionList)

    // Track intersection ratios for all sections
    const ratios = new Map<Element, number>()

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          ratios.set(entry.target, entry.intersectionRatio)
        })

        // Find section with highest intersection ratio
        let maxRatio = 0
        let maxSectionLabel: string | null = null

        ratios.forEach((ratio, section) => {
          if (ratio > maxRatio) {
            maxRatio = ratio
            maxSectionLabel = section.getAttribute('data-section')
          }
        })

        if (maxSectionLabel && maxRatio > 0) {
          setActiveSection(maxSectionLabel)

          // Update sections with active state
          setSections((prev) =>
            prev.map((s) => ({
              ...s,
              isActive: s.label === maxSectionLabel,
            }))
          )
        }
      },
      {
        rootMargin: '-20% 0px -50% 0px',
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
      }
    )

    const ctaObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsInCta(entry.isIntersecting)
        })
      },
      {
        rootMargin: '-20% 0px 0px 0px',
        threshold: 0.1,
      }
    )

    sectionElements.forEach((section) => sectionObserver.observe(section))
    if (ctaSection) {
      ctaObserver.observe(ctaSection)
    }

    // Track scroll progress
    updateProgress()
    window.addEventListener('scroll', updateProgress, { passive: true })

    return () => {
      sectionObserver.disconnect()
      ctaObserver.disconnect()
      window.removeEventListener('scroll', updateProgress)
    }
  }, [updateProgress])

  return { activeSection, sections, isInCta, overallProgress }
}
