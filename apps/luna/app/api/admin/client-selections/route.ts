// ABOUTME: Client-selections admin GET — composed wrapper chain per SEC-07
// ABOUTME: Adds adminAuth gate that was missing pre-migration (Rule 2 — security gap)

import { NextResponse } from 'next/server'
import { withRequestContext } from '@/lib/request-context'
import { withRateLimit, withAdminAuth } from '@/lib/wrappers'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export const GET = withRequestContext(
  withRateLimit(
    'admin',
    withAdminAuth(async () => {
      try {
        const galleriesWithFavorites = await prisma.clientGallery.findMany({
          include: {
            client: { select: { name: true, email: true } },
            images: {
              where: { isFavorite: true },
              select: {
                id: true,
                url: true,
                altText: true,
                width: true,
                height: true,
                isFavorite: true,
                createdAt: true,
              },
              orderBy: { createdAt: 'desc' },
            },
          },
          orderBy: { updatedAt: 'desc' },
        })

        const retouchRequests = await prisma.retouchRequest.findMany({
          include: {
            clientImage: {
              select: {
                id: true,
                url: true,
                altText: true,
                width: true,
                height: true,
                clientGalleryId: true,
                clientGallery: {
                  select: {
                    id: true,
                    title: true,
                    slug: true,
                    client: { select: { name: true, email: true } },
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        })

        const galleriesWithSelections = galleriesWithFavorites.filter(
          (gallery) => gallery.images.length > 0
        )

        return NextResponse.json({
          favorites: galleriesWithSelections,
          retouchRequests,
        })
      } catch (error) {
        logger.error({ err: error }, 'Error fetching client selections')
        return NextResponse.json(
          { error: 'Failed to fetch client selections' },
          { status: 500 }
        )
      }
    })
  )
)
