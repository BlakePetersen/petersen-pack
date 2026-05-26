// ABOUTME: Testimonials section component that displays cycling client testimonials
// ABOUTME: Fetches active testimonials from database and displays them with automatic rotation

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { Button } from '@/components/commons/Button'

interface Testimonial {
  id: string
  clientName: string
  clientPhoto: string | null
  projectType: string
  serviceType: string | null
  location: string | null
  quote: string
  rating: number
  videoUrl: string | null
  caseStudyUrl: string | null
}

interface TestimonialsSectionProps {
  testimonials: Testimonial[]
}

export function TestimonialsSection({
  testimonials,
}: TestimonialsSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [isInView, setIsInView] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  const nextTestimonial = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }, [testimonials.length])

  const prevTestimonial = useCallback(() => {
    setCurrentIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    )
  }, [testimonials.length])

  // Intersection Observer to detect when section is in view
  useEffect(() => {
    if (!sectionRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting)
      },
      {
        threshold: 0.3, // Trigger when 30% of the section is visible
      }
    )

    observer.observe(sectionRef.current)

    return () => observer.disconnect()
  }, [])

  // Auto-rotation effect - only runs when in view
  useEffect(() => {
    if (!isAutoPlaying || !isInView || testimonials.length <= 1) return

    const interval = setInterval(() => {
      nextTestimonial()
    }, 6000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, isInView, nextTestimonial, testimonials.length])

  if (testimonials.length === 0) {
    return null
  }

  const currentTestimonial = testimonials[currentIndex]

  return (
    <section ref={sectionRef} data-section="Kind Words" className="px-6 py-24">
      <div className="mx-auto max-w-4xl">
        <div className="mb-16 text-center">
          <h2 className="mb-4 font-serif text-5xl md:text-6xl">Kind Words</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            What clients say about their experience
          </p>
        </div>

        <div className="relative">
          {/* Testimonial Content */}
          <div className="px-8 text-center md:px-16">
            {/* Client Photo */}
            {currentTestimonial.clientPhoto && (
              <div className="mb-6 flex justify-center">
                <img
                  src={currentTestimonial.clientPhoto}
                  alt={currentTestimonial.clientName}
                  className="h-20 w-20 rounded-full object-cover ring-4 ring-gray-200 dark:ring-gray-700"
                />
              </div>
            )}

            {/* Rating Stars */}
            <div className="mb-6 flex justify-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < currentTestimonial.rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300 dark:text-gray-600'
                  }`}
                />
              ))}
            </div>

            {/* Quote */}
            <blockquote className="mb-8 font-serif text-2xl leading-relaxed text-gray-900 dark:text-gray-100 md:text-3xl lg:text-4xl">
              &ldquo;{currentTestimonial.quote}&rdquo;
            </blockquote>

            {/* Client Info */}
            <div className="space-y-1">
              <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {currentTestimonial.clientName}
              </p>
              <p className="text-sm uppercase tracking-wider text-gray-600 dark:text-gray-400">
                {currentTestimonial.projectType}
              </p>
              {currentTestimonial.location && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {currentTestimonial.location}
                </p>
              )}
            </div>

            {/* Case Study Link */}
            {currentTestimonial.caseStudyUrl && (
              <div className="mt-6">
                <a
                  href={currentTestimonial.caseStudyUrl}
                  className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
                >
                  Read Full Story
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </a>
              </div>
            )}
          </div>

          {/* Navigation */}
          {testimonials.length > 1 && (
            <>
              <div className="mt-12 flex items-center justify-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    prevTestimonial()
                    setIsAutoPlaying(false)
                  }}
                  className="h-10 w-10 rounded-full border border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>

                {/* Pagination Dots */}
                <div className="flex gap-2">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setCurrentIndex(index)
                        setIsAutoPlaying(false)
                      }}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        index === currentIndex
                          ? 'w-8 bg-gray-900 dark:bg-gray-100'
                          : 'w-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500'
                      }`}
                      aria-label={`Go to testimonial ${index + 1}`}
                    />
                  ))}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    nextTestimonial()
                    setIsAutoPlaying(false)
                  }}
                  className="h-10 w-10 rounded-full border border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
