// ABOUTME: Sortable package list component with drag-drop ordering
// ABOUTME: Used within CategoryCard to allow reordering packages

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
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

type Package = {
  id: string
  name: string
  price: number
  duration: string
  isPopular: boolean
  isActive: boolean
  features: string[]
  sortOrder: number
}

interface PackageListManagerProps {
  categoryId: string
  initialPackages: Package[]
}

export default function PackageListManager({
  categoryId,
  initialPackages,
}: PackageListManagerProps) {
  const router = useRouter()
  const [packages, setPackages] = useState<Package[]>(initialPackages)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = packages.findIndex((p) => p.id === active.id)
      const newIndex = packages.findIndex((p) => p.id === over.id)

      const newPackages = arrayMove(packages, oldIndex, newIndex).map(
        (pkg, idx) => ({
          ...pkg,
          sortOrder: idx,
        })
      )

      setPackages(newPackages)

      // Save new order to database
      try {
        await fetch('/api/admin/pricing/packages/reorder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            packageOrders: newPackages.map((p) => ({
              id: p.id,
              sortOrder: p.sortOrder,
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

  if (packages.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        No packages in this category yet.
      </p>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={packages.map((p) => p.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {packages.map((pkg) => (
            <SortablePackageRow key={pkg.id} pkg={pkg} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}

function SortablePackageRow({ pkg }: { pkg: Package }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: pkg.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700"
    >
      <div className="flex items-center gap-3">
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
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h5 className="font-medium text-gray-900 dark:text-white">
              {pkg.name}
            </h5>
            {pkg.isPopular && (
              <span className="rounded bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                Popular
              </span>
            )}
            {!pkg.isActive && (
              <span className="rounded bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                Inactive
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span className="font-semibold text-gray-900 dark:text-white">
              ${pkg.price.toLocaleString()}
            </span>
            <span>{pkg.duration}</span>
            <span>{pkg.features.length} features</span>
          </div>
        </div>
      </div>
      <Link
        href={`/admin/pricing/packages/${pkg.id}/edit`}
        className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
      >
        Edit
      </Link>
    </div>
  )
}
