// ABOUTME: About section for homepage
// ABOUTME: Features photographer bio, image, and statistics

import Image from 'next/image'
import Link from 'next/link'
import { shimmerDataUrl } from '@/lib/shimmer'

function AboutSection() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-800">
            <Image
              src="/uploads/scraped/1764034432564-0-lifestyle-portraiture.webp"
              alt="Ashley Petersen"
              fill
              className="object-cover"
              placeholder="blur"
              blurDataURL={shimmerDataUrl(600, 800)}
            />
          </div>
          <div>
            <h2 className="mb-6 font-serif text-5xl text-gray-900 dark:text-white md:text-6xl">
              About Ashley
            </h2>
            <div className="space-y-4 leading-relaxed text-gray-600 dark:text-gray-300">
              <p>
                With over a decade of experience capturing moments that matter,
                I specialize in creating timeless imagery that tells your unique
                story.
              </p>
              <p>
                My approach combines technical precision with artistic vision,
                resulting in photographs that are both beautiful and authentic.
                Whether it&apos;s an intimate portrait session or a grand
                commercial project, I bring the same level of dedication and
                creativity to every shoot.
              </p>
              <p>
                Based in the East Bay, I work with clients throughout the Bay
                Area, bringing a refined aesthetic and professional expertise to
                every project.
              </p>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-8">
              <div>
                <p className="font-serif text-4xl text-gray-900 dark:text-white">
                  10+
                </p>
                <p className="text-sm uppercase tracking-wider text-gray-600 dark:text-gray-400">
                  Years Experience
                </p>
              </div>
              <div>
                <p className="font-serif text-4xl text-gray-900 dark:text-white">
                  500+
                </p>
                <p className="text-sm uppercase tracking-wider text-gray-600 dark:text-gray-400">
                  Projects Completed
                </p>
              </div>
              <div>
                <p className="font-serif text-4xl text-gray-900 dark:text-white">
                  100+
                </p>
                <p className="text-sm uppercase tracking-wider text-gray-600 dark:text-gray-400">
                  Happy Clients
                </p>
              </div>
            </div>
            <div className="mt-8">
              <Link
                href="/about"
                className="group inline-flex items-center gap-2 text-lg font-semibold text-gray-900 transition-all hover:text-gray-600 dark:text-white dark:hover:text-gray-300"
              >
                Learn More About Me
                <svg
                  className="h-5 w-5 transition-transform group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
