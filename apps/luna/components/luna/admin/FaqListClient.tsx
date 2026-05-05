// ABOUTME: Client component for FAQ list with inline editing and drag-to-reorder
// ABOUTME: Handles filtering, searching, and inline CRUD operations on FAQs

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { logger } from '@/lib/logger.edge'
import {
  Search,
  Eye,
  Copy,
  Trash2,
  ChevronDown,
  ChevronUp,
  GripVertical,
} from 'lucide-react'
import { RichTextEditor } from './RichTextEditor'
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

interface Service {
  id: string
  name: string
  slug: string
}

interface Faq {
  id: string
  question: string
  answer: any
  category: string
  serviceId: string | null
  sortOrder: number
  isActive: boolean
  viewCount: number
  createdAt: Date
  updatedAt: Date
  service: Service | null
}

interface FaqListClientProps {
  initialFaqs: Faq[]
  services: Service[]
}

const categories = [
  { value: 'ALL', label: 'All Categories' },
  { value: 'GENERAL', label: 'General' },
  { value: 'BOOKING', label: 'Booking' },
  { value: 'PRICING', label: 'Pricing' },
  { value: 'PROCESS', label: 'Process' },
  { value: 'POLICIES', label: 'Policies' },
]

const editCategories = [
  { value: 'GENERAL', label: 'General' },
  { value: 'BOOKING', label: 'Booking' },
  { value: 'PRICING', label: 'Pricing' },
  { value: 'PROCESS', label: 'Process' },
  { value: 'POLICIES', label: 'Policies' },
]

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
]

interface SortableFaqItemProps {
  faq: Faq
  isExpanded: boolean
  data: any
  isSaving: boolean
  services: Service[]
  onToggleExpanded: () => void
  onUpdateEditData: (field: string, value: any) => void
  onSave: () => void
  onToggleActive: () => void
  onDuplicate: () => void
  onDelete: () => void
  isDragging?: boolean
}

