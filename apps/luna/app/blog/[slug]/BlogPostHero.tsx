// ABOUTME: Hero section for blog posts with parallax effect
// ABOUTME: Full-bleed cover image with gradient overlay and scroll-based parallax

'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { cleanBlogTitle } from '@/lib/utils'

type BlogPostHeroProps = {
  title: string
  coverImage: string | null
  coverFocalX: number
  coverFocalY: number
  publishedAt: Date | null
  imageCount: number
  categories: Array<{
    categoryId: string
    category: {
      slug: string
      name: string
    }
  }>
  editUrl?: string
}

export default function BlogPostHero({
  title,
  coverImage,
  coverFocalX,
  coverFocalY,
  publishedAt,
  imageCount,
  categories,
  editUrl,
}: BlogPostHeroProps) {
  const heroRef = useRef<HTMLElement>(null)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect()
        // Only update when hero is visible
        if (rect.bottom > 0) {
          setScrollY(window.scrollY)
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Parallax: image moves slower than scroll (0.5 ratio)
  // Start with image centered, reveal more as user scrolls
  const parallaxOffset = scrollY * 0.4

  return (
    <section
      ref={heroRef}
      className="relative h-[70vh] min-h-[500px] w-full overflow-hidden"
    >
      {coverImage ? (
        <>
          <div
            className="absolute inset-0 h-[120%] bg-cover will-change-transform"
            style={{
              backgroundImage: `url(${coverImage})`,
              backgroundPosition: `${coverFocalX * 100}% ${coverFocalY * 100}%`,
              transform: `translateY(${parallaxOffset}px)`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-800 to-gray-700" />
      )}

      {/* Back to Blog - Top Left */}
      <Link
        href="/blog"
        className="group/back absolute left-6 top-40 z-10 inline-flex items-center gap-2 overflow-hidden rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg md:left-8 md:top-36"
      >
        {/* Top shine highlight */}
        <div
          className="absolute inset-x-0 top-0 h-1/2 rounded-t-xl opacity-60"
          style={{
            background:
              'linear-gradient(to bottom, rgba(255, 255, 255, 0.8), transparent)',
          }}
        />

        {/* Glint sweep effect on hover */}
        <div
          className="pointer-events-none absolute inset-0 -translate-x-full rounded-xl opacity-0 transition-all duration-700 group-hover/back:translate-x-full group-hover/back:opacity-100"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent)',
            width: '150%',
          }}
        />

        <svg
          className="relative z-10 h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        <span className="relative z-10">Back to Blog</span>
      </Link>

      {/* Edit Post - Top Right (Admin only) */}
      {editUrl && (
        <Link
          href={editUrl}
          className="absolute right-6 top-40 z-10 inline-flex items-center gap-2 text-sm font-medium text-white/90 drop-shadow-md transition-colors hover:text-white md:right-8 md:top-36"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
            />
          </svg>
          Edit Post
        </Link>
      )}

      {/* Title Content - Bottom Center */}
      <div className="absolute inset-x-0 bottom-0 px-6 pb-12 md:pb-16">
        <div className="mx-auto max-w-[1075px]">
          <header className="text-center">
            <div className="mb-4 flex flex-wrap justify-center gap-3">
              {categories.map((cat, index) => (
                <span key={cat.categoryId} className="flex items-center gap-3">
                  {index > 0 && <span className="text-white/50">·</span>}
                  <Link
                    href={`/blog/category/${cat.category.slug}`}
                    className="text-xs font-medium uppercase tracking-widest text-white/80 transition-colors hover:text-white"
                  >
                    {cat.category.name}
                  </Link>
                </span>
              ))}
            </div>

            <h1 className="mb-6 font-serif text-4xl text-white drop-shadow-lg md:text-5xl lg:text-6xl">
              {cleanBlogTitle(title)}
            </h1>

            <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-white/70">
              <time dateTime={publishedAt?.toISOString()}>
                {publishedAt?.toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </time>
              {imageCount > 0 && (
                <>
                  <span>•</span>
                  <button
                    onClick={() => {
                      document
                        .getElementById('gallery')
                        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }}
                    className="transition-colors hover:text-white"
                  >
                    {imageCount} {imageCount === 1 ? 'image' : 'images'}
                  </button>
                </>
              )}
            </div>
          </header>
        </div>
      </div>
    </section>
  )
}
