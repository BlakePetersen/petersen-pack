// ABOUTME: Login page for admin and client access
// ABOUTME: Form for email/password authentication with role-based redirects

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LoginForm from '@/components/luna/LoginForm'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; message?: string }>
}) {
  const session = await auth()
  const params = await searchParams

  // If already logged in, redirect based on role
  if (session?.user) {
    if (params.callbackUrl) {
      redirect(params.callbackUrl)
    } else if (session.user.role === 'ADMIN') {
      redirect('/admin')
    } else {
      redirect('/client-portal/dashboard')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg">
            <span className="text-2xl font-bold text-white">L</span>
          </div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Sign In</h1>
          <p className="text-gray-600">Access your account</p>
        </div>

        {params.message && (
          <div className="mb-6 rounded-lg bg-green-50 p-4 text-sm text-green-800">
            {params.message}
          </div>
        )}

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-xl">
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to website
          </Link>
        </p>
      </div>
    </div>
  )
}
