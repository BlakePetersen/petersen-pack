// ABOUTME: Shared Zod validators for common field types
// ABOUTME: Used across all admin form schemas

import { z } from 'zod'

/**
 * Validates URL-safe slugs (lowercase, numbers, hyphens only)
 */
export const slugSchema = z
  .string()
  .min(1, 'Slug is required')
  .max(100, 'Slug too long')
  .regex(
    /^[a-z0-9-]+$/,
    'Slug must be lowercase letters, numbers, and hyphens only'
  )

/**
 * Validates optional URLs (allows empty string)
 */
const optionalUrlSchema = z
  .string()
  .url('Must be a valid URL')
  .optional()
  .or(z.literal(''))

/**
 * Validates required URLs
 */
const requiredUrlSchema = z.string().url('Must be a valid URL')

/**
 * Validates image URLs with common extensions
 */
const imageUrlSchema = z
  .string()
  .url('Must be a valid URL')
  .refine(
    (url) =>
      /\.(jpg|jpeg|png|webp|gif)$/i.test(url) ||
      url.includes('blob.vercel-storage.com'),
    'Must be a valid image URL'
  )

/**
 * Validates dates within reasonable ranges
 */
const dateRangeSchema = (
  minYearsAgo: number = 5,
  maxYearsAhead: number = 5
) => {
  const minDate = new Date()
  minDate.setFullYear(minDate.getFullYear() - minYearsAgo)

  const maxDate = new Date()
  maxDate.setFullYear(maxDate.getFullYear() + maxYearsAhead)

  return z.coerce
    .date()
    .min(minDate, `Date must be within the last ${minYearsAgo} years`)
    .max(maxDate, `Date must be within the next ${maxYearsAhead} years`)
}

/**
 * Validates positive currency amounts (in cents)
 */
const currencySchema = z.coerce
  .number()
  .int('Amount must be a whole number')
  .positive('Amount must be positive')

/**
 * Validates non-negative integers
 */
const nonNegativeIntSchema = z.coerce
  .number()
  .int('Must be a whole number')
  .min(0, 'Must be 0 or greater')
