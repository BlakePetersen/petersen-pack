// ABOUTME: Focal point picker component for images
// ABOUTME: Allows clicking on an image to set the focal point

'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'

type FocalPointPickerProps = {
  imageUrl: string
  focalX: number
  focalY: number
  onFocalChange: (x: number, y: number) => void
  label?: string
}

function FocalPointPicker({
  imageUrl,
  focalX,
  focalY,
  onFocalChange,
  label = 'Focal Point',
}: FocalPointPickerProps) {
  const imageRef = useRef<HTMLDivElement>(null)

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return

    const rect = imageRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height

    // Clamp values between 0 and 1
    const clampedX = Math.max(0, Math.min(1, x))
    const clampedY = Math.max(0, Math.min(1, y))

    onFocalChange(clampedX, clampedY)
  }

  if (!imageUrl) {
    return null
  }

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {(focalX * 100).toFixed(0)}%, {(focalY * 100).toFixed(0)}%
        </span>
      </div>

      <div
        ref={imageRef}
        onClick={handleImageClick}
        className="relative aspect-[21/9] w-full cursor-crosshair overflow-hidden rounded-lg border-2 border-gray-300 bg-gray-100 dark:border-gray-700 dark:bg-gray-800"
        title="Click to set focal point"
      >
        {/* Image with cover to match carousel behavior */}
        <Image
          src={imageUrl}
          alt="Focal point preview"
          fill
          className="pointer-events-none object-cover"
          style={{
            objectPosition: `${focalX * 100}% ${focalY * 100}%`,
          }}
        />

        {/* Static focal point indicator in center */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 -ml-3 -mt-3 h-6 w-6">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-2 border-red-500 shadow-lg" />
          {/* Inner dot */}
          <div className="absolute inset-0 m-2 rounded-full bg-red-500 shadow-lg" />
          {/* Crosshair */}
          <div className="absolute -left-8 -right-8 top-1/2 h-px bg-red-500 opacity-50" />
          <div className="absolute -bottom-8 -top-8 left-1/2 w-px bg-red-500 opacity-50" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs text-gray-600 dark:text-gray-400">
            Horizontal
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={focalX}
            onChange={(e) => onFocalChange(parseFloat(e.target.value), focalY)}
            className="w-full"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-600 dark:text-gray-400">
            Vertical
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={focalY}
            onChange={(e) => onFocalChange(focalX, parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400">
        Preview shows how the image will be cropped in the carousel
      </p>
    </div>
  )
}
