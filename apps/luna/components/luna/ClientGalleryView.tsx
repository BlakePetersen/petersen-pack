// ABOUTME: Client gallery viewing component
// ABOUTME: Multi-step flow for selecting favorites, requesting retouches, and confirming orders

// fallow-ignore-file circular-dependencies

'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { logger } from '@/lib/logger.edge'
import {
  ProgressSteps,
  SectionHeader,
  ConfirmationModal,
  Button,
  ImageCard,
  Lightbox,
} from '@/components/commons'
import { CostBreakdown, ChangeRequestForm } from './'
import ExpirationCountdown from '@/components/sol/ExpirationCountdown'

type RetouchStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'DECLINED'

type ClientGallery = {
  id: string
  title: string
  slug: string
  expiresAt: Date | null
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'COMPLETED'
  submittedAt: Date | null
  client: {
    name: string | null
    email: string
  }
  images: Array<{
    id: string
    url: string
    altText: string | null
    width: number | null
    height: number | null
    isFavorite: boolean
    isArtistPick: boolean
    downloaded: boolean
    retouchRequests: Array<{
      id: string
      status: RetouchStatus
    }>
  }>
}

function ArtistPickBadge() {
  return (
    <div className="absolute bottom-2 right-2 flex items-center gap-1.5 rounded-full bg-purple-600/90 px-2.5 py-1 text-xs font-medium text-white shadow-md backdrop-blur-sm">
      <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      Artist Pick
    </div>
  )
}

function RetouchStatusBadge({ status }: { status: RetouchStatus }) {
  const styles: Record<RetouchStatus, { bg: string; label: string }> = {
    PENDING: {
      bg: 'bg-amber-500/90',
      label: 'Retouch Pending',
    },
    IN_PROGRESS: {
      bg: 'bg-blue-500/90',
      label: 'Retouching...',
    },
    COMPLETED: {
      bg: 'bg-emerald-500/90',
      label: 'Retouched ✓',
    },
    DECLINED: {
      bg: 'bg-red-500/90',
      label: 'Declined',
    },
  }

  const style = styles[status]
  return (
    <div
      className={`absolute left-2 top-2 rounded-full ${style.bg} px-2.5 py-1 text-xs font-medium text-white shadow-md backdrop-blur-sm`}
    >
      {style.label}
    </div>
  )
}

type Step = 'select-favorites' | 'select-retouch' | 'confirm'

const STEPS = [
  { id: 'select-favorites' as Step, number: 1, label: 'Select Favorites' },
  { id: 'select-retouch' as Step, number: 2, label: 'Select Retouching' },
  { id: 'confirm' as Step, number: 3, label: 'Confirm' },
]

const RETOUCH_PRICE = 50

