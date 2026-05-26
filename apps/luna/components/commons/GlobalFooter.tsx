// ABOUTME: Global site footer component
// ABOUTME: Editorial-style footer with warm gradients and elegant flourishes

// fallow-ignore-file circular-dependencies

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Images } from 'lucide-react'
import { Container } from '@/components/commons'
import DarkModeToggle from '@/components/commons/DarkModeToggle'
import LunaLogo from '@/components/commons/LunaLogo'

function SparkleDivider() {
  return (
    <div className="absolute inset-x-0 top-0 z-10 flex h-0 items-center justify-center overflow-visible px-gutter">
      {/* Gradient lines - pulse toward center */}
      <div className="absolute inset-x-6 top-1/2 flex -translate-y-1/2 items-center justify-center md:inset-x-12">
        {/* Left line with traveling pulse */}
        <div className="relative h-px flex-1 overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to right, transparent 0%, rgba(251, 146, 60, 0.1) 50%, rgba(251, 146, 60, 0.2) 100%)',
            }}
          />
          {/* Traveling pulse */}
          <div
            className="absolute inset-y-0 w-32"
            style={{
              background:
                'linear-gradient(to right, transparent, rgba(251, 146, 60, 0.4), rgba(255, 220, 180, 0.6), rgba(251, 146, 60, 0.4), transparent)',
              animation:
                'line-pulse-left 33s cubic-bezier(0.4, 0, 1, 1) infinite',
            }}
          />
        </div>
        {/* Gap for sparkle */}
        <div className="w-16" />
        {/* Right line with traveling pulse */}
        <div className="relative h-px flex-1 overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to left, transparent 0%, rgba(251, 146, 60, 0.1) 50%, rgba(251, 146, 60, 0.2) 100%)',
            }}
          />
          {/* Traveling pulse */}
          <div
            className="absolute inset-y-0 w-32"
            style={{
              background:
                'linear-gradient(to left, transparent, rgba(251, 146, 60, 0.4), rgba(255, 220, 180, 0.6), rgba(251, 146, 60, 0.4), transparent)',
              animation:
                'line-pulse-right 33s cubic-bezier(0.4, 0, 1, 1) infinite',
            }}
          />
        </div>
      </div>

      {/* Center sparkle */}
      <div className="relative overflow-visible">
        {/* Outer glow - white center to golden edge with soft fade */}
        <div
          className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(255, 255, 255, 0.5) 0%, rgba(255, 240, 220, 0.3) 20%, rgba(251, 191, 120, 0.15) 40%, rgba(251, 146, 60, 0.08) 60%, rgba(251, 146, 60, 0.02) 80%, transparent 100%)',
            animation: 'sparkle-glow 33s ease-out infinite',
          }}
        />
        {/* Luna logo icon */}
        <div
          className="text-white"
          style={{
            animation: 'sparkle-icon 33s ease-out infinite',
          }}
        >
          <LunaLogo size={50} />
        </div>
      </div>
    </div>
  )
}

export default function GlobalFooter() {
  const currentYear = new Date().getFullYear()
  const pathname = usePathname()

  const isActiveLink = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const navigationLinks = [
    { href: '/portfolio', label: 'Portfolio' },
    { href: '/services', label: 'Services' },
    { href: '/faq', label: 'FAQ' },
    { href: '/blog', label: 'Blog' },
    { href: '/contact', label: 'Contact' },
  ]

  return (
    <footer className="relative text-gray-600 dark:text-gray-400">
      {/* Sparkle divider between content and footer - outside overflow clip */}
      <SparkleDivider />

      {/* Ambient background glow - warm tones from above */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 dark:hidden"
          style={{
            background:
              'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255, 237, 213, 0.4) 0%, rgba(254, 215, 170, 0.2) 40%, transparent 70%)',
          }}
        />
        <div
          className="absolute inset-0 hidden dark:block"
          style={{
            background:
              'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(180, 83, 9, 0.1) 0%, rgba(126, 34, 106, 0.05) 40%, transparent 70%)',
          }}
        />
      </div>

      <Container className="relative py-16">
        {/* Brand Text */}
        <div className="mb-10 text-center">
          <span
            className="block text-xs font-medium uppercase text-gray-500 dark:text-gray-500"
            style={{ letterSpacing: '3px' }}
          >
            Ashley Petersen
          </span>
          <span
            className="-mt-0.5 block font-serif text-xl text-gray-800 dark:text-gray-200"
            style={{ letterSpacing: '4px' }}
          >
            Photography
          </span>
        </div>

        {/* Navigation Links with subtle separators */}
        <nav className="mb-8">
          <ul className="flex flex-wrap items-center justify-center gap-x-2 gap-y-3">
            {navigationLinks.map((link) => {
              const isActive = isActiveLink(link.href)
              return (
                <li key={link.href} className="flex items-center gap-2">
                  <Link
                    href={link.href}
                    className={`font-serif text-sm tracking-wide transition-colors hover:text-gray-900 dark:hover:text-white ${
                      isActive ? 'text-gray-900 dark:text-white' : ''
                    }`}
                  >
                    {link.label}
                  </Link>
                  <span className="text-orange-300/60 dark:text-orange-400/40">
                    ·
                  </span>
                </li>
              )
            })}
            <li className="flex items-center gap-2">
              <Link
                href="/client-portal"
                className={`flex items-center gap-2 font-serif text-sm tracking-wide transition-colors hover:text-gray-900 dark:hover:text-white ${
                  isActiveLink('/client-portal')
                    ? 'text-gray-900 dark:text-white'
                    : ''
                }`}
              >
                <Images className="h-4 w-4" />
                My Photos
              </Link>
              <span className="text-orange-300/60 dark:text-orange-400/40">
                ·
              </span>
            </li>
            <li className="flex items-center gap-2">
              <Link
                href="/brand"
                className={`font-serif text-sm tracking-wide transition-colors hover:text-gray-900 dark:hover:text-white ${
                  isActiveLink('/brand') ? 'text-gray-900 dark:text-white' : ''
                }`}
              >
                Brand
              </Link>
              <span className="text-orange-300/60 dark:text-orange-400/40">
                ·
              </span>
            </li>
            <li>
              <DarkModeToggle variant="dropdown" />
            </li>
          </ul>
        </nav>

        {/* Copyright */}
        <p className="text-center font-serif text-xs tracking-wide text-gray-400 dark:text-gray-500">
          © {currentYear} Ashley Petersen Photography
        </p>
      </Container>
    </footer>
  )
}
