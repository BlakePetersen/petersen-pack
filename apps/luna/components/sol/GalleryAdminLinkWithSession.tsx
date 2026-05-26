// ABOUTME: Wrapper for GalleryAdminLink component
// ABOUTME: Session is provided by root ThemeProvider

'use client'

import GalleryAdminLink from './GalleryAdminLink'

type GalleryAdminLinkWithSessionProps = {
  galleryId: string
}

export default function GalleryAdminLinkWithSession({
  galleryId,
}: GalleryAdminLinkWithSessionProps) {
  return <GalleryAdminLink galleryId={galleryId} />
}
