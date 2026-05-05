// ABOUTME: Molecule - Thumbnail grid for image summaries
// ABOUTME: Displays up to 8 image thumbnails with overflow count

import Image from 'next/image'

type ImageThumbnailGridProps = {
  images: Array<{
    id: string
    url: string
    altText: string | null
  }>
  maxDisplay?: number
}

export default function ImageThumbnailGrid({
  images,
  maxDisplay = 8,
}: ImageThumbnailGridProps) {
  const displayedImages = images.slice(0, maxDisplay)
  const remainingCount = images.length - maxDisplay

  return (
    <>
      <div className="mt-4 grid grid-cols-4 gap-2">
        {displayedImages.map((image) => (
          <div
            key={image.id}
            className="relative aspect-square overflow-hidden rounded"
          >
            <Image
              src={image.url}
              alt={image.altText || 'Thumbnail'}
              fill
              className="object-cover"
            />
          </div>
        ))}
      </div>
      {remainingCount > 0 && (
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          + {remainingCount} more
        </p>
      )}
    </>
  )
}