function SortableFaqItem({
  faq,
  isExpanded,
  data,
  isSaving,
  services,
  onToggleExpanded,
  onUpdateEditData,
  onSave,
  onToggleActive,
  onDuplicate,
  onDelete,
}: SortableFaqItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: faq.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
    >
      {/* Header row */}
      <div className="flex items-start gap-2 p-6">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="mt-1 cursor-grab rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 active:cursor-grabbing dark:hover:bg-gray-700 dark:hover:text-gray-300"
          title="Drag to reorder"
        >
          <GripVertical className="h-5 w-5" />
        </button>

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {faq.question}
            </h3>
            <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
              {faq.category}
            </span>
            <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
              {faq.service ? faq.service.name : 'General'}
            </span>
            {!faq.isActive && (
              <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-600 dark:bg-red-900/20 dark:text-red-400">
                Inactive
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {faq.viewCount} views
            </span>
          </div>
        </div>

        <div className="flex flex-shrink-0 items-center gap-2">
          <button
            onClick={onToggleActive}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              faq.isActive
                ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            {faq.isActive ? 'Active' : 'Inactive'}
          </button>
          <button
            onClick={onDuplicate}
            className="rounded-lg border border-gray-300 p-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            title="Duplicate"
          >
            <Copy className="h-4 w-4" />
          </button>
          <button
            onClick={onToggleExpanded}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Edit
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={onDelete}
            className="rounded-lg border border-red-300 p-2 text-red-600 hover:bg-red-50 dark:border-red-600 dark:hover:bg-red-900/20"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Expanded edit form */}
      {isExpanded && data && (
        <div className="border-t border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-900">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Question
              </label>
              <input
                type="text"
                value={data.question}
                onChange={(e) => onUpdateEditData('question', e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Answer
              </label>
              <RichTextEditor
                content={data.answer}
                onChange={(json) => onUpdateEditData('answer', json)}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Category
                </label>
                <select
                  value={data.category}
                  onChange={(e) => onUpdateEditData('category', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
                >
                  {editCategories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Service
                </label>
                <select
                  value={data.serviceId}
                  onChange={(e) =>
                    onUpdateEditData('serviceId', e.target.value)
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
                >
                  <option value="null">General FAQ</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status
                </label>
                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={data.isActive}
                    onChange={(e) =>
                      onUpdateEditData('isActive', e.target.checked)
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Active
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onToggleExpanded}
                className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onSave}
                className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function FaqListClient({ initialFaqs, services }: FaqListClientProps) {
  const router = useRouter()
  const [faqs, setFaqs] = useState(initialFaqs)
  const [search, setSearch] = useState('')
  const [serviceFilter, setServiceFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [editData, setEditData] = useState<Record<string, any>>({})
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set())

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const isFiltered =
    search !== '' ||
    serviceFilter !== 'all' ||
    categoryFilter !== 'ALL' ||
    statusFilter !== 'all'

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch = search
      ? faq.question.toLowerCase().includes(search.toLowerCase())
      : true

    const matchesService =
      serviceFilter === 'all'
        ? true
        : serviceFilter === 'general'
          ? faq.serviceId === null
          : faq.serviceId === serviceFilter

    const matchesCategory =
      categoryFilter === 'ALL' ? true : faq.category === categoryFilter

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'true'
          ? faq.isActive
          : !faq.isActive

    return matchesSearch && matchesService && matchesCategory && matchesStatus
  })

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) return

    const oldIndex = faqs.findIndex((f) => f.id === active.id)
    const newIndex = faqs.findIndex((f) => f.id === over.id)

    const newFaqs = arrayMove(faqs, oldIndex, newIndex)
    setFaqs(newFaqs)

    // Update sort orders on the backend
    const updates = newFaqs.map((faq, index) => ({
      id: faq.id,
      sortOrder: index,
    }))

    try {
      await fetch('/api/admin/faqs/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      })
      router.refresh()
    } catch (error) {
      logger.error({ err: error }, 'Error reordering FAQs')
      // Revert on error
      setFaqs(faqs)
    }
  }

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
        setEditData((prev) => {
          const next = { ...prev }
          delete next[id]
          return next
        })
      } else {
        next.add(id)
        const faq = faqs.find((f) => f.id === id)
        if (faq) {
          setEditData((prev) => ({
            ...prev,
            [id]: {
              question: faq.question,
              answer: faq.answer
                ? JSON.stringify(faq.answer)
                : JSON.stringify({ type: 'doc', content: [] }),
              category: faq.category,
              serviceId: faq.serviceId || 'null',
              isActive: faq.isActive,
            },
          }))
        }
      }
      return next
    })
  }

  const updateEditData = (id: string, field: string, value: any) => {
    setEditData((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }))
  }

  const handleSave = async (id: string) => {
    const data = editData[id]
    if (!data) return

    setSavingIds((prev) => new Set(prev).add(id))

    try {
      const payload = {
        question: data.question.trim(),
        answer: data.answer,
        category: data.category,
        serviceId: data.serviceId === 'null' ? null : data.serviceId,
        isActive: data.isActive,
      }

      const res = await fetch(`/api/admin/faqs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        const updated = await res.json()
        setFaqs((prev) => prev.map((f) => (f.id === id ? updated : f)))
        toggleExpanded(id)
        router.refresh()
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to save FAQ')
      }
    } catch (error) {
      logger.error({ err: error }, 'Error saving FAQ')
      alert('Failed to save FAQ')
    } finally {
      setSavingIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  const handleToggleActive = async (id: string, currentState: boolean) => {
    try {
      const res = await fetch(`/api/admin/faqs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isActive: !currentState,
        }),
      })

      if (res.ok) {
        const updated = await res.json()
        setFaqs((prev) => prev.map((f) => (f.id === id ? updated : f)))
        router.refresh()
      }
    } catch (error) {
      logger.error({ err: error }, 'Error toggling FAQ')
      alert('Failed to toggle FAQ status')
    }
  }

  const handleDuplicate = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/faqs/${id}/duplicate`, {
        method: 'POST',
      })

      if (res.ok) {
        router.refresh()
        window.location.reload()
      }
    } catch (error) {
      logger.error({ err: error }, 'Error duplicating FAQ')
      alert('Failed to duplicate FAQ')
    }
  }

  const handleDelete = async (id: string, question: string) => {
    if (!confirm(`Are you sure you want to delete "${question}"?`)) {
      return
    }

    try {
      const res = await fetch(`/api/admin/faqs/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setFaqs((prev) => prev.filter((f) => f.id !== id))
        router.refresh()
      }
    } catch (error) {
      logger.error({ err: error }, 'Error deleting FAQ')
      alert('Failed to delete FAQ')
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
          />
        </div>

        <select
          value={serviceFilter}
          onChange={(e) => setServiceFilter(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
        >
          <option value="all">All Services</option>
          <option value="general">General FAQ</option>
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name}
            </option>
          ))}
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
        >
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
        >
          {statusOptions.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>

      {isFiltered && (
        <p className="text-sm text-amber-600 dark:text-amber-400">
          Drag to reorder is disabled while filters are active
        </p>
      )}

      {/* FAQ List */}
      {filteredFaqs.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">
            {isFiltered ? 'No FAQs match your filters' : 'No FAQs yet'}
          </p>
          {!isFiltered && (
            <Link
              href="/admin/faqs/new"
              className="mt-4 inline-block text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              Create your first FAQ
            </Link>
          )}
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={isFiltered ? undefined : handleDragEnd}
        >
          <SortableContext
            items={filteredFaqs.map((f) => f.id)}
            strategy={verticalListSortingStrategy}
            disabled={isFiltered}
          >
            <div className="grid gap-4">
              {filteredFaqs.map((faq) => (
                <SortableFaqItem
                  key={faq.id}
                  faq={faq}
                  isExpanded={expandedIds.has(faq.id)}
                  data={editData[faq.id]}
                  isSaving={savingIds.has(faq.id)}
                  services={services}
                  onToggleExpanded={() => toggleExpanded(faq.id)}
                  onUpdateEditData={(field, value) =>
                    updateEditData(faq.id, field, value)
                  }
                  onSave={() => handleSave(faq.id)}
                  onToggleActive={() =>
                    handleToggleActive(faq.id, faq.isActive)
                  }
                  onDuplicate={() => handleDuplicate(faq.id)}
                  onDelete={() => handleDelete(faq.id, faq.question)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}
