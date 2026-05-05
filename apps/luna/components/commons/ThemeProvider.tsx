// ABOUTME: Theme and session provider component for dark mode and auth support
// ABOUTME: Wraps app with next-themes ThemeProvider and NextAuth SessionProvider

'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { SessionProvider } from 'next-auth/react'
import { ComponentProps, useEffect } from 'react'

export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme')

    if (!storedTheme) {
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches
      const initialTheme = prefersDark ? 'dark' : 'light'
      localStorage.setItem('theme', initialTheme)
    }
  }, [])

  return (
    <SessionProvider refetchOnWindowFocus={false}>
      <NextThemesProvider {...props} enableSystem={false}>
        {children}
      </NextThemesProvider>
    </SessionProvider>
  )
}
