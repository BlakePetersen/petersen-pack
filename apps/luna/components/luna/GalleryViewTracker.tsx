// ABOUTME: Client component for tracking gallery views
// ABOUTME: Fires analytics event when gallery page is viewed

'use client'

import { useEffect } from 'react'
import { trackGalleryView } from '@/lib/analytics'

export default function GalleryViewTracker({
  galleryTitle,
}: {
  galleryTitle: string
}) {
  useEffect(() => {
    trackGalleryView(galleryTitle)
  }, [galleryTitle])

  return null
}
