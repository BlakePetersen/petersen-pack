// ABOUTME: Site navigation header component
// ABOUTME: Responsive navigation with mobile menu support

'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Handle Escape key to close mobile menu
  useEffect(() => {
    if (!mobileMenuOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false)
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [mobileMenuOpen])

  return (
    <nav className="fixed top-0 z-40 w-full border-b bg-white/95 backdrop-blur-sm">
      <div className="container mx-auto px-6">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-gray-900">
            Ashley Petersen
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-8 md:flex">
            <Link
              href="/portfolio"
              className="text-gray-700 transition-colors hover:text-gray-900"
            >
              Portfolio
            </Link>
            <Link
              href="/about"
              className="text-gray-700 transition-colors hover:text-gray-900"
            >
              About
            </Link>
            <Link
              href="/services"
              className="text-gray-700 transition-colors hover:text-gray-900"
            >
              Services
            </Link>
            <Link
              href="/contact"
              className="text-gray-700 transition-colors hover:text-gray-900"
            >
              Contact
            </Link>
            <Link
              href="/contact"
              className="rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
            >
              Book a Session
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div id="mobile-menu" className="border-t py-4 md:hidden">
            <div className="flex flex-col gap-4">
              <Link
                href="/portfolio"
                className="text-gray-700 hover:text-gray-900"
                onClick={() => setMobileMenuOpen(false)}
              >
                Portfolio
              </Link>
              <Link
                href="/about"
                className="text-gray-700 hover:text-gray-900"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/services"
                className="text-gray-700 hover:text-gray-900"
                onClick={() => setMobileMenuOpen(false)}
              >
                Services
              </Link>
              <Link
                href="/contact"
                className="text-gray-700 hover:text-gray-900"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <Link
                href="/contact"
                className="rounded-lg bg-blue-600 px-6 py-2 text-center text-white hover:bg-blue-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                Book a Session
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
