// ABOUTME: Contact form API route
// ABOUTME: Handles inquiry submissions with rate limiting, stores in database, and sends email notifications

import { prisma } from '@/lib/prisma'
import { sendInquiryNotifications } from '@/lib/email'
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { logger } from '@/lib/logger'

// Simple in-memory rate limiting (in production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(identifier: string): boolean {
  const now = Date.now()
  const limit = rateLimitMap.get(identifier)

  if (!limit || now > limit.resetTime) {
    // New window or expired - allow and set new limit
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + 15 * 60 * 1000, // 15 minutes
    })
    return true
  }

  if (limit.count >= 3) {
    // Exceeded limit (3 submissions per 15 minutes)
    return false
  }

  // Increment count
  limit.count++
  return true
}

export async function POST(request: Request) {
  try {
    // Rate limiting based on IP address
    const headersList = await headers()
    const ip =
      headersList.get('x-forwarded-for') ||
      headersList.get('x-real-ip') ||
      'unknown'

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { name, email, phone, serviceType, preferredContactMethod, message } =
      body

    // Validate required fields
    if (!name || !email || !serviceType || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Create inquiry in database
    const inquiry = await prisma.inquiry.create({
      data: {
        name,
        email,
        phone: phone || null,
        serviceType,
        preferredContactMethod: preferredContactMethod || 'EMAIL',
        message,
        status: 'NEW',
      },
    })

    // Send email notifications (non-blocking - don't fail inquiry creation if emails fail)
    try {
      await sendInquiryNotifications({
        id: inquiry.id,
        name: inquiry.name,
        email: inquiry.email,
        phone: inquiry.phone,
        serviceType: inquiry.serviceType,
        message: inquiry.message,
        createdAt: inquiry.createdAt,
      })
    } catch (emailError) {
      // Log error but don't fail the request
      logger.error(
        { err: emailError },
        'Email notification failed (inquiry still created)'
      )
    }

    return NextResponse.json({ success: true, inquiry }, { status: 201 })
  } catch (error) {
    logger.error({ err: error }, 'Error creating inquiry')
    return NextResponse.json(
      { error: 'Failed to submit inquiry' },
      { status: 500 }
    )
  }
}
