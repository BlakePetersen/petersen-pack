// ABOUTME: Client component for About section with editing capability
// ABOUTME: Uses database content and allows admin editing

'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Edit } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { EditHomepageSectionModal } from '@/components/sol'
import { EditableImage } from '@/components/sol/EditableImage'
import { ArrowLink } from '@/components/commons'

type AboutContent = {
  heading: string
  imageUrl: string
  paragraphs: string[]
  stats: Array<{ value: string; label: string }>
  linkText: string
  linkUrl: string
}

type ImageData = {
  id: string
  url: string
  altText: string | null
  width: number | null
  height: number | null
  focalX: number | null
  focalY: number | null
  cropX: number | null
  cropY: number | null
  cropWidth: number | null
  cropHeight: number | null
  cropAspectRatio: string | null
  flipHorizontal: boolean | null
  flipVertical: boolean | null
}

type AboutSectionClientProps = {
  content: AboutContent
  image?: ImageData | null
}

export function AboutSectionClient({
  content: initialContent,
  image,
}: AboutSectionClientProps) {
  const { data: session } = useSession()
  const [content, setContent] = useState(initialContent)
  const [isEditing, setIsEditing] = useState(false)

  const isAdmin = session?.user?.role === 'ADMIN'

  const handleSave = () => {
    window.location.reload()
  }

  // Use image relation if available, otherwise fall back to imageUrl in content
  const imageSource = image?.url || content.imageUrl

  // Determine aspect ratio for container
  const getContainerStyle = (): React.CSSProperties => {
    // Priority 1: Use saved aspect ratio if it exists (user's intent)
    if (image?.cropAspectRatio) {
      const ratio = image.cropAspectRatio.replace(':', ' / ')
      return { aspectRatio: ratio }
    }

    // Priority 2: Calculate from crop dimensions if available
    // cropWidth/cropHeight are relative (0-1), so we need original image dimensions
    if (
      image?.cropWidth &&
      image?.cropHeight &&
      image.cropWidth > 0 &&
      image.cropHeight > 0 &&
      image.width &&
      image.height
    ) {
      // Actual cropped dimensions = relative crop * original dimensions
      const croppedWidth = image.cropWidth * image.width
      const croppedHeight = image.cropHeight * image.height
      const ratio = croppedWidth / croppedHeight
      return { aspectRatio: `${ratio} / 1` }
    }

    // Default to 3:4
    return { aspectRatio: '3 / 4' }
  }

  return (
    <section data-section="About" className="relative px-6 py-24">
      {isAdmin && (
        <button
          onClick={() => setIsEditing(true)}
          className="absolute right-6 top-6 z-10 rounded-full border border-white/20 bg-black/30 p-2 backdrop-blur-sm transition-colors hover:border-white/40 hover:bg-black/50"
          aria-label="Edit about section"
        >
          <Edit className="h-5 w-5 text-white" />
        </button>
      )}

      <div className="mx-auto max-w-6xl">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div
            className="relative overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-800"
            style={getContainerStyle()}
          >
            {image ? (
              <EditableImage
                imageId={image.id}
                imageType="standalone"
                imageData={{
                  focalX: image.focalX,
                  focalY: image.focalY,
                  cropX: image.cropX,
                  cropY: image.cropY,
                  cropWidth: image.cropWidth,
                  cropHeight: image.cropHeight,
                  cropAspectRatio: image.cropAspectRatio,
                  flipHorizontal: image.flipHorizontal,
                  flipVertical: image.flipVertical,
                }}
                displayAspectRatio={
                  image.cropAspectRatio?.replace(':', ' / ') || undefined
                }
                src={image.url}
                alt={image.altText || content.heading}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            ) : imageSource ? (
              <Image
                src={imageSource}
                alt={content.heading}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            ) : null}
          </div>
          <div>
            <h2 className="mb-6 font-serif text-5xl text-gray-900 dark:text-white md:text-6xl">
              {content.heading}
            </h2>
            <div className="space-y-4 leading-relaxed text-gray-600 dark:text-gray-300">
              {content.paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
            <div className="mt-8 grid grid-cols-3 gap-8">
              {content.stats.map((stat, index) => (
                <div key={index}>
                  <p className="font-serif text-4xl text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                  <p className="text-sm uppercase tracking-wider text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <ArrowLink href={content.linkUrl}>{content.linkText}</ArrowLink>
            </div>
          </div>
        </div>
      </div>

      {isEditing && (
        <EditHomepageSectionModal
          section="about"
          content={content}
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          onSave={handleSave}
        />
      )}
    </section>
  )
}