export default function ClientGalleryView({
  gallery,
  userId,
}: {
  gallery: ClientGallery
  userId: string
}) {
  const [currentStep, setCurrentStep] = useState<Step>('select-favorites')
  const [favorites, setFavorites] = useState<Set<string>>(
    new Set(gallery.images.filter((img) => img.isFavorite).map((img) => img.id))
  )
  const [retouchSelections, setRetouchSelections] = useState<Set<string>>(
    new Set()
  )
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [showChangeRequestForm, setShowChangeRequestForm] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const toggleFavorite = async (imageId: string) => {
    const newIsFavorite = !favorites.has(imageId)

    setFavorites((prev) => {
      const next = new Set(prev)
      if (newIsFavorite) {
        next.add(imageId)
      } else {
        next.delete(imageId)
        setRetouchSelections((retouchPrev) => {
          const retouchNext = new Set(retouchPrev)
          retouchNext.delete(imageId)
          return retouchNext
        })
      }
      return next
    })

    try {
      await fetch(`/api/client-images/${imageId}/favorite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: newIsFavorite }),
      })
    } catch (error) {
      logger.error({ err: error }, 'Error toggling favorite')
      setFavorites((prev) => {
        const next = new Set(prev)
        newIsFavorite ? next.delete(imageId) : next.add(imageId)
        return next
      })
    }
  }

  const toggleRetouchSelection = (imageId: string) => {
    setRetouchSelections((prev) => {
      const next = new Set(prev)
      next.has(imageId) ? next.delete(imageId) : next.add(imageId)
      return next
    })
  }

  const proceedToRetouchSelection = () => {
    if (favorites.size === 0) {
      alert('Please select at least one favorite image before proceeding.')
      return
    }
    setCurrentStep('select-retouch')
  }

  const submitOrder = async () => {
    try {
      // Submit retouch requests if any
      if (retouchSelections.size > 0) {
        const promises = Array.from(retouchSelections).map((imageId) =>
          fetch(`/api/client-images/${imageId}/retouch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ clientGalleryId: gallery.id, notes: '' }),
          })
        )
        await Promise.all(promises)
      }

      // Update gallery status to PENDING
      await fetch(`/api/client-galleries/${gallery.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      setSuccessMessage(
        `Your selections have been submitted! ${
          retouchSelections.size > 0
            ? `${retouchSelections.size} retouch ${
                retouchSelections.size === 1 ? 'request has' : 'requests have'
              } been sent.`
            : ''
        } Your gallery is now pending review.`
      )
      setShowSuccessModal(true)

      // Refresh page to show updated status
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error) {
      logger.error({ err: error }, 'Error submitting order')
      setSuccessMessage('Failed to submit your order. Please try again.')
      setShowSuccessModal(true)
    }
  }

  const favoriteImages = gallery.images.filter((img) => favorites.has(img.id))
  const isPending = gallery.status === 'PENDING'

  // When pending, use server data for retouch requests; otherwise use local state
  const retouchImages = isPending
    ? gallery.images.filter((img) => img.retouchRequests.length > 0)
    : gallery.images.filter((img) => retouchSelections.has(img.id))

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-white dark:bg-gray-950">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                {gallery.title}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                <span>
                  {gallery.images.length}{' '}
                  {gallery.images.length === 1 ? 'photo' : 'photos'}
                </span>
                {isPending && gallery.submittedAt && (
                  <>
                    <span className="text-gray-300 dark:text-gray-600">•</span>
                    <span className="font-medium text-accent-600 dark:text-accent-400">
                      Submitted{' '}
                      {formatDistanceToNow(new Date(gallery.submittedAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </>
                )}
              </div>
            </div>
            {gallery.expiresAt && (
              <div className="shrink-0">
                <ExpirationCountdown expiresAt={gallery.expiresAt} />
              </div>
            )}
          </div>
        </div>
      </div>

      {!isPending && <ProgressSteps currentStep={currentStep} steps={STEPS} />}

      <main className="container mx-auto px-6 py-8">
        {/* Read-only view when pending */}
        {isPending ? (
          <>
            <div className="mb-8 rounded-xl border border-accent-200 bg-gradient-to-r from-accent-50 to-white p-6 shadow-sm dark:border-accent-800 dark:from-accent-900/30 dark:to-gray-800/50">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-100 dark:bg-accent-800">
                  <svg
                    className="h-5 w-5 text-accent-600 dark:text-accent-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Your selections are under review
                  </h2>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Your gallery has been submitted and is pending review. You
                    can view your selections below, but you cannot make changes
                    at this time.
                  </p>
                  {!showChangeRequestForm && (
                    <Button
                      onClick={() => setShowChangeRequestForm(true)}
                      variant="secondary"
                      className="mt-4"
                    >
                      Request Changes
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {showChangeRequestForm && (
              <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                  Request Changes
                </h3>
                <ChangeRequestForm
                  galleryId={gallery.id}
                  onSuccess={() => {
                    setShowChangeRequestForm(false)
                    setSuccessMessage(
                      'Your change request has been submitted successfully!'
                    )
                    setShowSuccessModal(true)
                  }}
                  onCancel={() => setShowChangeRequestForm(false)}
                />
              </div>
            )}

            <SectionHeader
              title="Your Selections"
              subtitle={`${favoriteImages.length} ${favoriteImages.length === 1 ? 'favorite' : 'favorites'} • ${retouchImages.length} retouch ${retouchImages.length === 1 ? 'request' : 'requests'}`}
            />

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {favoriteImages.map((image) => {
                const retouchRequest = image.retouchRequests[0]
                const originalIndex = gallery.images.findIndex(
                  (img) => img.id === image.id
                )
                return (
                  <div key={image.id} className="relative">
                    <ImageCard
                      image={image}
                      actionType="favorite"
                      isSelected={true}
                      onToggle={() => {}}
                      onClick={() => setLightboxIndex(originalIndex)}
                    />
                    {image.isArtistPick && <ArtistPickBadge />}
                    {retouchRequest && (
                      <RetouchStatusBadge status={retouchRequest.status} />
                    )}
                  </div>
                )
              })}
            </div>

            {/* Full Gallery for Reference */}
            <div className="mt-12">
              <SectionHeader
                title="Full Gallery"
                subtitle="Browse all images for reference when requesting changes"
              />
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {gallery.images.map((image, index) => {
                  const isFavorite = favorites.has(image.id)
                  const retouchRequest = image.retouchRequests[0]
                  return (
                    <div key={image.id} className="relative">
                      <ImageCard
                        image={image}
                        actionType="favorite"
                        isSelected={isFavorite}
                        onToggle={() => {}}
                        onClick={() => setLightboxIndex(index)}
                      />
                      {isFavorite && (
                        <div className="absolute right-2 top-2 rounded bg-red-500 px-2 py-1 text-xs font-semibold text-white shadow-lg">
                          ♥
                        </div>
                      )}
                      {image.isArtistPick && <ArtistPickBadge />}
                      {retouchRequest && (
                        <RetouchStatusBadge status={retouchRequest.status} />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Step 1: Select Favorites */}
            {currentStep === 'select-favorites' && (
              <>
                <SectionHeader
                  title="Select Your Favorite Images"
                  subtitle={`Click the heart icon on images you love. You've selected ${favorites.size} favorites.`}
                />

                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                  {gallery.images.map((image, index) => (
                    <div key={image.id} className="relative">
                      <ImageCard
                        image={image}
                        actionType="favorite"
                        isSelected={favorites.has(image.id)}
                        onToggle={() => toggleFavorite(image.id)}
                        onClick={() => setLightboxIndex(index)}
                      />
                      {image.isArtistPick && <ArtistPickBadge />}
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex justify-end">
                  <Button onClick={proceedToRetouchSelection} variant="primary">
                    Continue to Retouch Selection →
                  </Button>
                </div>
              </>
            )}

            {/* Step 2: Select Retouch */}
            {currentStep === 'select-retouch' && (
              <>
                <SectionHeader
                  title="Select Images for Retouching"
                  subtitle={`Choose which of your ${favorites.size} favorite images you'd like retouched. Retouching costs $${RETOUCH_PRICE} per image. You've selected ${retouchSelections.size} images for retouching.`}
                />

                {favoriteImages.length === 0 ? (
                  <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400">
                      No favorite images selected.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {favoriteImages.map((image) => {
                      const originalIndex = gallery.images.findIndex(
                        (img) => img.id === image.id
                      )
                      return (
                        <div key={image.id} className="relative">
                          <ImageCard
                            image={image}
                            actionType="retouch"
                            isSelected={retouchSelections.has(image.id)}
                            onToggle={() => toggleRetouchSelection(image.id)}
                            onClick={() => setLightboxIndex(originalIndex)}
                          />
                          {image.isArtistPick && <ArtistPickBadge />}
                        </div>
                      )
                    })}
                  </div>
                )}

                <div className="mt-8 flex justify-between">
                  <Button
                    onClick={() => setCurrentStep('select-favorites')}
                    variant="secondary"
                  >
                    ← Back to Favorites
                  </Button>
                  <Button
                    onClick={() => setCurrentStep('confirm')}
                    variant="primary"
                  >
                    Continue to Confirmation →
                  </Button>
                </div>
              </>
            )}

            {/* Step 3: Confirm */}
            {currentStep === 'confirm' && (
              <>
                <SectionHeader
                  title="Confirm Your Order"
                  subtitle="Review your selections before submitting."
                />

                {/* All Favorites with Retouch Badges */}
                <div className="mb-6">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                    Your Selections ({favoriteImages.length}{' '}
                    {favoriteImages.length === 1 ? 'image' : 'images'})
                  </h3>
                  {favoriteImages.length === 0 ? (
                    <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
                      <p className="text-gray-500 dark:text-gray-400">
                        No favorite images selected.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                      {favoriteImages.map((image) => {
                        const isRetouch = retouchSelections.has(image.id)
                        const originalIndex = gallery.images.findIndex(
                          (img) => img.id === image.id
                        )
                        return (
                          <div key={image.id} className="relative">
                            <ImageCard
                              image={image}
                              actionType="favorite"
                              isSelected={true}
                              onToggle={() => {}}
                              onClick={() => setLightboxIndex(originalIndex)}
                            />
                            {image.isArtistPick && <ArtistPickBadge />}
                            {isRetouch && (
                              <div className="absolute left-2 top-2 rounded bg-accent-800 px-2 py-1 text-xs font-semibold text-white shadow-lg dark:bg-accent-200 dark:text-accent-900">
                                Retouch
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                <CostBreakdown
                  retouchCount={retouchSelections.size}
                  pricePerRetouch={RETOUCH_PRICE}
                />

                <div className="mt-8 flex justify-between">
                  <Button
                    onClick={() => setCurrentStep('select-retouch')}
                    variant="secondary"
                  >
                    ← Back to Retouch Selection
                  </Button>
                  <Button
                    onClick={submitOrder}
                    disabled={favorites.size === 0}
                    variant="primary"
                  >
                    {favorites.size === 0
                      ? 'Select favorites to continue'
                      : retouchSelections.size === 0
                        ? 'Submit (No retouching)'
                        : `Submit Order ($${retouchSelections.size * RETOUCH_PRICE})`}
                  </Button>
                </div>
              </>
            )}
          </>
        )}
      </main>

      {/* Lightbox with Watermark */}
      {lightboxIndex !== null && (
        <Lightbox
          images={gallery.images.map((img) => ({
            url: `/api/watermarked-image/${img.id}`,
            altText: img.altText,
          }))}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
          title={gallery.title}
          unoptimized
        />
      )}

      {/* Success Modal */}
      <ConfirmationModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Order Submitted"
        message={successMessage}
        icon={
          <svg
            className="h-16 w-16 text-accent-800 dark:text-accent-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        }
      />
    </div>
  )
}
