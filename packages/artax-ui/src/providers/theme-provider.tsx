// ABOUTME: Pre-configured next-themes wrapper for the artax-ui design system.
// ABOUTME: Exports ThemeProvider (with data-theme attribute) and useTheme hook.
'use client'

import type { ReactNode } from 'react'
import { ThemeProvider as NextThemeProvider, useTheme } from 'next-themes'

type Theme = 'light' | 'dark' | 'system'

function ThemeProvider({
  children,
  defaultTheme = 'system'
}: {
  children: ReactNode
  defaultTheme?: Theme
}) {
  return (
    <NextThemeProvider
      attribute="data-theme"
      defaultTheme={defaultTheme}
      enableSystem
    >
      {children}
    </NextThemeProvider>
  )
}

export { ThemeProvider, useTheme }
export type { Theme }
