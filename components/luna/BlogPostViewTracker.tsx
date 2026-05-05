// ABOUTME: Client component for tracking blog post views
// ABOUTME: Fires analytics event when blog post page is viewed

'use client'

import { useEffect } from 'react'
import { trackBlogPostView } from '@/lib/analytics'

export default function BlogPostViewTracker({
  postTitle,
}: {
  postTitle: string
}) {
  useEffect(() => {
    trackBlogPostView(postTitle)
  }, [postTitle])

  return null
}
