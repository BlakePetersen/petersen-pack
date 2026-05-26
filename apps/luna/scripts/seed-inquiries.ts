// ABOUTME: Script to seed test inquiries for demo
// ABOUTME: Creates sample inquiry records with various statuses

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const testInquiries = [
  {
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    phone: '510-555-0123',
    serviceType: 'Wedding',
    message: 'Hi Ashley! We\'re getting married next June and would love to discuss wedding photography. We saw your work on Instagram and absolutely love your style. Would you be available for a consultation?',
    status: 'NEW' as const,
  },
  {
    name: 'Mike Chen',
    email: 'mike.chen@techcorp.com',
    phone: '415-555-0198',
    serviceType: 'Headshots',
    message: 'Need professional headshots for our executive team (5 people). Looking to schedule sometime next week if possible.',
    status: 'CONTACTED' as const,
  },
  {
    name: 'Emma Martinez',
    email: 'emma.m@startup.io',
    phone: null,
    serviceType: 'Branding',
    message: 'Our startup needs branding photos for our website and marketing materials. Can we schedule a call to discuss packages?',
    status: 'NEW' as const,
  },
  {
    name: 'David Kim',
    email: 'dkim@example.com',
    phone: '925-555-0142',
    serviceType: 'Family Portrait',
    message: 'Would like to book a family session for this fall. We have 2 kids (ages 5 and 8) and a dog. Do you do outdoor sessions?',
    status: 'CONVERTED' as const,
  },
  {
    name: 'Rachel Green',
    email: 'rachel.green@email.com',
    phone: '510-555-0167',
    serviceType: 'Pet Photography',
    message: 'I have a golden retriever and would love some professional photos. What locations do you recommend?',
    status: 'CONTACTED' as const,
  },
  {
    name: 'Tom Wilson',
    email: 'tom.wilson@corp.com',
    phone: null,
    serviceType: 'Other',
    message: 'Interested in your underwater photography. Can you tell me more about this service?',
    status: 'CLOSED' as const,
  },
]

async function main() {
  console.log('Seeding inquiries...')

  for (const inquiry of testInquiries) {
    const created = await prisma.inquiry.create({
      data: inquiry,
    })
    console.log(`✓ Created inquiry from ${created.name} (${created.status})`)
  }

  console.log('\n✅ Inquiry seeding complete!')
  console.log(`Added ${testInquiries.length} test inquiries`)
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
