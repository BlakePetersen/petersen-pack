// ABOUTME: Client account registration page
// ABOUTME: Allows new clients to create accounts to access their galleries

import { Metadata } from 'next'
import GlobalFooter from '@/components/commons/GlobalFooter'
import { Container } from '@/components/commons'
import ClientSignupForm from '@/components/sol/ClientSignupForm'

export const metadata: Metadata = {
  title: 'Create Account | Client Portal',
  description: 'Create your client account to access your photo galleries.',
}

export default function ClientSignupPage() {
  return (
    <>
      <main className="min-h-screen pt-20">
        <Container className="py-16">
          <div className="mx-auto max-w-md">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Create Your Account
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Get access to your private photo galleries
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-soft dark:border-gray-700 dark:bg-gray-800">
              <ClientSignupForm />
            </div>

            <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <a
                href="/login?callbackUrl=/client-portal/dashboard"
                className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                Sign in
              </a>
            </p>
          </div>
        </Container>
      </main>
      <GlobalFooter />
    </>
  )
}
