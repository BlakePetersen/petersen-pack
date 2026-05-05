// ABOUTME: Contact form component
// ABOUTME: Handles inquiry submissions with validation and spam protection

'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { trackContactFormSubmit } from '@/lib/analytics'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/commons'
import { logger } from '@/lib/logger.edge'

// Maps service names from database to contact form dropdown options
const SERVICE_TYPE_MAP: Record<string, string> = {
  Headshots: 'Headshots',
  'Branding & Commercial': 'Branding',
  'Lifestyle & Family': 'Family Portrait',
  'Animals & Pets': 'Pet Photography',
  'Creative & Specialty': 'Other',
  Boudoir: 'Boudoir',
  Underwater: 'Underwater',
  'Yoga & Dance': 'Yoga/Dance',
}

const contactFormSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Please enter a valid email address'),
    phone: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^[\d\s\-\(\)\.]+$/.test(val),
        'Please enter a valid phone number'
      )
      .refine(
        (val) =>
          !val ||
          val.replace(/\D/g, '').length === 0 ||
          val.replace(/\D/g, '').length >= 10,
        'Phone number must be at least 10 digits'
      ),
    serviceType: z.string().min(1, 'Please select a session type'),
    preferredContactMethod: z.enum(['EMAIL', 'PHONE', 'TEXT']),
    message: z
      .string()
      .min(1, 'Message is required')
      .min(10, 'Please provide more details (at least 10 characters)'),
  })
  .refine(
    (data) => {
      // If contact method is PHONE or TEXT, phone must be provided
      if (
        data.preferredContactMethod === 'PHONE' ||
        data.preferredContactMethod === 'TEXT'
      ) {
        return data.phone && data.phone.trim().length > 0
      }
      return true
    },
    {
      message: 'Phone number is required for phone or text contact',
      path: ['phone'],
    }
  )

type ContactFormData = z.infer<typeof contactFormSchema>

const formatPhone = (value: string): string => {
  const numbers = value.replace(/\D/g, '')
  if (numbers.length <= 3) return numbers
  if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`
  return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`
}

const getGlassFieldClasses = (
  hasError: boolean,
  isDirty: boolean,
  hasValue: boolean
): string => {
  const baseClasses =
    'w-full rounded-lg border-2 px-4 py-3 text-gray-900 transition-all duration-300 placeholder:text-gray-500 focus:outline-none focus:ring-4 dark:text-white dark:placeholder:text-gray-400'

  // Default state
  let stateClasses =
    'bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800'

  // Focus state
  const focusClasses =
    'focus:border-gray-900 focus:ring-gray-100 dark:focus:border-white dark:focus:ring-gray-900'

  if (hasError) {
    stateClasses =
      'border-red-400 bg-red-50 dark:bg-red-950/30 dark:border-red-600 focus:border-red-500 focus:ring-red-100 dark:focus:ring-red-900'
  } else if (isDirty && hasValue) {
    stateClasses =
      'border-green-400 bg-green-50 dark:bg-green-950/20 dark:border-green-600'
  }

  return `${baseClasses} ${stateClasses} ${focusClasses}`
}

