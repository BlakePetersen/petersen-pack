// ABOUTME: Instagram API route for fetching recent posts
// ABOUTME: Fetches posts from Instagram Basic Display API with caching

import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { env } from '@/lib/env'

type InstagramPost = {
  id: string
  imageUrl: string
  permalink: string
  caption?: string
}

export async function GET() {
  try {
    const accessToken = env.INSTAGRAM_ACCESS_TOKEN

    if (!accessToken) {
      logger.warn('instagram.token_missing')
      return NextResponse.json({ posts: [] }, { status: 200 })
    }

    // Fetch user's media from Instagram Basic Display API
    // This endpoint returns the user's most recent media
    const response = await fetch(
      `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,timestamp&access_token=${accessToken}&limit=6`,
      {
        next: { revalidate: 3600 },
      }
    )

    if (!response.ok) {
      logger.error(
        { status: response.status, statusText: response.statusText },
        'Instagram API error'
      )
      return NextResponse.json({ posts: [] }, { status: 200 })
    }

    const data = await response.json()

    // Filter for images only and transform to our format
    const posts: InstagramPost[] = (data.data || [])
      .filter((item: any) => item.media_type === 'IMAGE')
      .slice(0, 4) // Limit to 4 posts
      .map((item: any) => ({
        id: item.id,
        imageUrl: item.media_url,
        permalink: item.permalink,
        caption: item.caption || '',
      }))

    return NextResponse.json(
      { posts },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800',
        },
      }
    )
  } catch (error) {
    logger.error({ err: error }, 'Error fetching Instagram posts')
    return NextResponse.json({ posts: [] }, { status: 200 })
  }
}
