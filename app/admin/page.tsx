// ABOUTME: Admin dashboard homepage
// ABOUTME: Overview of galleries, recent uploads, and quick stats

import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function AdminDashboard() {
  const [galleryCount, imageCount, inquiryCount, bookingCount] =
    await Promise.all([
      prisma.gallery.count(),
      prisma.image.count(),
      prisma.inquiry.count({ where: { status: 'NEW' } }),
      prisma.booking.count({ where: { status: 'PENDING' } }),
    ])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome back! Here&apos;s what&apos;s happening with your photography
          business.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Galleries"
          value={galleryCount}
          href="/admin/galleries"
          icon={
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          }
          color="blue"
        />
        <StatCard
          title="Total Images"
          value={imageCount}
          href="/admin/galleries"
          icon={
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          }
          color="purple"
        />
        <StatCard
          title="New Inquiries"
          value={inquiryCount}
          href="/admin/inquiries"
          icon={
            <svg
              className="h-6 w-6"
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
          }
          color="green"
        />
        <StatCard
          title="Pending Bookings"
          value={bookingCount}
          href="/admin/bookings"
          icon={
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          }
          color="purple"
        />
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
          Quick Actions
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <ActionCard
            href="/admin/availability"
            icon={
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            }
            title="Availability"
            description="Manage booking calendar"
          />
          <ActionCard
            href="/admin/bookings"
            icon={
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            }
            title="Bookings"
            description="Review booking requests"
          />
          <ActionCard
            href="/admin/upload"
            icon={
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            }
            title="Upload Images"
            description="Add photos to galleries"
          />
          <ActionCard
            href="/admin/galleries"
            icon={
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            }
            title="Manage Galleries"
            description="Edit portfolio galleries"
          />
          <ActionCard
            href="/admin/clients"
            icon={
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            }
            title="Client Galleries"
            description="Private photo delivery"
          />
          <ActionCard
            href="/admin/pricing"
            icon={
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
            title="Pricing"
            description="Manage packages and rates"
          />
        </div>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  href,
  icon,
  color,
}: {
  title: string
  value: number
  href: string
  icon: React.ReactNode
  color: string
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-200',
    purple:
      'bg-purple-50 text-purple-600 dark:bg-purple-900 dark:text-purple-200',
    green: 'bg-green-50 text-green-600 dark:bg-green-900 dark:text-green-200',
    yellow:
      'bg-yellow-50 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-200',
  }

  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-lg border border-gray-200 bg-white p-6 shadow-soft transition-all hover:border-gray-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600"
    >
      <div className="flex items-center">
        <div
          className={`rounded-lg p-3 ${colorClasses[color as keyof typeof colorClasses]}`}
        >
          {icon}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-4xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
        </div>
      </div>
    </Link>
  )
}

function ActionCard({
  href,
  icon,
  title,
  description,
}: {
  href: string
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <Link
      href={href}
      prefetch={false}
      className="dark:hover:bg-gray-750 group relative z-10 block cursor-pointer rounded-lg border-2 border-gray-200 bg-gray-50 p-6 transition-all hover:border-blue-500 hover:bg-white hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-500"
      style={{ pointerEvents: 'auto' }}
    >
      <div className="mb-3 text-gray-600 transition-colors group-hover:text-blue-600 dark:text-gray-400 dark:group-hover:text-blue-400">
        {icon}
      </div>
      <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </Link>
  )
}
