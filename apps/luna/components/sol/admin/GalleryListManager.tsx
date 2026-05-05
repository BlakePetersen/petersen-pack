// ABOUTME: Gallery list management component with drag-drop ordering
// ABOUTME: Provides reordering, featured toggle, and dark mode support

'use client'

import { useState } from 'react'
import Link from 'next/link'
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

type Gallery = {
  id: string
  title: string
  slug: string
  featured: boolean
  status: 'DRAFT' | 'PUBLISHED'
  sortOrder: number
  _count: {
    images: number
  }
}

interface GalleryListManagerProps {
  initialGalleries: Gallery[]
}

export default function GalleryListManager({
  initialGalleries,
}: GalleryListManagerProps) {
  const router = useRouter()
  const [galleries, setGalleries] = useState<Gallery[]>(initialGalleries)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = galleries.findIndex((g) => g.id === active.id)
      const newIndex = galleries.findIndex((g) => g.id === over.id)

      const newGalleries = arrayMove(galleries, oldIndex, newIndex).map(
        (gallery, idx) => ({
          ...gallery,
          sortOrder: idx,
        })
      )

      setGalleries(newGalleries)

      // Save new order to database
      try {
        await fetch('/api/admin/galleries/reorder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            galleryOrders: newGalleries.map((g) => ({
              id: g.id,
              sortOrder: g.sortOrder,
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

  const handleToggleFeatured = async (
    galleryId: string,
    currentFeatured: boolean
  ) => {
    try {
      await fetch(`/api/admin/galleries/${galleryId}/featured`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !currentFeatured }),
      })

      setGalleries((prev) =>
        prev.map((g) =>
          g.id === galleryId ? { ...g, featured: !currentFeatured } : g
        )
      )
      router.refresh()
    } catch (error) {
      logger.error({ err: error }, 'Failed to toggle featured')
      alert('Failed to update featured status')
    }
  }

  const handleDelete = async (galleryId: string, title: string) => {
    if (
      !confirm(
        `Delete "${title}"? This will permanently remove the gallery and all its images.`
      )
    ) {
      return
    }

    try {
      const response = await fetch(`/api/admin/galleries/${galleryId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Delete failed')
      }

      setGalleries((prev) => prev.filter((g) => g.id !== galleryId))
      router.refresh()
    } catch (error) {
      logger.error({ err: error }, 'Failed to delete gallery')
      alert('Failed to delete gallery')
    }
  }

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Galleries
        </h1>
        <Link
          href="/admin/galleries/new"
          className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
        >
          Create Gallery
        </Link>
      </div>

      {galleries.length === 0 ? (
        <div className="rounded-lg bg-white p-gutter-lg text-center shadow dark:bg-gray-800">
          <p className="text-gray-500 dark:text-gray-400">
            No galleries yet. Create your first gallery to get started.
          </p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={galleries.map((g) => g.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {galleries.map((gallery) => (
                <SortableGalleryCard
                  key={gallery.id}
                  gallery={gallery}
                  onToggleFeatured={handleToggleFeatured}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </>
  )
}

function SortableGalleryCard({
  gallery,
  onToggleFeatured,
  onDelete,
}: {
  gallery: Gallery
  onToggleFeatured: (id: string, currentFeatured: boolean) => void
  onDelete: (id: string, title: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: gallery.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-lg border border-gray-200 bg-white p-gutter shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab touch-none rounded p-1 hover:bg-gray-100 active:cursor-grabbing dark:hover:bg-gray-700"
              title="Drag to reorder"
            >
              <svg
                className="h-5 w-5 text-gray-400"
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
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {gallery.title}
                </h3>
                <span
                  className={`rounded px-2 py-0.5 text-xs font-medium ${gallery.status === 'PUBLISHED' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}
                >
                  {gallery.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {gallery._count.images} images
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={() => onToggleFeatured(gallery.id, gallery.featured)}
          className={`rounded px-2 py-1 text-xs font-semibold transition-colors ${
            gallery.featured
              ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:hover:bg-yellow-800'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
          }`}
          title={gallery.featured ? 'Click to unfeature' : 'Click to feature'}
        >
          {gallery.featured ? '★ Featured' : '☆ Feature'}
        </button>
      </div>

      <div className="flex gap-2">
        <Link
          href={`/admin/galleries/${gallery.id}`}
          className="flex-1 rounded-lg bg-gray-900 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-gray-800 dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          Manage Images
        </Link>
        <Link
          href={`/portfolio/${gallery.slug}`}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          target="_blank"
        >
          View
        </Link>
        <button
          onClick={() => onDelete(gallery.id, gallery.title)}
          className="rounded-lg border border-red-200 px-3 py-2 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
          title="Delete gallery"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
