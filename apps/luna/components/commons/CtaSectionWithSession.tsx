// ABOUTME: Wrapper for CTA section component
// ABOUTME: Session is provided by root ThemeProvider

'use client'

import { CtaSectionClient } from '@/components/luna/CtaSectionClient'

type CtaContent = {
  heading: string
  subtitle: string
  buttonText: string
  buttonUrl: string
}

type CtaSectionWithSessionProps = {
  content: CtaContent
}

export function CtaSectionWithSession({ content }: CtaSectionWithSessionProps) {
  return <CtaSectionClient content={content} />
}
