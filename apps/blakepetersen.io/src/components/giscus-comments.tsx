// ABOUTME: Client component that lazy-loads the giscus comment widget via IntersectionObserver.
// ABOUTME: Injects giscus script on scroll, listens for reaction metadata via postMessage.

'use client'

import { useEffect, useRef, useState } from 'react'

export function GiscusComments({
  onMetadata,
}: {
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
    script.setAttribute('data-repo-id', 'MDEwOlJlcG9zaXRvcnkxMzg3OTA1NTE=')
    script.setAttribute('data-category', 'Comments')
    script.setAttribute('data-category-id', 'DIC_kwDOCEXGl84C4IeU')
    script.setAttribute('data-mapping', 'pathname')
    script.setAttribute('data-strict', '1')
    script.setAttribute('data-reactions-enabled', '1')
    script.setAttribute('data-emit-metadata', '1')
    script.setAttribute('data-input-position', 'bottom')
    script.setAttribute('data-lang', 'en')
    const theme =
      process.env.NEXT_PUBLIC_SITE_URL
        ? `${process.env.NEXT_PUBLIC_SITE_URL}/giscus-theme.css`
        : 'dark_tritanopia'
    script.setAttribute('data-theme', theme)
    script.crossOrigin = 'anonymous'
    script.async = true

    containerRef.current.appendChild(script)
  }, [loaded])

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
