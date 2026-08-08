// ABOUTME: Root layout for blakepetersen.io.
// ABOUTME: Loads fonts, wraps app in ThemeProvider for light/dark mode switching.

import type { Metadata } from 'next'
import { JetBrains_Mono, IBM_Plex_Mono, Inter } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { Analytics } from '@vercel/analytics/react'
import { Header } from '../components/header'
import { Footer } from '../components/footer'
import './globals.css'

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono'
})

const ibmPlexMono = IBM_Plex_Mono({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-mono-alt'
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans'
})

export const metadata: Metadata = {
  metadataBase: new URL('https://blakepetersen.io'),
  title: {
    default: 'Blake Petersen',
    template: '%s | Blake Petersen'
  },
  description: 'AI-first DX practices, documented and applied',
  alternates: {
    types: {
      'application/rss+xml': '/feed.xml'
    }
  }
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${jetbrainsMono.variable} ${ibmPlexMono.variable} ${inter.variable}`}
    >
      <body className="flex min-h-screen flex-col bg-background text-sm text-foreground font-mono md:text-base">
        <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
