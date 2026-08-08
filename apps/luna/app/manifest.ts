// ABOUTME: PWA manifest configuration
// ABOUTME: Provides app-like experience on mobile devices

import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Ashley Petersen Photography',
    short_name: 'AP Photography',
    description:
      'Professional photography services in the East Bay, San Francisco, and Contra Costa County',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1e40af',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
