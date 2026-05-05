// ABOUTME: Root layout component for the Next.js application
// ABOUTME: Wraps all pages with HTML structure and metadata

import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Inter, Playfair_Display, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider, CausticsOverlay } from '@/components/commons'
import {
  SkipNavigation,
  GoogleAnalytics,
  WebSiteStructuredData,
  WebVitals,
  Header,
} from '@/components/luna'
import { seedPageRequestContext } from '@/lib/request-context.page'
import { env } from '@/lib/env'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://ashleypetersen.com'),
  title: {
    default: 'Ashley Petersen Photography',
    template: '%s | Ashley Petersen Photography',
  },
  description:
    'Professional photography services in the East Bay, San Francisco, and Contra Costa County. Specializing in family, maternity, engagement, and wedding photography.',
  keywords: [
    'photography',
    'East Bay photographer',
    'San Francisco photographer',
    'family photography',
    'maternity photography',
    'engagement photography',
    'wedding photography',
    'Contra Costa County',
  ],
  authors: [{ name: 'Ashley Petersen' }],
  creator: 'Ashley Petersen',
  publisher: 'Ashley Petersen Photography',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://ashleypetersen.com',
    siteName: 'Ashley Petersen Photography',
    title: 'Ashley Petersen Photography',
    description:
      'Professional photography services in the East Bay, San Francisco, and Contra Costa County',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Ashley Petersen Photography',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ashley Petersen Photography',
    description:
      'Professional photography services in the East Bay, San Francisco, and Contra Costa County',
    images: ['/og-image.jpg'],
    creator: '@ashleypetersenphoto',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://ashleypetersen.com',
  },
  verification: {
    google: env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return seedPageRequestContext(() => (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${playfair.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        {/* Preconnect to Vercel Blob for faster image loading */}
        <link
          rel="preconnect"
          href="https://iwdr7kqxwo00nm51.public.blob.vercel-storage.com"
          crossOrigin="anonymous"
        />
        <link
          rel="dns-prefetch"
          href="https://iwdr7kqxwo00nm51.public.blob.vercel-storage.com"
        />
      </head>
      <body className="bg-white dark:bg-gray-950">
        <WebSiteStructuredData />
        <GoogleAnalytics />
        <WebVitals />
        <Analytics />
        <SkipNavigation />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          disableTransitionOnChange
        >
          {/* Header outside main for consistent rendering during transitions */}
          <Header />
          <Suspense fallback={null}>
            <CausticsOverlay />
          </Suspense>
          <main
            id="main-content"
            className="relative z-10 pt-20"
            style={{ viewTransitionName: 'main-content' }}
          >
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  ))
}
