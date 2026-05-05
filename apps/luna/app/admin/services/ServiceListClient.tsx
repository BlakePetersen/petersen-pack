// ABOUTME: Client component for service list with drag-drop reordering
// ABOUTME: Handles CRUD operations and sorting for services

'use client'

import { useState } from 'react'
import Link from 'next/link'
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
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2, ExternalLink } from 'lucide-react'

interface Service {
  id: string
  name: string
  slug: string
  description: string
  heroImage: string | null
  isActive: boolean
  sortOrder: number
  _count: {
    pricingCategories: number
    processSteps: number
    infoCards: number
    faqs: number
  }
}

interface ServiceListClientProps {
  initialServices: Service[]
}

export function ServiceListClient({ initialServices }: ServiceListClientProps) {
  const router = useRouter()
  const [services, setServices] = useState<Service[]>(initialServices)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = services.findIndex((s) => s.id === active.id)
      const newIndex = services.findIndex((s) => s.id === over.id)

      const newServices = arrayMove(services, oldIndex, newIndex).map(
        (svc, idx) => ({
          ...svc,
          sortOrder: idx,
        })
      )

      setServices(newServices)

      try {
        await fetch('/api/admin/services/reorder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            serviceOrders: newServices.map((s) => ({
              id: s.id,
              sortOrder: s.sortOrder,
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

  const handleToggleActive = async (id: string, currentState: boolean) => {
    try {
      const service = services.find((s) => s.id === id)
      if (!service) return

      const res = await fetch(`/api/admin/services/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: service.name,
          slug: service.slug,
          description: service.description,
          heroImage: service.heroImage,
          isActive: !currentState,
          sortOrder: service.sortOrder,
        }),
      })

      if (res.ok) {
        setServices((prev) =>
          prev.map((s) => (s.id === id ? { ...s, isActive: !currentState } : s))
        )
        router.refresh()
      }
    } catch (error) {
      logger.error({ err: error }, 'Error toggling service')
      alert('Failed to toggle service status')
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${name}"? This will also delete all associated pricing categories and packages.`
      )
    ) {
      return
    }

    try {
      const res = await fetch(`/api/admin/services/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setServices((prev) => prev.filter((s) => s.id !== id))
        router.refresh()
      }
    } catch (error) {
      logger.error({ err: error }, 'Error deleting service')
      alert('Failed to delete service')
    }
  }

  if (services.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
        <p className="text-gray-600 dark:text-gray-400">No services yet</p>
        <Link
          href="/admin/services/new"
          className="mt-4 inline-block text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          Create your first service
        </Link>
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={services.map((s) => s.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-4">
          {services.map((service) => (
            <SortableServiceRow
              key={service.id}
              service={service}
              onToggleActive={handleToggleActive}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}

function SortableServiceRow({
  service,
  onToggleActive,
  onDelete,
}: {
  service: Service
  onToggleActive: (id: string, currentState: boolean) => void
  onDelete: (id: string, name: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: service.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
    >
      <div className="flex items-start gap-4">
        <button
          {...attributes}
          {...listeners}
          className="mt-1 cursor-grab touch-none rounded p-1 hover:bg-gray-100 active:cursor-grabbing dark:hover:bg-gray-700"
          title="Drag to reorder"
        >
          <GripVertical className="h-5 w-5 text-gray-400" />
        </button>

        {service.heroImage && (
          <div className="relative h-20 w-32 flex-shrink-0 overflow-hidden rounded-lg">
            <Image
              src={service.heroImage}
              alt={service.name}
              fill
              className="object-cover"
              sizes="128px"
            />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {service.name}
            </h3>
            {!service.isActive && (
              <span className="rounded bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                Inactive
              </span>
            )}
          </div>

          <p className="mb-3 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
            {service.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span>{service._count.pricingCategories} pricing categories</span>
            <span>{service._count.processSteps} process steps</span>
            <span>{service._count.infoCards} info cards</span>
            <span>{service._count.faqs} FAQs</span>
          </div>
        </div>

        <div className="flex flex-shrink-0 items-center gap-2">
          <Link
            href={`/services/${service.slug}`}
            target="_blank"
            className="rounded-lg border border-gray-300 p-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            title="View public page"
          >
            <ExternalLink className="h-4 w-4" />
          </Link>
          <button
            onClick={() => onToggleActive(service.id, service.isActive)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              service.isActive
                ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            {service.isActive ? 'Active' : 'Inactive'}
          </button>
          <Link
            href={`/admin/services/${service.id}`}
            className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Edit
          </Link>
          <button
            onClick={() => onDelete(service.id, service.name)}
            className="rounded-lg border border-red-300 p-2 text-red-600 hover:bg-red-50 dark:border-red-600 dark:hover:bg-red-900/20"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
