// ABOUTME: Utility functions for generating blur placeholder data URLs
// ABOUTME: Creates shimmer effect for image loading states

function shimmer(w: number, h: number) {
  return `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#9ca3af" offset="0%" />
      <stop stop-color="#6b7280" offset="25%" />
      <stop stop-color="#9ca3af" offset="50%" />
      <stop stop-color="#6b7280" offset="75%" />
      <stop stop-color="#9ca3af" offset="100%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#9ca3af" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1.5s" repeatCount="indefinite" />
</svg>`
}

function toBase64(str: string) {
  return typeof window === 'undefined'
    ? Buffer.from(str).toString('base64')
    : window.btoa(str)
}

export function shimmerDataUrl(w: number, h: number) {
  return `data:image/svg+xml;base64,${toBase64(shimmer(w, h))}`
}