export default function ContactForm() {
  const searchParams = useSearchParams()
  const serviceParam = searchParams.get('service')

  // Map service param to form dropdown value
  const getInitialServiceType = (): string => {
    if (!serviceParam) return ''
    // Check exact match first, then mapped match
    if (SERVICE_TYPE_MAP[serviceParam]) return SERVICE_TYPE_MAP[serviceParam]
    // Check if it's already a valid dropdown option
    const validOptions = [
      'Family Portrait',
      'Headshots',
      'Branding',
      'Boudoir',
      'Pet Photography',
      'Yoga/Dance',
      'Underwater',
      'Other',
    ]
    if (validOptions.includes(serviceParam)) return serviceParam
    return ''
  }

  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [honeypot, setHoneypot] = useState('')

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting, dirtyFields },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    mode: 'onBlur',
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      serviceType: getInitialServiceType(),
      preferredContactMethod: 'EMAIL',
      message: '',
    },
  })

  const formValues = watch()

  const onSubmit = async (data: ContactFormData) => {
    setError('')

    // Honeypot spam check
    if (honeypot) {
      logger.warn('Spam detected via honeypot')
      setSubmitted(true)
      return
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        if (result.error === 'Rate limit exceeded') {
          throw new Error(
            'Too many submissions. Please wait a few minutes and try again.'
          )
        }
        throw new Error(result.error || 'Failed to send message')
      }

      trackContactFormSubmit()
      setSubmitted(true)
      reset()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to send message. Please try calling instead.'
      )
    }
  }

  if (submitted) {
    return (
      <div
        className="rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-8 text-center dark:border-green-800 dark:from-green-950/30 dark:to-emerald-950/30"
        role="status"
        aria-live="polite"
      >
        <div
          className="mb-4 text-6xl text-green-600 dark:text-green-400"
          aria-hidden="true"
        >
          ✓
        </div>
        <h3 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
          Message Sent!
        </h3>
        <p className="text-gray-700 dark:text-gray-300">
          Thank you for your inquiry. I&apos;ll get back to you within 24-48
          hours.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-6 font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Send another message
        </button>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
      aria-label="Contact form"
    >
      {error && (
        <div
          className="rounded-xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-rose-50 p-4 text-red-800 dark:border-red-800 dark:from-red-950/30 dark:to-rose-950/30 dark:text-red-200"
          role="alert"
          aria-live="assertive"
        >
          {error}
        </div>
      )}

      {/* Honeypot field - hidden from users */}
      <input
        type="text"
        name="website"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        className="absolute left-[-9999px]"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="relative">
          <label
            htmlFor="contact-name"
            className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100"
          >
            Name *
          </label>
          <div className="relative">
            <input
              id="contact-name"
              type="text"
              {...register('name')}
              className={getGlassFieldClasses(
                !!errors.name,
                !!dirtyFields.name,
                !!formValues.name
              )}
              placeholder="Your name"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
            {/* Validation Icon */}
            {dirtyFields.name && formValues.name && !errors.name && (
              <CheckCircle2 className="animate-in fade-in-0 zoom-in-95 absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-green-500 duration-200 dark:text-green-400" />
            )}
            {errors.name && (
              <XCircle className="animate-in fade-in-0 zoom-in-95 absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-red-500 duration-200 dark:text-red-400" />
            )}
          </div>
          {errors.name && (
            <div className="mt-2 flex items-center gap-1 rounded-md bg-red-50/80 px-3 py-2 backdrop-blur-sm dark:bg-red-950/30">
              <XCircle className="h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400" />
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.name.message}
              </p>
            </div>
          )}
        </div>

        <div className="relative">
          <label
            htmlFor="contact-email"
            className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100"
          >
            Email *
          </label>
          <div className="relative">
            <input
              id="contact-email"
              type="email"
              {...register('email')}
              className={getGlassFieldClasses(
                !!errors.email,
                !!dirtyFields.email,
                !!formValues.email
              )}
              placeholder="your@email.com"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {dirtyFields.email && formValues.email && !errors.email && (
              <CheckCircle2 className="animate-in fade-in-0 zoom-in-95 absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-green-500 duration-200 dark:text-green-400" />
            )}
            {errors.email && (
              <XCircle className="animate-in fade-in-0 zoom-in-95 absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-red-500 duration-200 dark:text-red-400" />
            )}
          </div>
          {errors.email && (
            <div className="mt-2 flex items-center gap-1 rounded-md bg-red-50/80 px-3 py-2 backdrop-blur-sm dark:bg-red-950/30">
              <XCircle className="h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400" />
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.email.message}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="relative">
          <label
            htmlFor="contact-phone"
            className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100"
          >
            Phone
          </label>
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <div className="relative">
                <input
                  id="contact-phone"
                  type="tel"
                  value={field.value || ''}
                  onChange={(e) => {
                    const formatted = formatPhone(e.target.value)
                    field.onChange(formatted)
                  }}
                  onBlur={field.onBlur}
                  className={getGlassFieldClasses(
                    !!errors.phone,
                    !!dirtyFields.phone,
                    !!field.value
                  )}
                  placeholder="(555) 123-4567"
                  aria-invalid={!!errors.phone}
                  aria-describedby={errors.phone ? 'phone-error' : undefined}
                />
                {dirtyFields.phone && field.value && !errors.phone && (
                  <CheckCircle2 className="animate-in fade-in-0 zoom-in-95 absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-green-500 duration-200 dark:text-green-400" />
                )}
                {errors.phone && (
                  <XCircle className="animate-in fade-in-0 zoom-in-95 absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-red-500 duration-200 dark:text-red-400" />
                )}
              </div>
            )}
          />
          {errors.phone && (
            <div className="mt-2 flex items-center gap-1 rounded-md bg-red-50/80 px-3 py-2 backdrop-blur-sm dark:bg-red-950/30">
              <XCircle className="h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400" />
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.phone.message}
              </p>
            </div>
          )}
        </div>

        <div>
          <label
            htmlFor="contact-preferred-method"
            className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100"
          >
            Preferred Contact Method *
          </label>
          <select
            id="contact-preferred-method"
            {...register('preferredContactMethod')}
            className={`${getGlassFieldClasses(
              false,
              !!dirtyFields.preferredContactMethod,
              !!formValues.preferredContactMethod
            )} pr-12 [background-position:right_1rem_center]`}
            style={{
              backgroundPosition: 'right 1rem center',
            }}
          >
            <option value="EMAIL">Email</option>
            <option value="PHONE">Phone</option>
            <option value="TEXT">Text Message</option>
          </select>
        </div>
      </div>

      <div>
        <label
          htmlFor="contact-service-type"
          className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100"
        >
          Session Type *
        </label>
        <div className="relative">
          <select
            id="contact-service-type"
            {...register('serviceType')}
            className={`${getGlassFieldClasses(
              !!errors.serviceType,
              !!dirtyFields.serviceType,
              !!formValues.serviceType
            )} pr-12 [background-position:right_1rem_center]`}
            style={{
              backgroundPosition: 'right 1rem center',
            }}
            aria-invalid={!!errors.serviceType}
            aria-describedby={
              errors.serviceType ? 'service-type-error' : undefined
            }
          >
            <option value="">Select a session type</option>
            <option value="Family Portrait">Family Portrait</option>
            <option value="Headshots">Headshots</option>
            <option value="Branding">Branding</option>
            <option value="Boudoir">Boudoir</option>
            <option value="Pet Photography">Pet Photography</option>
            <option value="Yoga/Dance">Yoga/Dance</option>
            <option value="Underwater">Underwater</option>
            <option value="Other">Other</option>
          </select>
          {dirtyFields.serviceType &&
            formValues.serviceType &&
            !errors.serviceType && (
              <CheckCircle2 className="animate-in fade-in-0 zoom-in-95 pointer-events-none absolute right-10 top-1/2 h-5 w-5 -translate-y-1/2 text-green-500 duration-200 dark:text-green-400" />
            )}
          {errors.serviceType && (
            <XCircle className="animate-in fade-in-0 zoom-in-95 pointer-events-none absolute right-10 top-1/2 h-5 w-5 -translate-y-1/2 text-red-500 duration-200 dark:text-red-400" />
          )}
        </div>
        {errors.serviceType && (
          <div className="mt-2 flex items-center gap-1 rounded-md bg-red-50/80 px-3 py-2 backdrop-blur-sm dark:bg-red-950/30">
            <XCircle className="h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400" />
            <p className="text-sm text-red-600 dark:text-red-400">
              {errors.serviceType.message}
            </p>
          </div>
        )}
      </div>

      <div>
        <label
          htmlFor="contact-message"
          className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100"
        >
          Message *
        </label>
        <div className="relative">
          <textarea
            id="contact-message"
            {...register('message')}
            rows={6}
            className={`${getGlassFieldClasses(
              !!errors.message,
              !!dirtyFields.message,
              !!formValues.message
            )} resize-none`}
            placeholder="Tell me about your session ideas, preferred dates, or any questions..."
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? 'message-error' : undefined}
          />
          {dirtyFields.message && formValues.message && !errors.message && (
            <CheckCircle2 className="animate-in fade-in-0 zoom-in-95 absolute right-3 top-3 h-5 w-5 text-green-500 duration-200 dark:text-green-400" />
          )}
          {errors.message && (
            <XCircle className="animate-in fade-in-0 zoom-in-95 absolute right-3 top-3 h-5 w-5 text-red-500 duration-200 dark:text-red-400" />
          )}
        </div>
        {errors.message && (
          <div className="mt-2 flex items-center gap-1 rounded-md bg-red-50/80 px-3 py-2 backdrop-blur-sm dark:bg-red-950/30">
            <XCircle className="h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400" />
            <p className="text-sm text-red-600 dark:text-red-400">
              {errors.message.message}
            </p>
          </div>
        )}
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {formValues.message?.length || 0} characters (minimum 10)
        </p>
      </div>

      <div className="flex justify-center">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <svg
                className="h-5 w-5 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Sending...
            </>
          ) : (
            'Send Message'
          )}
        </Button>
      </div>
    </form>
  )
}
