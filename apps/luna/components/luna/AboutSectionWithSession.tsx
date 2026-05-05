// ABOUTME: Wrapper for AboutSection component
// ABOUTME: Session is provided by root ThemeProvider

'use client'

import { AboutSectionClient } from './AboutSectionClient'

type AboutContent = {
  heading: string
  imageUrl: string
  paragraphs: string[]
  stats: Array<{ value: string; label: string }>
  linkText: string
  linkUrl: string
}

type ImageData = {
  id: string
  url: string
  altText: string | null
  width: number | null
  height: number | null
  focalX: number | null
  focalY: number | null
  cropX: number | null
  cropY: number | null
  cropWidth: number | null
  cropHeight: number | null
  cropAspectRatio: string | null
  flipHorizontal: boolean | null
  flipVertical: boolean | null
}

type AboutSectionWithSessionProps = {
  content: AboutContent
  image?: ImageData | null
}

export function AboutSectionWithSession({
  content,
  image,
}: AboutSectionWithSessionProps) {
  return <AboutSectionClient content={content} image={image} />
}
