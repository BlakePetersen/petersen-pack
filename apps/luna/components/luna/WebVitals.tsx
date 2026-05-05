// ABOUTME: Web Vitals tracking component for Core Web Vitals metrics
// ABOUTME: Sends LCP, FID, CLS, TTFB, INP metrics to Google Analytics

'use client'

import { useReportWebVitals } from 'next/web-vitals'

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Send to Google Analytics
    if (typeof window !== 'undefined' && 'gtag' in window) {
      const gtag = window.gtag as (
        command: string,
        action: string,
        params: Record<string, unknown>
      ) => void

      gtag('event', metric.name, {
        value: Math.round(
          metric.name === 'CLS' ? metric.value * 1000 : metric.value
        ),
        event_label: metric.id,
        non_interaction: true,
      })
    }
  })

  return null
}
