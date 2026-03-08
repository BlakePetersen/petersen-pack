// ABOUTME: Root layout for blakepetersen.io.
// ABOUTME: Loads terminal aesthetic fonts and sets dark theme with artax-ui design system.

import type { Metadata } from 'next'
import { JetBrains_Mono, IBM_Plex_Mono, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { Header } from '../components/header'
import { Footer } from '../components/footer'
import './globals.css'

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

const ibmPlexMono = IBM_Plex_Mono({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-mono-alt',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://blakepetersen.io'),
  title: {
    default: 'Blake Petersen',
    template: '%s | Blake Petersen',
  },
  description: 'AI-first DX practices, documented and applied',
  alternates: {
    types: {
      'application/rss+xml': '/feed.xml',
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`dark ${jetbrainsMono.variable} ${ibmPlexMono.variable} ${inter.variable}`}
    >
      <body className="flex min-h-screen flex-col bg-terminal-bg text-sm text-terminal-text font-mono md:text-base">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  )
}
