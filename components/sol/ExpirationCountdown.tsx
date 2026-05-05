// ABOUTME: Countdown timer showing days until gallery expires
// ABOUTME: Shows warning states at 7, 3, and 1 day remaining

'use client'

import { useEffect, useState } from 'react'
import { differenceInDays, differenceInHours, format } from 'date-fns'

type Props = {
  expiresAt: Date | null
}

export default function ExpirationCountdown({ expiresAt }: Props) {
  const [timeRemaining, setTimeRemaining] = useState<string>('')
  const [urgency, setUrgency] = useState<'normal' | 'warning' | 'urgent'>(
    'normal'
  )

  useEffect(() => {
    if (!expiresAt) return

    const updateCountdown = () => {
      const now = new Date()
      const expiration = new Date(expiresAt)
      const daysRemaining = differenceInDays(expiration, now)
      const hoursRemaining = differenceInHours(expiration, now)

      if (daysRemaining > 7) {
        setTimeRemaining(`Expires ${format(expiration, 'MMM d, yyyy')}`)
        setUrgency('normal')
      } else if (daysRemaining > 1) {
        setTimeRemaining(`${daysRemaining} days remaining`)
        setUrgency(daysRemaining <= 3 ? 'urgent' : 'warning')
      } else if (hoursRemaining > 0) {
        setTimeRemaining(`${hoursRemaining} hours remaining`)
        setUrgency('urgent')
      } else {
        setTimeRemaining('Expired')
        setUrgency('urgent')
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [expiresAt])

  if (!expiresAt) return null

  const bgColor =
    urgency === 'urgent'
      ? 'bg-red-100 dark:bg-red-900/20 border-red-300 dark:border-red-700'
      : urgency === 'warning'
        ? 'bg-orange-100 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700'
        : 'bg-blue-100 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'

  const textColor =
    urgency === 'urgent'
      ? 'text-red-900 dark:text-red-100'
      : urgency === 'warning'
        ? 'text-orange-900 dark:text-orange-100'
        : 'text-blue-900 dark:text-blue-100'

  return (
    <div className={`rounded-lg border p-4 ${bgColor}`}>
      <div className="flex items-center gap-2">
        <svg
          className={`h-5 w-5 ${textColor}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className={`font-medium ${textColor}`}>{timeRemaining}</span>
      </div>
    </div>
  )
}
