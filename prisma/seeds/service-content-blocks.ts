// ABOUTME: Seeds global process steps and info cards for services
// ABOUTME: Extracted from hardcoded content in service detail pages

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function seedServiceContentBlocks() {
  console.log('Seeding service content blocks...')

  // Create global process steps
  const processSteps = await Promise.all([
    prisma.processStep.create({
      data: {
        title: 'Consultation & Booking',
        content:
          "We'll start with a conversation about your vision, goals, and any specific needs. Once we've found the perfect package, I'll send you a contract and invoice. A 50% deposit secures your session date.",
        stepNumber: 1,
        isGlobal: true,
      },
    }),
    prisma.processStep.create({
      data: {
        title: 'Pre-Session Planning',
        content:
          "Before your session, we'll discuss location options, wardrobe choices, and timing to ensure everything is perfect. I'll provide guidance on what to wear and what to bring to make the most of our time together.",
        stepNumber: 2,
        isGlobal: true,
      },
    }),
    prisma.processStep.create({
      data: {
        title: 'The Photo Session',
        content:
          "On shoot day, I'll guide you through poses and expressions to capture authentic, beautiful moments. Sessions are relaxed and fun—my goal is to make you feel comfortable and confident in front of the camera.",
        stepNumber: 3,
        isGlobal: true,
      },
    }),
    prisma.processStep.create({
      data: {
        title: 'Professional Editing',
        content:
          "After your session, I'll carefully edit your images to enhance colors, lighting, and overall composition while maintaining a natural look. This process typically takes 2-3 weeks.",
        stepNumber: 4,
        isGlobal: true,
      },
    }),
    prisma.processStep.create({
      data: {
        title: 'Gallery Review & Selection',
        content:
          "You'll receive a link to your private online gallery where you can view all your edited images. Select your favorites for final retouching, and mark any images you'd like to favorite or download.",
        stepNumber: 5,
        isGlobal: true,
      },
    }),
    prisma.processStep.create({
      data: {
        title: 'Final Retouching & Delivery',
        content:
          'Your selected images receive final retouching and are delivered as high-resolution digital downloads through your gallery. All images come with usage rights for personal and business use as outlined in your package.',
        stepNumber: 6,
        isGlobal: true,
      },
    }),
    prisma.processStep.create({
      data: {
        title: 'Invoice & Final Payment',
        content:
          "After you've made your selections, you'll receive a final invoice for the remaining balance (if not already paid on shoot day) plus any additional retouching or add-ons. Once payment is received, your final images will be ready for download.",
        stepNumber: 7,
        isGlobal: true,
      },
    }),
  ])

  console.log(`Created ${processSteps.length} process steps`)

  // Create global info cards
  const infoCards = await Promise.all([
    prisma.infoCard.create({
      data: {
        title: 'Travel',
        content:
          'Sessions within the East Bay and San Francisco area are included. Additional travel fees may apply for locations outside this area.',
        icon: 'location',
        isGlobal: true,
      },
    }),
    prisma.infoCard.create({
      data: {
        title: 'Rescheduling',
        content:
          'Sessions can be rescheduled up to 7 days before the scheduled date without penalty. Weather rescheduling is always complimentary.',
        icon: 'calendar',
        isGlobal: true,
      },
    }),
    prisma.infoCard.create({
      data: {
        title: 'Delivery',
        content:
          'Your online gallery will be ready within 2-3 weeks of your session. Rush delivery is available for an additional fee.',
        icon: 'clock',
        isGlobal: true,
      },
    }),
    prisma.infoCard.create({
      data: {
        title: 'Custom Packages',
        content:
          'Need something different? I offer custom packages for special projects. Contact me to discuss your unique needs and vision.',
        icon: 'edit',
        isGlobal: true,
      },
    }),
  ])

  console.log(`Created ${infoCards.length} info cards`)

  return { processSteps, infoCards }
}
