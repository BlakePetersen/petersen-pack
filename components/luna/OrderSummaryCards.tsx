// ABOUTME: Organism - Order summary with favorites and retouch cards
// ABOUTME: Displays two summary cards side-by-side for order confirmation

// fallow-ignore-file circular-dependencies

import { ImageThumbnailGrid } from './'

type ImageData = {
  id: string
  url: string
  altText: string | null
}

type OrderSummaryCardsProps = {
  favoriteImages: ImageData[]
  retouchImages: ImageData[]
}

function OrderSummaryCards({
  favoriteImages,
  retouchImages,
}: OrderSummaryCardsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Favorites Summary */}
      <div className="border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Favorite Images
        </h3>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          You&apos;ve selected {favoriteImages.length} favorite{' '}
          {favoriteImages.length === 1 ? 'image' : 'images'}.
        </p>
        {favoriteImages.length > 0 && (
          <ImageThumbnailGrid images={favoriteImages} />
        )}
      </div>

      {/* Retouch Summary */}
      <div className="border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Retouching Request
        </h3>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {retouchImages.length === 0
            ? 'No retouching requested.'
            : `${retouchImages.length} ${retouchImages.length === 1 ? 'image' : 'images'} selected for retouching.`}
        </p>
        {retouchImages.length > 0 && (
          <ImageThumbnailGrid images={retouchImages} />
        )}
      </div>
    </div>
  )
}
