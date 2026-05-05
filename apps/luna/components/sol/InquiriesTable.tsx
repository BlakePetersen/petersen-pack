// ABOUTME: Table component for displaying and managing inquiries
// ABOUTME: Includes filtering by status and inline status updates

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'

type Inquiry = {
  id: string
  name: string
  email: string
  phone: string | null
  serviceType: string
  message: string
  status: 'NEW' | 'CONTACTED' | 'CONVERTED' | 'CLOSED'
  createdAt: Date
}

type Props = {
  inquiries: Inquiry[]
}

const statusColors = {
  NEW: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  CONTACTED:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  CONVERTED:
    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  CLOSED: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
}

const statusLabels = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  CONVERTED: 'Converted',
  CLOSED: 'Closed',
}

export default function InquiriesTable({ inquiries }: Props) {
  const router = useRouter()
  const [filter, setFilter] = useState<string>('ALL')
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)

  const filteredInquiries = inquiries.filter((inquiry) => {
    if (filter === 'ALL') return true
    return inquiry.status === filter
  })

  const handleStatusUpdate = async (inquiryId: string, newStatus: string) => {
    setUpdatingStatus(inquiryId)
    try {
      const response = await fetch(`/api/admin/inquiries/${inquiryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        router.refresh()
      } else {
        alert('Failed to update status')
      }
    } catch (error) {
      alert('Failed to update status')
    } finally {
      setUpdatingStatus(null)
    }
  }

  const statusCounts = {
    ALL: inquiries.length,
    NEW: inquiries.filter((i) => i.status === 'NEW').length,
    CONTACTED: inquiries.filter((i) => i.status === 'CONTACTED').length,
    CONVERTED: inquiries.filter((i) => i.status === 'CONVERTED').length,
    CLOSED: inquiries.filter((i) => i.status === 'CLOSED').length,
  }

  return (
    <div>
      {/* Filter Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav
          className="-mb-px flex space-x-8"
          role="tablist"
          aria-label="Filter inquiries by status"
        >
          {['ALL', 'NEW', 'CONTACTED', 'CONVERTED', 'CLOSED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              role="tab"
              aria-selected={filter === status}
              aria-controls="inquiries-panel"
              className={`whitespace-nowrap border-b-2 px-1 pb-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900 ${
                filter === status
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300'
              }`}
            >
              {status === 'ALL'
                ? 'All'
                : statusLabels[status as keyof typeof statusLabels]}
              <span className="ml-2 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs dark:bg-gray-700 dark:text-gray-300">
                {statusCounts[status as keyof typeof statusCounts]}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Table */}
      <div id="inquiries-panel" role="tabpanel">
        {filteredInquiries.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center dark:border-gray-600">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              No inquiries
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {filter === 'ALL'
                ? 'No inquiries have been submitted yet.'
                : `No ${filter.toLowerCase()} inquiries.`}
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-800">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <caption className="sr-only">Customer inquiries</caption>
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                  >
                    Contact
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                  >
                    Service
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                {filteredInquiries.map((inquiry) => (
                  <tr
                    key={inquiry.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {inquiry.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {inquiry.email}
                      </div>
                      {inquiry.phone && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {inquiry.phone}
                        </div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {inquiry.serviceType}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <select
                        value={inquiry.status}
                        onChange={(e) =>
                          handleStatusUpdate(inquiry.id, e.target.value)
                        }
                        disabled={updatingStatus === inquiry.id}
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColors[inquiry.status]} border-0 focus:ring-2 focus:ring-blue-500 disabled:opacity-50`}
                        aria-label={`Update status for inquiry from ${inquiry.name}`}
                      >
                        <option value="NEW">New</option>
                        <option value="CONTACTED">Contacted</option>
                        <option value="CONVERTED">Converted</option>
                        <option value="CLOSED">Closed</option>
                      </select>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {format(new Date(inquiry.createdAt), 'MMM d, yyyy')}
                      <div className="text-xs text-gray-400 dark:text-gray-500">
                        {format(new Date(inquiry.createdAt), 'h:mm a')}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <button
                        onClick={() => setSelectedInquiry(inquiry)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedInquiry && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="inquiry-modal-title"
        >
          <div className="flex min-h-screen items-center justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity dark:bg-gray-900 dark:bg-opacity-80"
              onClick={() => setSelectedInquiry(null)}
            ></div>

            <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all dark:bg-gray-800 sm:my-8 sm:w-full sm:max-w-2xl sm:align-middle">
              <div className="bg-white px-6 pb-4 pt-5 dark:bg-gray-800">
                <div className="flex items-start justify-between">
                  <div>
                    <h3
                      id="inquiry-modal-title"
                      className="text-lg font-semibold text-gray-900 dark:text-white"
                    >
                      Inquiry Details
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Submitted{' '}
                      {format(
                        new Date(selectedInquiry.createdAt),
                        'MMMM d, yyyy'
                      )}{' '}
                      at {format(new Date(selectedInquiry.createdAt), 'h:mm a')}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedInquiry(null)}
                    className="rounded text-gray-400 hover:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:text-gray-500 dark:hover:text-gray-400 dark:focus-visible:ring-offset-gray-800"
                    aria-label="Close dialog"
                  >
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="mt-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Name
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {selectedInquiry.name}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email
                      </label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                        <a
                          href={`mailto:${selectedInquiry.email}`}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          {selectedInquiry.email}
                        </a>
                      </p>
                    </div>
                    {selectedInquiry.phone && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Phone
                        </label>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">
                          <a
                            href={`tel:${selectedInquiry.phone}`}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            {selectedInquiry.phone}
                          </a>
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Service Type
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {selectedInquiry.serviceType}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Message
                    </label>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-gray-900 dark:text-white">
                      {selectedInquiry.message}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Status
                    </label>
                    <div className="mt-1">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusColors[selectedInquiry.status]}`}
                      >
                        {statusLabels[selectedInquiry.status]}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-4 dark:bg-gray-700">
                <button
                  onClick={() => setSelectedInquiry(null)}
                  className="w-full rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
