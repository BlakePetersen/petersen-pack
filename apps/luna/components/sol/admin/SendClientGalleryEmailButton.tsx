// ABOUTME: Button to send client gallery access email notification
// ABOUTME: Allows admin to manually notify clients about their gallery

'use client'

import { useState } from 'react'
import { logger } from '@/lib/logger.edge'

interface SendClientGalleryEmailButtonProps {
  galleryId: string
  clientName: string
  clientEmail: string
  galleryTitle: string
  gallerySlug: string
  password: string | null
  expiresAt: Date | null
  imageCount: number
}

export default function SendClientGalleryEmailButton({
  galleryId,
  clientName,
  clientEmail,
  galleryTitle,
  gallerySlug,
  password,
  expiresAt,
  imageCount,
}: SendClientGalleryEmailButtonProps) {
  const [isSending, setIsSending] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleSendEmail = async () => {
    if (
      !confirm(
        `Send gallery access email to ${clientEmail}?\n\nThis will notify the client that their gallery is ready.`
      )
    ) {
      return
    }

    setIsSending(true)
    setStatus('idle')

    try {
      const galleryUrl = `${window.location.origin}/client/${gallerySlug}`

      const response = await fetch('/api/admin/client-galleries/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName,
          clientEmail,
          galleryTitle,
          galleryUrl,
          password,
          expiresAt,
          imageCount,
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to send email')
      }

      setStatus('success')
      setTimeout(() => setStatus('idle'), 3000)
    } catch (error) {
      logger.error({ err: error }, 'Error sending email')
      setStatus('error')
      alert(
        error instanceof Error
          ? error.message
          : 'Failed to send email. Please try again.'
      )
    } finally {
      setIsSending(false)
    }
  }

  return (
    <button
      onClick={handleSendEmail}
      disabled={isSending || imageCount === 0}
      className={`rounded-lg px-4 py-2 font-semibold transition-colors ${
        status === 'success'
          ? 'bg-green-600 text-white hover:bg-green-700'
          : status === 'error'
            ? 'bg-red-600 text-white hover:bg-red-700'
            : 'bg-blue-600 text-white hover:bg-blue-700'
      } disabled:cursor-not-allowed disabled:opacity-50`}
      title={
        imageCount === 0
          ? 'Upload images before sending notification'
          : 'Send email notification to client'
      }
    >
      {isSending
        ? 'Sending...'
        : status === 'success'
          ? '✓ Email Sent'
          : status === 'error'
            ? '✗ Failed'
            : '📧 Notify Client'}
    </button>
  )
}
