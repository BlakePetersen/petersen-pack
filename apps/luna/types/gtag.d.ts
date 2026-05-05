// ABOUTME: TypeScript definitions for Google Analytics gtag
// ABOUTME: Provides type safety for window.gtag function

interface Window {
  gtag: (
    command: 'config' | 'event' | 'js' | 'set',
    targetId: string | Date,
    config?: Record<string, unknown>
  ) => void
  dataLayer: unknown[]
}
