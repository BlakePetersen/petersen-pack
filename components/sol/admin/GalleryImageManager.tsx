// ABOUTME: Gallery image management component with advanced features
// ABOUTME: Provides drag-drop reordering, inline editing, and bulk actions

'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { logger } from '@/lib/logger.edge'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

type GalleryImage = {
  id: string
  url: string
  altText: string | null
  sortOrder: number
}

type Gallery = {
  id: string
  title: string
  images: GalleryImage[]
}

interface GalleryImageManagerProps {
  gallery: Gallery
}

export default function GalleryImageManager({
  gallery,
}: GalleryImageManagerProps) {
  const router = useRouter()
  const [images, setImages] = useState<GalleryImage[]>(gallery.images)
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set())
  const [editingImageId, setEditingImageId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<{ altText: string }>({
    altText: '',
  })
  const [isSaving, setIsSaving] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex((img) => img.id === active.id)
      const newIndex = images.findIndex((img) => img.id === over.id)

      const newImages = arrayMove(images, oldIndex, newIndex).map(
        (img, idx) => ({
          ...img,
          sortOrder: idx,
        })
      )

      setImages(newImages)

      // Save new order to database
      try {
        await fetch(`/api/admin/galleries/${gallery.id}/reorder`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageOrders: newImages.map((img) => ({
              id: img.id,
              sortOrder: img.sortOrder,
            })),
          }),
        })
        router.refresh()
      } catch (error) {
        logger.error({ err: error }, 'Failed to save order')
        alert('Failed to save order')
      }
    }
  }

  const handleSelectImage = (imageId: string) => {
    const newSelected = new Set(selectedImages)
    if (newSelected.has(imageId)) {
      newSelected.delete(imageId)
    } else {
      newSelected.add(imageId)
    }
    setSelectedImages(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedImages.size === images.length) {
      setSelectedImages(new Set())
    } else {
      setSelectedImages(new Set(images.map((img) => img.id)))
    }
  }

  const handleStartEdit = (image: GalleryImage) => {
    setEditingImageId(image.id)
    setEditValues({
      altText: image.altText || '',
    })
  }

  const handleSaveEdit = async (imageId: string) => {
    setIsSaving(true)
    try {
      await fetch(`/api/admin/images/${imageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editValues),
      })

      setImages((prev) =>
        prev.map((img) =>
          img.id === imageId ? { ...img, altText: editValues.altText } : img
        )
      )

      setEditingImageId(null)
      router.refresh()
    } catch (error) {
      logger.error({ err: error }, 'Failed to save')
      alert('Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingImageId(null)
    setEditValues({ altText: '' })
  }

  const handleBulkDelete = async () => {
    if (selectedImages.size === 0) return

    if (!confirm(`Delete ${selectedImages.size} image(s)?`)) return

    try {
      await fetch(`/api/admin/images/bulk-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageIds: Array.from(selectedImages) }),
      })

      setImages((prev) => prev.filter((img) => !selectedImages.has(img.id)))
      setSelectedImages(new Set())
      router.refresh()
    } catch (error) {
      logger.error({ err: error }, 'Failed to delete')
      alert('Failed to delete images')
    }
  }

  const handleBulkDownload = async () => {
    if (selectedImages.size === 0) return

    const selectedImageUrls = images
      .filter((img) => selectedImages.has(img.id))
      .map((img) => img.url)

    for (const url of selectedImageUrls) {
      const link = document.createElement('a')
      link.href = url
      link.download = url.split('/').pop() || 'image.jpg'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  }

  return (
    <div className="space-y-6">
      {/* Bulk Actions */}
      {images.length > 0 && (
        <div className="flex items-center justify-between rounded-lg bg-white p-4 shadow">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={
                  selectedImages.size === images.length && images.length > 0
                }
                onChange={handleSelectAll}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                {selectedImages.size > 0
                  ? `${selectedImages.size} selected`
                  : 'Select all'}
              </span>
            </label>
          </div>

          {selectedImages.size > 0 && (
            <div className="flex gap-2">
              <button
                onClick={handleBulkDownload}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Download ({selectedImages.size})
              </button>
              <button
                onClick={handleBulkDelete}
                className="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-700 hover:bg-red-50"
              >
                Delete ({selectedImages.size})
              </button>
            </div>
          )}
        </div>
      )}

      {/* Images Grid */}
      {images.length === 0 ? (
        <div className="rounded-lg bg-white p-12 text-center shadow">
          <p className="text-gray-500">No images in this gallery yet.</p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={images.map((img) => img.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {images.map((image) => (
                <SortableImageCard
                  key={image.id}
                  image={image}
                  isSelected={selectedImages.has(image.id)}
                  isEditing={editingImageId === image.id}
                  editValues={editValues}
                  onSelect={handleSelectImage}
                  onStartEdit={handleStartEdit}
                  onSaveEdit={handleSaveEdit}
                  onCancelEdit={handleCancelEdit}
                  onEditValuesChange={setEditValues}
                  isSaving={isSaving}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}

interface SortableImageCardProps {
  image: GalleryImage
  isSelected: boolean
  isEditing: boolean
  editValues: { altText: string }
  onSelect: (id: string) => void
  onStartEdit: (image: GalleryImage) => void
  onSaveEdit: (id: string) => void
  onCancelEdit: () => void
  onEditValuesChange: (values: { altText: string }) => void
  isSaving: boolean
}

function SortableImageCard({
  image,
  isSelected,
  isEditing,
  editValues,
  onSelect,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onEditValuesChange,
  isSaving,
}: SortableImageCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: image.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`overflow-hidden rounded-lg bg-white shadow transition-shadow ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      } ${isDragging ? 'z-50' : ''}`}
    >
      {/* Image */}
      <div className="relative aspect-square">
        <Image
          src={image.url}
          alt={image.altText || 'Gallery image'}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />

        {/* Checkbox */}
        <div className="absolute left-2 top-2">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(image.id)}
            className="h-5 w-5 rounded border-gray-300 bg-white/90 text-blue-600 focus:ring-blue-500"
          />
        </div>

        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="absolute right-2 top-2 cursor-grab rounded bg-white/90 p-1.5 shadow active:cursor-grabbing"
        >
          <svg
            className="h-4 w-4 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8h16M4 16h16"
            />
          </svg>
        </div>
      </div>

      {/* Edit Form or Display */}
      <div className="p-3">
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editValues.altText}
              onChange={(e) => onEditValuesChange({ altText: e.target.value })}
              placeholder="Alt text"
              rows={3}
              className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
            />
            <div className="flex gap-2">
              <button
                onClick={() => onSaveEdit(image.id)}
                disabled={isSaving}
                className="flex-1 rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={onCancelEdit}
                disabled={isSaving}
                className="flex-1 rounded border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="mb-2 text-xs text-gray-600">
              {image.altText || 'No alt text'}
            </p>
            <button
              onClick={() => onStartEdit(image)}
              className="w-full rounded border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
            >
              Edit Alt Text
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
