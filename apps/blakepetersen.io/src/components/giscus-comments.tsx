// ABOUTME: Client component that lazy-loads the giscus comment widget via IntersectionObserver.
// ABOUTME: Injects giscus script on scroll, listens for reaction metadata via postMessage.

'use client'

import { useEffect, useRef, useState } from 'react'

export function GiscusComments({
  term,
  onMetadata,
}: {
  term: string
  onMetadata?: (data: { reactionCount: number }) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!containerRef.current || loaded) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoaded(true)
          observer.disconnect()
        }
      },
      { threshold: 0, rootMargin: '200px' },
    )

    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [loaded])

  useEffect(() => {
    if (!loaded || !containerRef.current) return

    const script = document.createElement('script')
    script.src = 'https://giscus.app/client.js'
    script.setAttribute('data-repo', 'BlakePetersen/petersen-pack')
    // TODO: Replace with actual values from giscus.app configurator after GitHub setup
    script.setAttribute('data-repo-id', 'REPLACE_WITH_REPO_ID')
    script.setAttribute('data-category', 'Comments')
    script.setAttribute('data-category-id', 'REPLACE_WITH_CATEGORY_ID')
    script.setAttribute('data-mapping', 'specific')
    script.setAttribute('data-term', term)
    script.setAttribute('data-strict', '1')
    script.setAttribute('data-reactions-enabled', '1')
    script.setAttribute('data-emit-metadata', '1')
    script.setAttribute('data-input-position', 'bottom')
    script.setAttribute('data-lang', 'en')
    // Custom theme hosted at the site's public URL.
    // During local dev the giscus iframe can't reach localhost, so the theme won't load.
    script.setAttribute(
      'data-theme',
      'https://blakepetersen.io/giscus-theme.css',
    )
    script.crossOrigin = 'anonymous'
    script.async = true

    containerRef.current.appendChild(script)
  }, [loaded, term])

  useEffect(() => {
    if (!onMetadata) return

    const callback = onMetadata
    function handleMessage(event: MessageEvent) {
      if (event.origin !== 'https://giscus.app') return
      const discussion = event.data?.giscus?.discussion
      if (!discussion) return

      // Use THUMBS_UP count if available, fall back to total reactionCount
      const thumbsUp = discussion.reactions?.THUMBS_UP?.count
      const count = thumbsUp ?? discussion.reactionCount ?? 0
      callback({ reactionCount: count })
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [onMetadata])

  return <div ref={containerRef} className="giscus mt-4 min-h-[150px]" />
}
