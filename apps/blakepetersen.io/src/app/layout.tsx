// ABOUTME: Root layout for blakepetersen.io.
// ABOUTME: Minimal App Router shell -- rebuilt in Phase 5.

import type { Metadata } from 'next'

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
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
