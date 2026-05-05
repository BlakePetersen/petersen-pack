// ABOUTME: Hero carousel component for homepage
// ABOUTME: Full-screen hero with elegant transitions and navigation controls

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Edit } from 'lucide-react'
import { ButtonLink } from '@/components/commons'
import { shimmerDataUrl } from '@/lib/shimmer'
import type { WebGLTransitionRef } from '@/components/luna/WebGLTransition'

// Lazy load WebGL transition - heavy component only needed for animations
const WebGLTransition = dynamic(
  () => import('@/components/luna/WebGLTransition'),
  { ssr: false }
)

// Lazy load admin-only modal - not needed for public users
const EditHeroSlideModal = dynamic(
  () =>
    import('@/components/sol/EditHeroSlideModal').then(
      (mod) => mod.EditHeroSlideModal
    ),
  { ssr: false }
)

type HeroSlide = {
  id: string
  title: string
  imageUrl: string
  mobileImageUrl: string | null
  focalX: number
  focalY: number
  mobileFocalX: number
  mobileFocalY: number
  linkUrl: string | null
  linkText: string | null
  portfolioUrl: string | null
  serviceUrl: string | null
  sortOrder: number
  isActive: boolean
}

type HeroCarouselProps = {
  slides: HeroSlide[]
  isAdmin?: boolean
}

