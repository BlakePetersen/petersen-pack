// ABOUTME: Client portal landing page
// ABOUTME: Redirects to dashboard if logged in, shows login/signup options if not

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import GlobalFooter from '@/components/commons/GlobalFooter'
import { Container, ButtonLink } from '@/components/commons'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Client Portal | Ashley Petersen Photography',
  description:
    'Access your private photo galleries, view and download your images.',
}

export default async function ClientPortalPage() {
  const session = await auth()

  // If logged in as client or admin, redirect to dashboard
  if (session?.user) {
    if (session.user.role === 'ADMIN') {
      redirect('/admin')
    } else {
      redirect('/client-portal/dashboard')
    }
  }

  return (
    <>
      <main className="min-h-screen pt-20">
        <Container className="py-16">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white md:text-5xl">
              Client Portal
            </h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Access your private photo galleries and download your images
            </p>

            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {/* Existing Clients */}
              <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-soft dark:border-gray-700 dark:bg-gray-800">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                  <svg
                    className="h-8 w-8 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                  Existing Clients
                </h2>
                <p className="mb-6 text-gray-600 dark:text-gray-400">
                  Sign in to access your galleries and photos
                </p>
                <ButtonLink
                  href="/login?callbackUrl=/client-portal/dashboard"
                  variant="primary"
                  className="w-full"
                >
                  Sign In
                </ButtonLink>
              </div>

              {/* New Clients */}
              <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-soft dark:border-gray-700 dark:bg-gray-800">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                  <svg
                    className="h-8 w-8 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                </div>
                <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                  New Clients
                </h2>
                <p className="mb-6 text-gray-600 dark:text-gray-400">
                  Create an account to access your photo galleries
                </p>
                <ButtonLink
                  href="/client-portal/signup"
                  variant="secondary"
                  className="w-full"
                >
                  Create Account
                </ButtonLink>
              </div>
            </div>

            <div className="mt-12 rounded-xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-950">
              <h3 className="mb-2 font-semibold text-blue-900 dark:text-blue-100">
                What&apos;s included in your client portal?
              </h3>
              <ul className="space-y-2 text-left text-blue-800 dark:text-blue-200">
                <li className="flex items-start gap-2">
                  <svg
                    className="mt-0.5 h-5 w-5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>
                    Access all your private photo galleries in one place
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <svg
                    className="mt-0.5 h-5 w-5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>View and download high-resolution images</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg
                    className="mt-0.5 h-5 w-5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Mark your favorite photos</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg
                    className="mt-0.5 h-5 w-5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Share galleries with family and friends</span>
                </li>
              </ul>
            </div>
          </div>
        </Container>
      </main>
      <GlobalFooter />
    </>
  )
}
