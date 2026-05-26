// ABOUTME: Google Analytics 4 component
// ABOUTME: Loads gtag.js and tracks pageviews on route changes

'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { pageview, GA_MEASUREMENT_ID } from '@/lib/analytics'
import Script from 'next/script'
import { Suspense } from 'react'

function AnalyticsTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (pathname) {
      pageview(
        pathname +
          (searchParams?.toString() ? `?${searchParams.toString()}` : '')
      )
    }
  }, [pathname, searchParams])

  return null
}

export default function GoogleAnalytics() {
  if (process.env.NODE_ENV !== 'production' || !GA_MEASUREMENT_ID) {
    return null
  }

  return (
    <>
      <Suspense fallback={null}>
        <AnalyticsTracker />
      </Suspense>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  )
}
