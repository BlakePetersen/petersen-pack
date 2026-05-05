// ABOUTME: Unified card component with variants for all card types
// ABOUTME: Single source of truth for card styling - shadows, backgrounds, hover effects

'use client'

import * as React from 'react'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Badge } from './Badge'
import { ButtonLink } from './Button'
import { Check } from 'lucide-react'

// =============================================================================
// SHARED STYLES - Single source of truth for all card styling
// =============================================================================

const cardStyles = {
  // Base container styles (includes border radius for consistency)
  base: 'overflow-hidden rounded-xl bg-white dark:bg-gray-800',
  // Shadow styles
  shadow: 'shadow-soft',
  shadowHover: 'hover:shadow-glow',
  // Border styles
  border: 'rounded-xl border border-gray-200 dark:border-gray-700',
  // Transition
  transition: 'transition-all duration-500',
} as const

// =============================================================================
// STATIC CARD - Container for content (shadcn-style)
// =============================================================================

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      cardStyles.base,
      cardStyles.shadow,
      cardStyles.transition,
      cardStyles.shadowHover,
      className
    )}
    {...props}
  />
))
Card.displayName = 'Card'

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-8', className)}
    {...props}
  />
))
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'text-2xl font-bold text-gray-900 dark:text-white',
      className
    )}
    {...props}
  />
))
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-gray-600 dark:text-gray-400', className)}
    {...props}
  />
))
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-8 pt-0', className)} {...props} />
))
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-8 pt-0', className)}
    {...props}
  />
))
CardFooter.displayName = 'CardFooter'

// =============================================================================
// CONTENT CARD - Interactive card with image, link, hover effects
// =============================================================================

export interface ContentCardProps {
  href: string
  image?: {
    src: string
    alt: string
    priority?: boolean
    width?: number
    height?: number
    focalX?: number | null
    focalY?: number | null
  }
  badge?: {
    text: string
    variant?: 'solid' | 'primary' | 'outline' | 'accent'
  }
  count?: number
  title: string
  subtitle?: string
  description?: string
  metadata?: React.ReactNode
  emptyImageText?: string
  shimmerDelay?: number
  stackedLayout?: boolean
  scrollDirection?: 'down' | 'up'
  disableScrollAnimation?: boolean
}

