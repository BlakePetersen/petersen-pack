// ABOUTME: Global site header component
// ABOUTME: Responsive navigation with gradient branding and mobile menu

'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Instagram } from 'lucide-react'
import { ButtonLink, BookSessionButton } from '@/components/commons'
import DarkModeToggle from '@/components/commons/DarkModeToggle'
import LunaLogo from '@/components/commons/LunaLogo'
import { LogoBranding } from '@/components/commons/LogoBranding'
import SearchModal from '@/components/luna/SearchModal'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const pathname = usePathname()
  const isHomePage = pathname === '/'
  const isAdminPage = pathname.startsWith('/admin')

  useEffect(() => {
    if (!isHomePage) return

    const handleScroll = () => {
      // Transition when nav reaches the hero copy area (bottom of viewport minus copy height)
      // Hero copy is ~200px tall (title + buttons + gutter padding)
      const heroContentTop = window.innerHeight - 200
      setIsScrolled(window.scrollY > heroContentTop)
    }

    // Check initial scroll position on mount
    handleScroll()

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isHomePage])

  // Keyboard shortcut for search (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const navLinks = [
    { href: '/portfolio', label: 'Portfolio' },
    { href: '/services', label: 'Services' },
    { href: '/faq', label: 'FAQ' },
    { href: '/blog', label: 'Blog' },
    { href: '/contact', label: 'Contact' },
    {
      href: 'https://www.instagram.com/ashleypetersen',
      label: 'Instagram',
      external: true,
    },
  ]

  // Check if current path matches or is a child of the nav link
  const isActiveLink = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const showHeader = !isHomePage || isScrolled

  // Don't render on admin pages (admin has its own navigation)
  if (isAdminPage) {
    return null
  }

  return (
    <nav
      aria-label="Main navigation"
      className={`fixed top-0 z-50 w-full transition-all duration-300 ease-in-out ${
        showHeader
          ? 'border-b border-gray-200 bg-white/95 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-950/95'
          : 'border-transparent bg-transparent'
      }`}
      style={{ viewTransitionName: 'site-nav' }}
    >
      <div
        className={`mx-auto transition-all duration-300 ease-in-out ${
          isHomePage && !isScrolled
            ? 'max-w-full p-gutter pt-0'
            : 'max-w-7xl p-gutter'
        }`}
      >
        <div
          className={`flex items-center transition-all duration-300 ease-in-out ${isHomePage && !isScrolled ? 'h-20 pt-gutter' : 'h-16'}`}
        >
          {/* Logo - always visible */}
          <div
            style={{
              filter:
                isHomePage && !isScrolled
                  ? 'drop-shadow(0px 1px 0px rgba(0, 0, 0, .25))'
                  : 'none',
            }}
          >
            <LogoBranding
              size={isHomePage && !isScrolled ? 48 : 40}
              logoClassName={`transition-all duration-300 ease-in-out ${
                isHomePage && !isScrolled
                  ? 'text-white'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
              primaryTextClassName={`transition-all duration-300 ease-in-out ${
                isHomePage && !isScrolled
                  ? 'text-white/90'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
              secondaryTextClassName={`transition-all duration-300 ease-in-out ${
                isHomePage && !isScrolled
                  ? 'text-white'
                  : 'text-gray-900 dark:text-white'
              }`}
            />
          </div>

          {/* Desktop Navigation - Right-aligned on transparent nav, centered otherwise */}
          <div
            className={`hidden items-center gap-8 transition-all duration-300 ease-in-out md:flex ${
              isHomePage && !isScrolled ? 'ml-auto' : 'mx-auto'
            }`}
          >
            {navLinks.map((link) => {
              const isActive = !link.external && isActiveLink(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  {...(link.external
                    ? { target: '_blank', rel: 'noopener noreferrer' }
                    : {})}
                  className={`flex items-center gap-1.5 font-serif font-medium transition-all duration-300 ease-in-out ${
                    isHomePage && !isScrolled
                      ? 'text-lg text-white/90 hover:text-white'
                      : isActive
                        ? 'text-sm text-gray-900 dark:text-white'
                        : 'text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                  }`}
                  style={{
                    filter:
                      isHomePage && !isScrolled
                        ? 'drop-shadow(0px 1px 0px rgba(0, 0, 0, .25))'
                        : 'none',
                  }}
                >
                  {link.external && <Instagram className="h-4 w-4" />}
                  {link.label}
                </Link>
              )
            })}
          </div>

          {/* CTA - Right corner (hidden on homepage until scrolled past hero) */}
          {(!isHomePage || isScrolled) && (
            <div className="hidden md:block">
              <BookSessionButton size="lg" />
            </div>
          )}

          {/* Mobile Menu Button - aligned right */}
          <div className="ml-auto flex items-center gap-3 md:hidden">
            <button
              className={`transition-colors ${
                isHomePage && !isScrolled
                  ? 'text-white/90 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                style={{
                  filter:
                    isHomePage && !isScrolled
                      ? 'drop-shadow(0px 1px 0px rgba(0, 0, 0, .25))'
                      : 'none',
                }}
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div
            id="mobile-menu"
            className="animate-fade-in border-t border-gray-200 bg-white/95 py-4 dark:border-gray-800 dark:bg-gray-950/95 md:hidden"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => {
                const isActive = !link.external && isActiveLink(link.href)
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    {...(link.external
                      ? { target: '_blank', rel: 'noopener noreferrer' }
                      : {})}
                    className={`flex items-center gap-1.5 font-serif text-sm transition-colors ${
                      isActive
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.external && <Instagram className="h-4 w-4" />}
                    {link.label}
                  </Link>
                )
              })}
              <div className="w-full">
                <BookSessionButton size="lg" className="w-full" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </nav>
  )
}
