// ABOUTME: Preview mode banner component
// ABOUTME: Displays warning that content is not yet published with expiry info

'use client'

interface PreviewBannerProps {
  expiresAt: string
}

export default function PreviewBanner({ expiresAt }: PreviewBannerProps) {
  const expiryDate = new Date(expiresAt)
  const formattedExpiry = expiryDate.toLocaleString()

  return (
    <div className="fixed left-0 right-0 top-0 z-[70] bg-amber-500 px-4 py-3 text-center text-sm font-medium text-amber-950">
      You&apos;re viewing a preview. This content is not yet published.
      <span className="mx-2">&middot;</span>
      Link expires: {formattedExpiry}
    </div>
  )
}