function ContentCard({
  href,
  image,
  badge,
  count,
  title,
  subtitle,
  description,
  metadata,
  emptyImageText = 'No image',
  shimmerDelay = 0,
  stackedLayout = false,
  scrollDirection = 'down',
  disableScrollAnimation = false,
}: ContentCardProps) {
  const cardRef = useRef<HTMLAnchorElement>(null)
  const [isVisible, setIsVisible] = useState(disableScrollAnimation)

  useEffect(() => {
    if (disableScrollAnimation) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (cardRef.current) {
      observer.observe(cardRef.current)
    }

    return () => observer.disconnect()
  }, [disableScrollAnimation])

  const getObjectPosition = () => {
    if (
      image?.focalX !== undefined &&
      image?.focalX !== null &&
      image?.focalY !== undefined &&
      image?.focalY !== null
    ) {
      const x = Math.round(image.focalX * 100)
      const y = Math.round(image.focalY * 100)
      return `${x}% ${y}%`
    }

    if (!image?.width || !image?.height) return 'center'

    const aspectRatio = image.width / image.height
    if (aspectRatio < 0.9) return 'center 35%'
    else if (aspectRatio > 1.3) return 'center 45%'
    else return 'center'
  }

  const translateClass = isVisible
    ? 'translate-y-0'
    : scrollDirection === 'down'
      ? 'translate-y-8'
      : '-translate-y-8'

  return (
    <Link
      ref={cardRef}
      href={href}
      className={`group block overflow-hidden rounded-xl hover:z-10 hover:scale-[1.33] ${cardStyles.shadow} ${cardStyles.shadowHover} ${
        isVisible ? 'opacity-100' : 'opacity-0'
      } ${translateClass}`}
      style={{
        transition:
          'opacity 0.8s ease-out, transform 0.8s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.5s ease-out, z-index 0s 0.8s',
        transitionDelay: `${shimmerDelay}ms`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transitionDelay = `${shimmerDelay}ms, ${shimmerDelay}ms, 0s, 0s`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transitionDelay = `${shimmerDelay}ms, ${shimmerDelay}ms, 0s, 0.8s`
      }}
    >
      <div
        className={cn(
          cardStyles.base,
          cardStyles.shadow,
          cardStyles.transition,
          'group-hover:shadow-glow'
        )}
      >
        {/* Image Section */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-primary-100 to-accent-100 dark:from-gray-700 dark:to-gray-600">
          {image ? (
            <>
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover transition-transform duration-[1400ms] group-hover:scale-125"
                style={{
                  transitionTimingFunction: 'cubic-bezier(0, 0, 0.1, 1)',
                  objectPosition: getObjectPosition(),
                }}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                loading={image.priority ? 'eager' : 'lazy'}
                priority={image.priority}
                placeholder="blur"
                blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 3'%3E%3Cfilter id='b' color-interpolation-filters='sRGB'%3E%3CfeGaussianBlur stdDeviation='1'/%3E%3C/filter%3E%3Crect width='4' height='3' fill='%239ca3af' filter='url(%23b)'/%3E%3C/svg%3E"
              />
              {/* Hover glint overlay */}
              <div className="pointer-events-none absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[100%]" />
              {/* Gradient overlay for text readability - stays visible since title no longer fades */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              {/* Image count - top right - stays visible on hover with gradient accent */}
              {count !== undefined && count > 0 && (
                <div className="absolute right-4 top-4">
                  <span
                    className="relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-white/25 px-3 py-1.5 backdrop-blur-md transition-all duration-500 group-hover:border-white/40"
                    style={{
                      boxShadow:
                        'inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 12px rgba(0,0,0,0.3)',
                    }}
                  >
                    {/* Base background */}
                    <span className="absolute inset-0 bg-black/30 transition-opacity duration-500 group-hover:opacity-0" />
                    {/* Gradient background on hover */}
                    <span
                      className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                      style={{
                        background:
                          'linear-gradient(to bottom right, rgba(234, 88, 12, 0.4), rgba(219, 39, 119, 0.4), rgba(126, 34, 206, 0.4))',
                      }}
                    />
                    <svg
                      className="relative h-4 w-4 text-white/90"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span
                      className="relative text-xs font-medium tracking-wide text-white"
                      style={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                      {count}
                    </span>
                  </span>
                </div>
              )}
              {/* Text overlay */}
              <div className="absolute inset-0 flex items-end p-6">
                <div className="relative">
                  <h3
                    className="font-serif text-xl font-semibold text-white"
                    style={{
                      filter: 'drop-shadow(0px 1px 2px rgba(0, 0, 0, .5))',
                    }}
                  >
                    {title}
                  </h3>
                  {metadata && (
                    <div
                      className="mt-2 text-sm text-white/90"
                      style={{
                        filter: 'drop-shadow(0px 1px 2px rgba(0, 0, 0, .5))',
                      }}
                    >
                      {metadata}
                    </div>
                  )}
                  {/* Underline animates in on hover */}
                  <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-gradient-to-r from-orange-400 to-pink-500 transition-all duration-700 ease-out group-hover:w-full" />
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
              {emptyImageText}
            </div>
          )}
          {badge && (
            <div className="absolute right-4 top-4 translate-y-0 opacity-100 transition-all duration-500 group-hover:-translate-y-4 group-hover:opacity-0">
              <Badge variant={badge.variant || 'solid'}>{badge.text}</Badge>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

// =============================================================================
// SERVICE CARD - Service listing with collage layout and rich interactions
// =============================================================================

export interface ServiceCardProps {
  name: string
  slug: string
  description: string
  sampleImages?: Array<{
    id: string
    url: string
    altText: string | null
  }>
  index?: number
}

function ServiceCard({
  name,
  slug,
  description,
  sampleImages = [],
}: ServiceCardProps) {
  return (
    <Link
      href={`/services/${slug}`}
      className={cn(
        'group relative w-full max-w-md overflow-hidden md:w-[calc(50%-24px)]',
        cardStyles.border,
        'bg-white dark:bg-gray-900',
        'shadow-lg shadow-gray-200/50 dark:shadow-gray-950/50',
        'transition-all duration-500',
        'hover:scale-[1.02] hover:shadow-2xl hover:shadow-gray-300/60',
        'dark:hover:shadow-gray-950/70'
      )}
    >
      {/* Card-level glint sweep */}
      <div className="pointer-events-none absolute inset-0 z-20 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[100%]" />

      {/* Image Collage - 1 large + 2 small layout */}
      {sampleImages.length > 0 && (
        <div className="relative h-52 overflow-hidden border-b-4 border-white dark:border-gray-900 md:h-64">
          {/* Grid: large image on left, 2 stacked on right */}
          <div className="grid h-full grid-cols-5 grid-rows-2 gap-1">
            {/* Large featured image - spans 3 cols and 2 rows */}
            <div className="relative col-span-3 row-span-2 overflow-hidden">
              <Image
                src={sampleImages[0].url}
                alt={sampleImages[0].altText || name}
                fill
                className="object-cover transition-transform duration-700 ease-out will-change-transform group-hover:scale-110"
                style={{
                  transform: 'translateZ(0)',
                  backfaceVisibility: 'hidden',
                }}
                sizes="(max-width: 768px) 60vw, 25vw"
              />
              {/* Glint sweep */}
              <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
            </div>

            {/* Top right small image */}
            {sampleImages[1] && (
              <div className="relative col-span-2 overflow-hidden">
                <Image
                  src={sampleImages[1].url}
                  alt={sampleImages[1].altText || name}
                  fill
                  className="object-cover transition-transform duration-700 ease-out will-change-transform group-hover:scale-[1.15]"
                  style={{
                    transform: 'translateZ(0)',
                    backfaceVisibility: 'hidden',
                    transitionDelay: '50ms',
                  }}
                  sizes="(max-width: 768px) 40vw, 15vw"
                />
                {/* Glint sweep */}
                <div
                  className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
                  style={{ transitionDelay: '100ms' }}
                />
              </div>
            )}

            {/* Bottom right small image */}
            {sampleImages[2] && (
              <div className="relative col-span-2 overflow-hidden">
                <Image
                  src={sampleImages[2].url}
                  alt={sampleImages[2].altText || name}
                  fill
                  className="object-cover transition-transform duration-700 ease-out will-change-transform group-hover:scale-110"
                  style={{
                    transform: 'translateZ(0)',
                    backfaceVisibility: 'hidden',
                    transitionDelay: '100ms',
                  }}
                  sizes="(max-width: 768px) 40vw, 15vw"
                />
                {/* Glint sweep */}
                <div
                  className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
                  style={{ transitionDelay: '200ms' }}
                />
              </div>
            )}
          </div>

          {/* Gradient overlay for depth */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white/80 to-transparent dark:from-gray-900/80" />
        </div>
      )}

      {/* No images fallback */}
      {sampleImages.length === 0 && (
        <div className="dark:via-gray-850 relative h-52 overflow-hidden bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 md:h-64">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          {/* Gradient overlay */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white via-white/80 to-transparent dark:from-gray-900 dark:via-gray-900/80" />
        </div>
      )}

      {/* Content area */}
      <div className="relative p-6 pt-2 md:p-8 md:pt-3">
        {/* Title with animated underline */}
        <h3 className="relative mb-3 inline-block font-serif text-xl text-gray-900 dark:text-white md:mb-4 md:text-2xl">
          {name}
          {/* Animated accent underline */}
          <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-gradient-to-r from-orange-400 to-pink-500 transition-all duration-500 ease-out group-hover:w-full" />
        </h3>

        <p className="mb-5 text-sm leading-relaxed text-gray-600 dark:text-gray-400 md:mb-6">
          {description}
        </p>

        {/* View Service CTA - slides in on hover */}
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              View Service
            </span>
            <svg
              className="h-4 w-4 -translate-x-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  )
}

// =============================================================================
// PRICING CARD - Package pricing with gradient border
// =============================================================================

export interface PricingCardProps {
  name: string
  price: number
  duration?: string | null
  features: string[]
  isPopular?: boolean
  bookingUrl: string
  index?: number
}

function PricingCard({
  name,
  price,
  duration,
  features,
  isPopular = false,
  bookingUrl,
  index = 0,
}: PricingCardProps) {
  return (
    <div
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-xl p-6 transition-all duration-500 hover:scale-[1.02] md:p-8',
        isPopular
          ? 'border-2 border-orange-400 bg-white shadow-lg shadow-orange-200/30 dark:border-orange-500 dark:bg-gray-900 dark:shadow-orange-900/20'
          : 'border border-gray-200 bg-white shadow-soft hover:shadow-glow dark:border-white/50 dark:bg-gray-900'
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Popular card subtle gradient overlay */}
      {isPopular && (
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background:
              'linear-gradient(135deg, transparent 40%, rgba(251, 146, 60, 0.08) 100%)',
          }}
        />
      )}

      {/* Glint sweep */}
      <div className="pointer-events-none absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[100%]" />

      {/* Popular badge */}
      {isPopular && (
        <div className="absolute -right-12 top-6 rotate-45 bg-gradient-to-r from-orange-500 to-pink-500 px-12 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow-md">
          Popular
        </div>
      )}

      {/* Header */}
      <div className="relative z-10 mb-6 text-center md:mb-8">
        <h3 className="mb-3 font-serif text-xl text-gray-900 dark:text-white md:mb-4 md:text-2xl">
          {name}
        </h3>
        <div className="mb-2">
          <span className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white md:text-5xl">
            ${price.toLocaleString()}
          </span>
        </div>
        {duration && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{duration}</p>
        )}
      </div>

      {/* Features */}
      <ul className="relative z-10 mb-6 flex-grow space-y-3 md:mb-8 md:space-y-4">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <div
              className={cn(
                'mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded',
                isPopular
                  ? 'bg-gradient-to-br from-orange-500 to-pink-500'
                  : 'bg-gray-900 dark:bg-white'
              )}
            >
              <Check
                className={cn(
                  'h-3 w-3',
                  isPopular ? 'text-white' : 'text-white dark:text-gray-900'
                )}
                strokeWidth={3}
              />
            </div>
            <span className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              {feature}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <div className="relative z-10 mt-auto flex justify-center">
        <ButtonLink
          href={bookingUrl}
          variant={isPopular ? 'primary' : 'secondary'}
          size="lg"
        >
          Book This Package
        </ButtonLink>
      </div>
    </div>
  )
}

// =============================================================================
// IMAGE CARD - Gallery image with action button
// =============================================================================

export interface ImageCardProps {
  image: {
    id: string
    url: string
    altText: string | null
  }
  actionType: 'favorite' | 'retouch'
  isSelected: boolean
  onToggle: () => void
  onClick?: () => void
}

function ImageCard({
  image,
  actionType,
  isSelected,
  onToggle,
  onClick,
}: ImageCardProps) {
  const { Button } = require('./Button')
  const { shimmerDataUrl } = require('@/lib/shimmer')

  const icon =
    actionType === 'favorite' ? (
      <svg
        className={cn(
          'h-5 w-5',
          isSelected ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'
        )}
        fill={isSelected ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
          clipRule="evenodd"
        />
      </svg>
    ) : (
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
        />
      </svg>
    )

  const ariaLabel =
    actionType === 'favorite'
      ? isSelected
        ? 'Remove from favorites'
        : 'Add to favorites'
      : isSelected
        ? 'Remove from retouch selection'
        : 'Add to retouch selection'

  return (
    <div
      className={cn(
        'group relative aspect-square overflow-hidden',
        'bg-gray-100 dark:bg-gray-800',
        'shadow-sm ring-1 ring-gray-200 dark:ring-gray-700',
        'transition-all duration-200',
        'hover:shadow-lg hover:ring-gray-300 dark:hover:ring-gray-600'
      )}
    >
      <button
        type="button"
        onClick={onClick}
        className="block h-full w-full cursor-pointer"
        aria-label={`View ${image.altText || 'gallery image'}`}
      >
        <Image
          src={image.url}
          alt={image.altText || 'Gallery image'}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          placeholder="blur"
          blurDataURL={shimmerDataUrl(400, 400)}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-indigo-900/30 via-indigo-600/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </button>

      <div className="absolute right-2 top-2 z-10">
        <Button
          variant={
            actionType === 'retouch' && isSelected ? 'iconActive' : 'icon'
          }
          size="icon"
          onClick={onToggle}
          aria-label={ariaLabel}
        >
          {icon}
        </Button>
      </div>
    </div>
  )
}

// =============================================================================
// EXPORTS
// =============================================================================

export {
  // Static card parts (shadcn-style)
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
  // Interactive card variants
  ContentCard,
  ServiceCard,
  PricingCard,
  ImageCard,
  // Shared styles for external use if needed
  cardStyles,
}