export default function HeroCarousel({
  slides,
  isAdmin = false,
}: HeroCarouselProps) {
  const initialIndex = 0
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [previousIndex, setPreviousIndex] = useState(initialIndex)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [direction, setDirection] = useState<'next' | 'prev'>('next')
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [transitionProgress, setTransitionProgress] = useState(1) // 0-1, 1 means no transition
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [scrollY, setScrollY] = useState(0)
  const [staticImageIndex, setStaticImageIndex] = useState(initialIndex) // Tracks which image the static layer shows
  const animationFrameRef = useRef<number | null>(null)
  const transitionStartTimeRef = useRef<number>(0)
  const webglRef = useRef<WebGLTransitionRef | null>(null)
  const [transitionFromIndex, setTransitionFromIndex] = useState(initialIndex)
  const [transitionToIndex, setTransitionToIndex] = useState(initialIndex)
  // Track which images have finished loading and decoding
  const [loadedImages, setLoadedImages] = useState<Set<number>>(() => new Set())
  const [isWaitingForImage, setIsWaitingForImage] = useState(false)

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50

  // Track when an image finishes loading and decoding
  const handleImageLoad = useCallback((index: number) => {
    setLoadedImages((prev) => {
      const next = new Set(prev)
      next.add(index)
      return next
    })
  }, [])

  // Preload and decode an image to ensure flicker-free rendering
  const preloadImageWithTracking = useCallback(
    async (index: number) => {
      if (loadedImages.has(index) || !slides[index]) return

      const img = new window.Image()
      img.src = slides[index].imageUrl

      try {
        // Wait for image to load and decode (ready to paint without flicker)
        await img.decode()
        handleImageLoad(index)
      } catch {
        // Fallback: mark as loaded even if decode fails
        handleImageLoad(index)
      }

      // Also preload and decode mobile image if it exists
      if (slides[index].mobileImageUrl) {
        const mobileImg = new window.Image()
        mobileImg.src = slides[index].mobileImageUrl
        try {
          await mobileImg.decode()
        } catch {
          // Ignore decode errors for mobile image
        }
      }
    },
    [loadedImages, slides, handleImageLoad]
  )

  // Deferred preloading: load remaining images after initial page load
  useEffect(() => {
    if (slides.length <= 1) return

    let idleHandle: number | undefined
    let timeoutHandle: ReturnType<typeof setTimeout> | undefined

    // Preload adjacent slides first (next and prev), then others
    const preloadSequence = () => {
      const nextIndex = (staticImageIndex + 1) % slides.length
      const prevIndex = (staticImageIndex - 1 + slides.length) % slides.length

      // Preload adjacent slides first
      preloadImageWithTracking(nextIndex)
      preloadImageWithTracking(prevIndex)

      // Then preload remaining slides after a short delay
      setTimeout(() => {
        slides.forEach((_, index) => {
          if (
            index !== staticImageIndex &&
            index !== nextIndex &&
            index !== prevIndex
          ) {
            preloadImageWithTracking(index)
          }
        })
      }, 500)
    }

    // Use requestIdleCallback to defer loading, or setTimeout as fallback
    if ('requestIdleCallback' in window) {
      idleHandle = window.requestIdleCallback(preloadSequence, {
        timeout: 3000,
      })
    } else {
      timeoutHandle = setTimeout(preloadSequence, 1000)
    }

    return () => {
      if (idleHandle !== undefined) {
        window.cancelIdleCallback(idleHandle)
      }
      if (timeoutHandle !== undefined) {
        clearTimeout(timeoutHandle)
      }
    }
  }, [slides, staticImageIndex, preloadImageWithTracking])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 300)
      setScrollY(window.scrollY)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Animate transition progress from 0 to 1
  const animateTransition = useCallback(
    (targetIndex: number) => {
      const duration = 1400 // ms - elegant, cinematic feel

      // Check if target image is loaded
      const imageReady = loadedImages.has(targetIndex)

      // If image is not loaded and decoded, show loading indicator and wait
      if (!imageReady) {
        setIsWaitingForImage(true)

        // Start loading and decoding the image
        const img = new window.Image()
        img.src = slides[targetIndex].imageUrl

        img
          .decode()
          .then(() => {
            handleImageLoad(targetIndex)
            setIsWaitingForImage(false)
            startTransition(targetIndex)
          })
          .catch(() => {
            // On error, proceed anyway
            setIsWaitingForImage(false)
            startTransition(targetIndex)
          })
        return
      }

      startTransition(targetIndex)

      function startTransition(index: number) {
        // Set up transition state
        setTransitionFromIndex(staticImageIndex)
        setTransitionToIndex(index)

        // Update React state for rendering
        setPreviousIndex(staticImageIndex)
        setCurrentIndex(index)

        // Pre-render WebGL at progress 0 before showing
        if (webglRef.current) {
          webglRef.current.updateProgress(0)
        }

        // Delay to ensure WebGL has loaded textures and rendered first frame
        setTimeout(() => {
          setIsTransitioning(true)
          transitionStartTimeRef.current = performance.now()

          const animate = () => {
            const elapsed = performance.now() - transitionStartTimeRef.current
            const progress = Math.min(elapsed / duration, 1)

            const easedProgress =
              progress < 0.5
                ? 2 * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 2) / 2

            if (webglRef.current) {
              webglRef.current.updateProgress(easedProgress)
            }

            if (progress < 1) {
              animationFrameRef.current = requestAnimationFrame(animate)
            } else {
              // Update static image FIRST, then hide WebGL layer
              setStaticImageIndex(index)

              // Ensure image is decoded before hiding WebGL layer
              const img = new window.Image()
              img.src = slides[index].imageUrl
              img
                .decode()
                .then(() => {
                  // Double-raf pattern: wait for React to commit, then wait for browser to paint
                  requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                      setIsTransitioning(false)
                      setTransitionProgress(1)
                    })
                  })
                })
                .catch(() => {
                  // On error, proceed anyway with double-raf
                  requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                      setIsTransitioning(false)
                      setTransitionProgress(1)
                    })
                  })
                })
            }
          }

          animate()
        }, 100) // Buffer time for WebGL texture loading
      }
    },
    [staticImageIndex, loadedImages, slides, handleImageLoad]
  )

  const nextSlide = useCallback(() => {
    // Prevent transitions while one is in progress or waiting for image
    if (isTransitioning || isWaitingForImage) return

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    setDirection('next')
    const nextIndex = (staticImageIndex + 1) % slides.length
    animateTransition(nextIndex)
  }, [
    staticImageIndex,
    slides.length,
    animateTransition,
    isTransitioning,
    isWaitingForImage,
  ])

  const prevSlide = useCallback(() => {
    // Prevent transitions while one is in progress or waiting for image
    if (isTransitioning || isWaitingForImage) return

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    setDirection('prev')
    const prevIndex = (staticImageIndex - 1 + slides.length) % slides.length
    animateTransition(prevIndex)
  }, [
    staticImageIndex,
    slides.length,
    animateTransition,
    isTransitioning,
    isWaitingForImage,
  ])

  const goToSlide = (index: number) => {
    // Prevent transitions while one is in progress or waiting for image
    if (isTransitioning || isWaitingForImage) return

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    setDirection(index > staticImageIndex ? 'next' : 'prev')
    animateTransition(index)
    setIsAutoPlaying(false)
  }

  // Auto-play effect
  useEffect(() => {
    if (slides.length <= 1 || !isAutoPlaying) return

    const interval = setInterval(() => {
      nextSlide()
    }, 5000)

    return () => clearInterval(interval)
  }, [slides.length, isAutoPlaying, nextSlide])

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        prevSlide()
        setIsAutoPlaying(false)
      } else if (e.key === 'ArrowRight') {
        nextSlide()
        setIsAutoPlaying(false)
      } else if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault() // Prevent page scroll
        setIsAutoPlaying((prev) => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [nextSlide, prevSlide])

  // Touch handlers for swipe gestures
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      nextSlide()
      setIsAutoPlaying(false)
    } else if (isRightSwipe) {
      prevSlide()
      setIsAutoPlaying(false)
    }
  }

  if (slides.length === 0) {
    return (
      <div className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="absolute inset-0 flex items-end">
          <div className="w-full px-6 pb-20 md:px-12 lg:px-16">
            <div>
              <div className="mb-4 inline-block">
                <span
                  className="text-xs font-medium uppercase tracking-[0.2em] text-white/70"
                  style={{
                    filter: 'drop-shadow(0px 1px 0px rgba(0, 0, 0, .25))',
                  }}
                >
                  Photography
                </span>
              </div>
              <h1
                className="mb-4 text-balance font-serif text-5xl font-light leading-[1.1] text-white md:text-7xl lg:text-8xl"
                style={{
                  filter: 'drop-shadow(0px 1px 0px rgba(0, 0, 0, .25))',
                }}
              >
                Ashley Petersen Photography
              </h1>
              <p
                className="mb-8 max-w-xl text-pretty text-lg font-light tracking-wide text-white/80 md:text-xl"
                style={{
                  filter: 'drop-shadow(0px 1px 0px rgba(0, 0, 0, .25))',
                }}
              >
                Capturing life&apos;s precious moments in the East Bay
              </p>
              <Link
                href="/portfolio"
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md bg-white px-6 py-3 text-sm font-medium text-gray-900 transition-all hover:bg-gray-100"
              >
                View Portfolio
              </Link>
            </div>
          </div>
        </div>
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 right-6 flex flex-col items-center gap-2 md:right-12 lg:right-16">
          <span className="origin-center translate-x-4 rotate-90 text-xs uppercase tracking-widest text-white/60">
            Scroll
          </span>
          <div className="h-12 w-px bg-white/30" />
        </div>
      </div>
    )
  }

  const currentSlide = slides[staticImageIndex]

  return (
    <div
      className="relative z-10 h-screen w-full overflow-hidden bg-black"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Static Image Layer - always visible underneath */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            transform: `translateY(${scrollY * 0.5}px)`,
            willChange: 'transform',
            zIndex: 1,
          }}
        >
          {/* Desktop Image */}
          <Image
            src={slides[staticImageIndex]?.imageUrl || ''}
            alt={slides[staticImageIndex]?.title || ''}
            fill
            className={`object-cover ${slides[staticImageIndex]?.mobileImageUrl ? 'hidden md:block' : ''}`}
            style={{
              objectPosition: `${slides[staticImageIndex]?.focalX * 100}% ${slides[staticImageIndex]?.focalY * 100}%`,
            }}
            priority={staticImageIndex === 0}
            loading={staticImageIndex === 0 ? undefined : 'lazy'}
            sizes="(max-width: 1080px) 1080px, 1920px"
            placeholder="blur"
            blurDataURL={shimmerDataUrl(1920, 1080)}
            onLoad={() => handleImageLoad(staticImageIndex)}
            fetchPriority={staticImageIndex === 0 ? 'high' : 'auto'}
          />
          {/* Mobile Image - only rendered when mobileImageUrl exists */}
          {slides[staticImageIndex]?.mobileImageUrl && (
            <Image
              src={slides[staticImageIndex].mobileImageUrl}
              alt={slides[staticImageIndex]?.title || ''}
              fill
              className="object-cover md:hidden"
              style={{
                objectPosition: `${slides[staticImageIndex]?.mobileFocalX * 100}% ${slides[staticImageIndex]?.mobileFocalY * 100}%`,
              }}
              priority={staticImageIndex === 0}
              loading={staticImageIndex === 0 ? undefined : 'lazy'}
              sizes="640px"
              placeholder="blur"
              blurDataURL={shimmerDataUrl(640, 1136)}
              fetchPriority={staticImageIndex === 0 ? 'high' : 'auto'}
            />
          )}
        </div>

        {/* WebGL Transition Layer - only visible during transitions */}
        {slides.length > 0 && (
          <div
            className="absolute inset-0"
            style={{
              transform: `translateY(${scrollY * 0.5}px)`,
              willChange: 'transform, opacity',
              pointerEvents: 'none', // Ensure WebGL layer doesn't block interactions
              zIndex: 2,
              opacity: isTransitioning ? 1 : 0,
              transition: isTransitioning ? 'none' : 'opacity 100ms ease-out',
            }}
          >
            <WebGLTransition
              ref={webglRef}
              fromImage={
                slides[transitionFromIndex]?.imageUrl ||
                slides[staticImageIndex]?.imageUrl ||
                ''
              }
              toImage={
                slides[transitionToIndex]?.imageUrl ||
                slides[staticImageIndex]?.imageUrl ||
                ''
              }
              fromFocalX={
                slides[transitionFromIndex]?.focalX ??
                slides[staticImageIndex]?.focalX ??
                0.5
              }
              fromFocalY={
                slides[transitionFromIndex]?.focalY ??
                slides[staticImageIndex]?.focalY ??
                0.5
              }
              toFocalX={
                slides[transitionToIndex]?.focalX ??
                slides[staticImageIndex]?.focalX ??
                0.5
              }
              toFocalY={
                slides[transitionToIndex]?.focalY ??
                slides[staticImageIndex]?.focalY ??
                0.5
              }
              progress={transitionProgress}
              className="h-full w-full"
              preloadNext={
                slides[(staticImageIndex + 1) % slides.length]?.imageUrl
              }
            />
          </div>
        )}
      </div>

      {/* Vignette overlay for top navigation visibility */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-black/50 via-black/20 to-transparent"
        style={{ zIndex: 5 }}
      />

      {/* Loading indicator when waiting for image to load */}
      {isWaitingForImage && (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          style={{ zIndex: 15 }}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            <span className="text-sm font-medium text-white/80">
              Loading...
            </span>
          </div>
        </div>
      )}

      {/* Content - Always on top */}
      <div
        className="pointer-events-none absolute inset-0 flex items-end"
        style={{ zIndex: 10 }}
      >
        <div className="w-full px-gutter pb-gutter text-right">
          <div className="relative">
            {/* Admin Edit Button */}
            {isAdmin && (
              <button
                onClick={() => setEditingSlide(slides[staticImageIndex])}
                className="absolute -top-12 right-0 z-20 rounded-full border border-white/20 bg-black/30 p-2 backdrop-blur-sm transition-colors hover:border-white/40 hover:bg-black/50"
                aria-label="Edit slide"
              >
                <Edit className="h-5 w-5 text-white" />
              </button>
            )}

            {/* Titles - Fade between slides */}
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute bottom-20 left-0 right-0 transition-opacity duration-300 ${
                  index === staticImageIndex && !isTransitioning
                    ? 'pointer-events-auto opacity-100'
                    : 'pointer-events-none opacity-0'
                }`}
              >
                {/* Clickable Title */}
                {slide.linkUrl ? (
                  <Link href={slide.linkUrl}>
                    <h1
                      className="cursor-pointer text-balance font-serif text-4xl font-light leading-[0.95] text-white transition-opacity hover:opacity-80 md:text-6xl lg:text-7xl"
                      style={{
                        filter: 'drop-shadow(0px 1px 0px rgba(0, 0, 0, .25))',
                      }}
                    >
                      {slide.title}
                    </h1>
                  </Link>
                ) : (
                  <h1
                    className="text-balance font-serif text-4xl font-light leading-[0.95] text-white md:text-6xl lg:text-7xl"
                    style={{
                      filter: 'drop-shadow(0px 1px 0px rgba(0, 0, 0, .25))',
                    }}
                  >
                    {slide.title}
                  </h1>
                )}
              </div>
            ))}

            {/* Controls Row - Play/Dots on left, CTAs on right */}
            <div className="pointer-events-auto flex flex-wrap items-center justify-between gap-4">
              {/* Play Button + Dots */}
              {slides.length > 1 ? (
                <div className="flex items-center gap-3">
                  {/* Play/Pause Button */}
                  <button
                    onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/20 text-white/60 backdrop-blur-sm transition-all hover:border-white/40 hover:bg-black/30 hover:text-white"
                    aria-label={
                      isAutoPlaying ? 'Pause slideshow' : 'Play slideshow'
                    }
                  >
                    {isAutoPlaying ? (
                      <svg
                        className="h-3 w-3"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                      </svg>
                    ) : (
                      <svg
                        className="ml-0.5 h-3 w-3"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </button>

                  {/* Pagination Dots */}
                  <div className="flex items-center gap-2">
                    {slides.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className="group flex h-6 w-6 items-center justify-center"
                        aria-label={`Go to slide ${index + 1}`}
                      >
                        <span
                          className={`relative h-1.5 overflow-hidden rounded-full transition-all duration-300 ${
                            index === staticImageIndex
                              ? 'w-6 bg-white/60'
                              : 'w-1.5 bg-white/40 group-hover:bg-white/60'
                          }`}
                        >
                          {index === staticImageIndex && isAutoPlaying && (
                            <span
                              className="absolute inset-0 origin-left rounded-full bg-white"
                              style={{
                                animation: 'fillProgress 5s linear forwards',
                              }}
                            />
                          )}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div />
              )}

              {/* CTA Buttons - Stack vertically on mobile, row on larger screens */}
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4">
                {/* Gallery CTA - only render for current slide */}
                {currentSlide.portfolioUrl && (
                  <ButtonLink
                    href={currentSlide.portfolioUrl}
                    variant="secondary"
                    size="lg"
                    glassOpacity={0.5}
                    className="w-full justify-center sm:w-auto"
                  >
                    Explore Gallery
                  </ButtonLink>
                )}

                {/* Book a Session CTA - Always visible */}
                <ButtonLink
                  href="/book"
                  variant="primary"
                  size="lg"
                  glassOpacity={0.5}
                  className="w-full justify-center sm:w-auto"
                >
                  Book a Session
                </ButtonLink>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows - Sides of Carousel */}
      {slides.length > 1 && (
        <>
          {/* Left Arrow - larger touch target on mobile */}
          <button
            onClick={() => {
              prevSlide()
              setIsAutoPlaying(false)
            }}
            className="pointer-events-auto absolute left-2 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center text-white/60 transition-all hover:text-white md:left-gutter md:h-auto md:w-auto"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-8 w-8 md:h-8 md:w-8" />
          </button>

          {/* Right Arrow - larger touch target on mobile */}
          <button
            onClick={() => {
              nextSlide()
              setIsAutoPlaying(false)
            }}
            className="pointer-events-auto absolute right-2 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center text-white/60 transition-all hover:text-white md:right-gutter md:h-auto md:w-auto"
            aria-label="Next slide"
          >
            <ChevronRight className="h-8 w-8 md:h-8 md:w-8" />
          </button>
        </>
      )}

      {/* Edit Modal */}
      {editingSlide && (
        <EditHeroSlideModal
          slide={editingSlide}
          isOpen={!!editingSlide}
          onClose={() => setEditingSlide(null)}
          onSave={() => {
            setRefreshKey((prev) => prev + 1)
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}
