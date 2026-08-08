// ABOUTME: Root layout for the Artax UI reference site.
// ABOUTME: Loads fonts, wraps app in ThemeProvider from artax-ui, provides sidebar-ready flex container.

import type { Metadata } from 'next'
import { JetBrains_Mono, Inter } from 'next/font/google'
import { ThemeProvider } from 'artax-ui'
import { Header } from '@/components/header'
import { SidebarNav } from '@/components/sidebar-nav'
import { getSidebarSections } from '@/lib/component-registry'
import './globals.css'

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono'
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans'
})

export const metadata: Metadata = {
  title: {
    default: 'Artax UI',
    template: '%s | Artax UI'
  },
  description: 'Component library and design system reference'
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  const sections = getSidebarSections()

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${jetbrainsMono.variable} ${inter.variable}`}
    >
      <body className="flex min-h-screen flex-col bg-background text-sm text-foreground font-mono md:text-base">
        <ThemeProvider>
          <Header />
          <div className="flex flex-1">
            <aside className="hidden md:block w-64 shrink-0 border-r border-border overflow-y-auto">
              <SidebarNav sections={sections} />
            </aside>
            <main className="flex-1 p-6 md:p-8">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
