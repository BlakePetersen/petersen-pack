// ABOUTME: Root layout for blakepetersen.io.
// ABOUTME: Loads terminal aesthetic fonts and sets dark theme with artax-ui design system.

import type { Metadata } from 'next'
import { JetBrains_Mono, IBM_Plex_Mono, Inter } from 'next/font/google'
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
  title: 'Blake Petersen',
  description: 'Blake Petersen - Software Engineer',
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
      <body className="bg-terminal-bg text-terminal-text font-mono">
        {children}
      </body>
    </html>
  )
}
