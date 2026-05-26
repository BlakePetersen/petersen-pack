// ABOUTME: Multi-step form for creating photography contracts
// ABOUTME: Steps: client, shoot details, pricing, usage rights, review

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  contractFormSchema,
  type ContractFormInput,
} from '@/lib/validations/contract'

type Props = {
  clients: Array<{ id: string; name: string | null; email: string }>
  usageRights: Array<{
    id: string
    name: string
    description: string
    price: number
  }>
}

export default function ContractForm({ clients, usageRights }: Props) {
  const router = useRouter()
  const [step, setStep] = useState(1)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(contractFormSchema),
    mode: 'onBlur',
    defaultValues: {
      maxFileSizePx: 4000,
      usageRightIds: [],
    },
  })

  const totalAmount = watch('totalAmount') || 0
  const depositAmount = watch('depositAmount') || 0
  const selectedUsageRightIds = watch('usageRightIds') || []

  const usageRightsTotal = usageRights
    .filter((ur) => selectedUsageRightIds.includes(ur.id))
    .reduce((sum, ur) => sum + ur.price, 0)

  const grandTotal = Number(totalAmount) + usageRightsTotal / 100

  const onSubmit = async (data: ContractFormInput) => {
    try {
      const response = await fetch('/api/admin/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          totalAmount: Math.round(data.totalAmount * 100), // Convert to cents
          depositAmount: Math.round(data.depositAmount * 100),
          pricePerExtraRetouch: Math.round(data.pricePerExtraRetouch * 100),
        }),
      })

      if (!response.ok) throw new Error('Failed to create contract')

      const contract = await response.json()
      router.push(`/admin/contracts/${contract.id}`)
    } catch (error) {
      alert('Failed to create contract')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Step 1: Client Selection */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Step 1: Client Selection</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Client *
            </label>
            <select
              {...register('clientId')}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select a client...</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name || client.email}
                </option>
              ))}
            </select>
            {errors.clientId && (
              <p className="mt-1 text-sm text-red-600">
                {errors.clientId.message}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => setStep(2)}
            className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
          >
            Next
          </button>
        </div>
      )}

      {/* Step 2: Shoot Details */}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Step 2: Shoot Details</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Shoot Type *
            </label>
            <input
              {...register('shootType')}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="Wedding, Portrait, Corporate, etc."
            />
            {errors.shootType && (
              <p className="mt-1 text-sm text-red-600">
                {errors.shootType.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Shoot Date *
            </label>
            <input
              type="date"
              {...register('shootDate')}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            {errors.shootDate && (
              <p className="mt-1 text-sm text-red-600">
                {errors.shootDate.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Location *
            </label>
            <input
              {...register('shootLocation')}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="Central Park, NYC"
            />
            {errors.shootLocation && (
              <p className="mt-1 text-sm text-red-600">
                {errors.shootLocation.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Session Duration *
            </label>
            <input
              {...register('sessionDuration')}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="4 hours"
            />
            {errors.sessionDuration && (
              <p className="mt-1 text-sm text-red-600">
                {errors.sessionDuration.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Deliverables Description *
            </label>
            <textarea
              {...register('deliverablesDescription')}
              rows={4}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="200 professionally edited high-resolution photos..."
            />
            {errors.deliverablesDescription && (
              <p className="mt-1 text-sm text-red-600">
                {errors.deliverablesDescription.message}
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="rounded-lg border border-gray-300 px-6 py-2 dark:border-gray-600"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Pricing */}
      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            Step 3: Pricing Configuration
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Total Package Price *
              </label>
              <input
                type="number"
                {...register('totalAmount', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="2500"
              />
              {errors.totalAmount && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.totalAmount.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Deposit Amount *
              </label>
              <input
                type="number"
                {...register('depositAmount', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="1250"
              />
              {errors.depositAmount && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.depositAmount.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Retouches Included *
              </label>
              <input
                type="number"
                {...register('retouchesIncluded', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="10"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Price Per Extra Retouch *
              </label>
              <input
                type="number"
                {...register('pricePerExtraRetouch', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Download Quota *
              </label>
              <input
                type="number"
                {...register('downloadQuota', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Max File Size (px) *
              </label>
              <select
                {...register('maxFileSizePx', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="2000">2000px</option>
                <option value="3000">3000px</option>
                <option value="4000">4000px</option>
                <option value="6000">Original (6000px+)</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="rounded-lg border border-gray-300 px-6 py-2 dark:border-gray-600"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(4)}
              className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Usage Rights */}
      {step === 4 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Step 4: Usage Rights</h2>

          <div className="space-y-3">
            {usageRights.map((usageRight) => (
              <label
                key={usageRight.id}
                className="flex items-start gap-3 rounded-lg border border-gray-200 p-4 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                <input
                  type="checkbox"
                  value={usageRight.id}
                  {...register('usageRightIds')}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{usageRight.name}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {usageRight.price === 0
                        ? 'Included'
                        : `+$${(usageRight.price / 100).toLocaleString()}`}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {usageRight.description}
                  </p>
                </div>
              </label>
            ))}
          </div>

          {errors.usageRightIds && (
            <p className="text-sm text-red-600">
              {errors.usageRightIds.message}
            </p>
          )}

          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <div className="flex justify-between text-lg font-semibold">
              <span>Grand Total:</span>
              <span>${grandTotal.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="rounded-lg border border-gray-300 px-6 py-2 dark:border-gray-600"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(5)}
              className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
            >
              Review
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Review */}
      {step === 5 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Step 5: Review & Create</h2>

          <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Review the contract details before creating.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(4)}
              className="rounded-lg border border-gray-300 px-6 py-2 dark:border-gray-600"
              disabled={isSubmitting}
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Contract'}
            </button>
          </div>
        </div>
      )}
    </form>
  )
}
