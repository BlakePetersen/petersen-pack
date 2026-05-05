// ABOUTME: Shared page hero with animated caustics background
// ABOUTME: Used for loading states and page headers, with optional hero image overlay

'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Header from '@/components/luna/Header'

interface PageHeroProps {
  /** Page title */
  title?: string
  /** Page subtitle/description */
  subtitle?: string
  /** Hero image URL - fades in over caustics */
  heroImage?: string | null
  /** Alt text for hero image */
  heroAlt?: string
  /** Additional content to render in the hero */
  children?: React.ReactNode
  /** Height variant - 'full' for loading states, 'hero' for page headers */
  variant?: 'full' | 'hero'
}

function PageHero({
  title,
  subtitle,
  heroImage,
  heroAlt = '',
  children,
  variant = 'hero',
}: PageHeroProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50)
    return () => clearTimeout(timer)
  }, [])

  const heightClass = variant === 'full' ? 'min-h-screen' : 'min-h-[50vh]'
  const paddingClass = variant === 'hero' ? 'pt-page-top pb-section' : ''

  return (
    <div className={`relative ${heightClass} overflow-hidden`}>
      {/* Hero image - fades in over caustics (caustics rendered in root layout) */}
      {heroImage && (
        <div
          className={`absolute inset-0 transition-opacity duration-700 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Image
            src={heroImage}
            alt={heroAlt}
            fill
            className="object-cover"
            priority
            onLoad={() => setImageLoaded(true)}
            sizes="100vw"
          />
          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />
        </div>
      )}

      {/* Content container */}
      <div
        className={`relative z-10 flex ${heightClass} flex-col items-center justify-center px-gutter ${paddingClass} transition-opacity duration-500 ${
          mounted ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {title && (
          <h1
            className={`mb-4 text-center font-serif text-display-md md:text-display-lg ${
              heroImage
                ? 'text-white drop-shadow-lg'
                : 'text-gray-900 dark:text-white'
            }`}
          >
            {title}
          </h1>
        )}

        {subtitle && (
          <p
            className={`mx-auto max-w-2xl text-center text-body-lg ${
              heroImage
                ? 'text-white/90 drop-shadow-md'
                : 'text-gray-600 dark:text-gray-300'
            }`}
          >
            {subtitle}
          </p>
        )}

        {children}
      </div>
    </div>
  )
}

/**
 * Loading variant - header with caustics, full viewport
 * Use in loading.tsx files for instant visual feedback
 * Note: Caustics are rendered in root layout, not needed here
 */
function PageHeroLoading() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-white dark:bg-gray-950">
      <Header />
    </div>
  )
}
