// ABOUTME: Script to pre-populate FAQ data for Luna Photography
// ABOUTME: Creates general and service-specific FAQs across all categories

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const generalFaqs = [
  {
    question: 'What should I bring to my photo session?',
    answer: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: "A little preparation goes a long way! Here's a comprehensive checklist to help you feel confident and prepared:",
            },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 4 },
          content: [{ type: 'text', text: 'Wardrobe & Outfit Changes' }],
        },
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: '2-3 complete outfits for variety (we can change locations or setups between looks)',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Layers like jackets, cardigans, or scarves for different looks',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Comfortable shoes (and a nicer pair for photos if needed)',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'A lint roller and small steamer or wrinkle-release spray',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 4 },
          content: [{ type: 'text', text: 'Hair & Touch-Up Essentials' }],
        },
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Hairbrush, comb, and any styling products you use',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Bobby pins, hair ties, and hairspray for flyaways',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Touch-up makeup: lipstick, powder for shine, concealer',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Blotting papers or oil-absorbing sheets',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'A small mirror for quick checks between shots',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 4 },
          content: [{ type: 'text', text: 'For Kids & Little Ones' }],
        },
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Favorite snacks and drinks (non-staining options are best!)',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Small toys or books to keep them entertained between shots',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Backup outfit in case of spills or accidents',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'A lovey or comfort item that helps them feel secure',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 4 },
          content: [{ type: 'text', text: 'For Four-Legged Family Members' }],
        },
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'High-value treats they go crazy for (squeaky cheese, liver treats, etc.)',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'A favorite toy that gets their attention',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Water bowl and fresh water for breaks',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Leash and waste bags (even for off-leash locations)',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: "A helper to wrangle pets when they're not in the frame",
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 4 },
          content: [{ type: 'text', text: 'For Outdoor Sessions' }],
        },
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Sunscreen and bug spray (apply before arriving so it absorbs)',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Water bottles to stay hydrated',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'A blanket to sit on between shots',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: "Don't forget meaningful props like a vintage family heirloom, fresh flowers, or anything that tells your story!",
            },
          ],
        },
      ],
    },
    category: 'GENERAL',
    serviceId: null,
    sortOrder: 1,
  },
  {
    question: 'What happens if the weather is bad on the day of my session?',
    answer: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: "I keep a close eye on the forecast starting a few days before your session. Here's how I handle different weather scenarios:",
            },
          ],
        },
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      marks: [{ type: 'bold' }],
                      text: 'Rain or storms:',
                    },
                    {
                      type: 'text',
                      text: " We'll reschedule at no additional charge. I'll reach out 24-48 hours ahead if it looks like we need to move the date.",
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      marks: [{ type: 'bold' }],
                      text: 'Overcast skies:',
                    },
                    {
                      type: 'text',
                      text: ' These are actually ideal! Clouds act like a giant softbox, creating even, flattering light with no harsh shadows. Some of my favorite photos happen on cloudy days.',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      marks: [{ type: 'bold' }],
                      text: 'Extreme heat or cold:',
                    },
                    {
                      type: 'text',
                      text: ' We can adjust timing (early morning or golden hour) or find shaded/sheltered locations. Your comfort is a priority!',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      marks: [{ type: 'bold' }],
                      text: 'Light drizzle:',
                    },
                    {
                      type: 'text',
                      text: " If you're adventurous, we can embrace it! Umbrellas make beautiful props, and post-rain light is magical.",
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: "I always have backup indoor locations in mind, and I'm flexible about rescheduling. The goal is beautiful photos and a relaxed experience - not battling the elements!",
            },
          ],
        },
      ],
    },
    category: 'GENERAL',
    serviceId: null,
    sortOrder: 2,
  },
  {
    question: 'How do I book a session?',
    answer: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Visit our ',
            },
            {
              type: 'text',
              marks: [{ type: 'link', attrs: { href: '/contact' } }],
              text: 'contact page',
            },
            {
              type: 'text',
              text: " and fill out the inquiry form. Include your preferred date, session type, and any special requests. I'll respond within 24 hours to discuss availability and details.",
            },
          ],
        },
      ],
    },
    category: 'BOOKING',
    serviceId: null,
    sortOrder: 3,
  },
  {
    question: 'How far in advance should I book my session?',
    answer: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'I recommend booking ',
            },
            {
              type: 'text',
              marks: [{ type: 'bold' }],
              text: '4-6 weeks in advance',
            },
            {
              type: 'text',
              text: ' for most sessions, especially during peak seasons (spring and fall). For weddings and special events, booking 6-12 months ahead is ideal to secure your date.',
            },
          ],
        },
      ],
    },
    category: 'BOOKING',
    serviceId: null,
    sortOrder: 4,
  },
  {
    question: 'What are your rates?',
    answer: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Session rates vary depending on the type of photography and package selected. Visit our ',
            },
            {
              type: 'text',
              marks: [{ type: 'link', attrs: { href: '/services' } }],
              text: 'services page',
            },
            {
              type: 'text',
              text: ' to see starting prices for each session type. Custom packages are available - contact me for a personalized quote!',
            },
          ],
        },
      ],
    },
    category: 'PRICING',
    serviceId: null,
    sortOrder: 6,
  },
  {
    question: 'Do you require a deposit?',
    answer: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Yes, a 50% non-refundable deposit is required to secure your session date. The remaining balance is due on or before the day of your session. Payment can be made via credit card, PayPal, or bank transfer.',
            },
          ],
        },
      ],
    },
    category: 'PRICING',
    serviceId: null,
    sortOrder: 7,
  },
  {
    question: 'Are prints and albums included in the session fee?',
    answer: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Session fees cover the photography time and digital delivery of edited images. Prints, albums, and other physical products are available for purchase separately. I offer high-quality professional printing services and can help you select the perfect products for your photos.',
            },
          ],
        },
      ],
    },
    category: 'PRICING',
    serviceId: null,
    sortOrder: 8,
  },
  {
    question: 'How long does a typical session last?',
    answer: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Session length varies by type:',
            },
          ],
        },
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      marks: [{ type: 'bold' }],
                      text: 'Portrait sessions:',
                    },
                    { type: 'text', text: ' 1-2 hours' },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      marks: [{ type: 'bold' }],
                      text: 'Family sessions:',
                    },
                    { type: 'text', text: ' 1-1.5 hours' },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      marks: [{ type: 'bold' }],
                      text: 'Weddings:',
                    },
                    {
                      type: 'text',
                      text: ' Full day coverage (8-10 hours typical)',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    category: 'PROCESS',
    serviceId: null,
    sortOrder: 9,
  },
  {
    question: 'When will I receive my photos?',
    answer: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: "You'll receive your edited photos within ",
            },
            {
              type: 'text',
              marks: [{ type: 'bold' }],
              text: '2-3 weeks',
            },
            {
              type: 'text',
              text: ' for most sessions. Wedding galleries typically take 4-6 weeks due to the larger volume of images. Rush delivery is available for an additional fee if you need your photos sooner.',
            },
          ],
        },
      ],
    },
    category: 'PROCESS',
    serviceId: null,
    sortOrder: 10,
  },
  {
    question: 'How many photos will I receive?',
    answer: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'The number of delivered photos depends on the session type and package. Generally:',
            },
          ],
        },
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Portrait sessions: 40-60 edited images',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Family sessions: 50-75 edited images',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    { type: 'text', text: 'Weddings: 400-600+ edited images' },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'All images are professionally edited and delivered in high resolution.',
            },
          ],
        },
      ],
    },
    category: 'PROCESS',
    serviceId: null,
    sortOrder: 11,
  },
  {
    question: 'Do you provide the RAW/unedited files?',
    answer: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'RAW files are not included as part of standard packages. I deliver professionally edited, high-resolution JPEG files that are ready to print and share. RAW files may be available for purchase as an add-on - please inquire if this is important to you.',
            },
          ],
        },
      ],
    },
    category: 'PROCESS',
    serviceId: null,
    sortOrder: 12,
  },
  {
    question: 'What is your cancellation and rescheduling policy?',
    answer: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: "Life happens, and I'm here to work with you! Here's how I handle changes:",
            },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 4 },
          content: [{ type: 'text', text: 'Rescheduling' }],
        },
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      marks: [{ type: 'bold' }],
                      text: 'More than 48 hours notice:',
                    },
                    {
                      type: 'text',
                      text: " Reschedule at no charge. We'll find a new date that works for everyone.",
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      marks: [{ type: 'bold' }],
                      text: 'Less than 48 hours notice:',
                    },
                    {
                      type: 'text',
                      text: " Your deposit may be forfeited, but I'll do my best to accommodate emergencies.",
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      marks: [{ type: 'bold' }],
                      text: 'Weather-related reschedules:',
                    },
                    {
                      type: 'text',
                      text: ' Always free! I monitor forecasts and will proactively reach out if conditions look unfavorable.',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 4 },
          content: [{ type: 'text', text: 'Cancellations' }],
        },
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'The booking deposit is non-refundable as it reserves your date and time.',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Full cancellations with less than 7 days notice may forfeit the entire session fee.',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'I understand emergencies happen - please communicate openly and we can usually find a solution.',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'My goal is to create a stress-free experience. When in doubt, just reach out!',
            },
          ],
        },
      ],
    },
    category: 'POLICIES',
    serviceId: null,
    sortOrder: 13,
  },
  {
    question: 'Do you offer retouching services?',
    answer: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'All delivered images include professional editing (color correction, exposure adjustments, cropping). Advanced retouching (blemish removal, skin smoothing, etc.) is available for an additional fee. Please let me know if you have specific retouching requests!',
            },
          ],
        },
      ],
    },
    category: 'POLICIES',
    serviceId: null,
    sortOrder: 14,
  },
  {
    question: 'Can I share my photos on social media?',
    answer: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Absolutely! You have full rights to share your photos on social media, print them, and use them for personal purposes. I just ask that you credit me when sharing online (e.g., "Photos by Luna Photography"). Commercial use requires a separate license - please contact me if you need this.',
            },
          ],
        },
      ],
    },
    category: 'POLICIES',
    serviceId: null,
    sortOrder: 15,
  },
]

async function main() {
  console.log('🌙 Starting FAQ seeding for Luna Photography...\n')

  // Get all services to create service-specific FAQs
  const services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  })

  console.log(`Found ${services.length} active services\n`)

  // Create general FAQs
  console.log('Creating general FAQs...')
  for (const faq of generalFaqs) {
    const created = await prisma.faq.create({
      data: {
        question: faq.question,
        answer: faq.answer,
        category: faq.category as any,
        serviceId: faq.serviceId,
        sortOrder: faq.sortOrder,
        isActive: true,
      },
    })
    console.log(`✓ ${created.question}`)
  }

  // Create some service-specific FAQs
  console.log('\nCreating service-specific FAQs...')

  // Wedding photography specific FAQs
  const weddingService = services.find((s) =>
    s.name.toLowerCase().includes('wedding')
  )
  if (weddingService) {
    const weddingFaqs = [
      {
        question: 'Do you offer engagement session photography?',
        answer: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: "Yes! Engagement sessions are a wonderful way to get comfortable in front of the camera before your wedding day. They're included in most wedding packages, and the photos make perfect save-the-dates or guest book prints.",
                },
              ],
            },
          ],
        },
        category: 'BOOKING',
        sortOrder: 100,
      },
      {
        question: 'Do you travel for destination weddings?',
        answer: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Absolutely! I love destination weddings and am available to travel anywhere. Travel fees apply based on distance and accommodations needed. Contact me with your wedding location for a custom quote.',
                },
              ],
            },
          ],
        },
        category: 'BOOKING',
        sortOrder: 101,
      },
      {
        question: 'Will you be the only photographer at our wedding?',
        answer: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: "For most weddings, I bring a second photographer to ensure we capture every moment from multiple angles. For smaller, intimate weddings, I can work solo. We'll discuss the best approach based on your wedding size and timeline.",
                },
              ],
            },
          ],
        },
        category: 'PROCESS',
        sortOrder: 102,
      },
    ]

    for (const faq of weddingFaqs) {
      const created = await prisma.faq.create({
        data: {
          question: faq.question,
          answer: faq.answer,
          category: faq.category as any,
          serviceId: weddingService.id,
          sortOrder: faq.sortOrder,
          isActive: true,
        },
      })
      console.log(`✓ [${weddingService.name}] ${created.question}`)
    }
  }

  // Portrait/Family specific FAQs
  const portraitService = services.find(
    (s) =>
      s.name.toLowerCase().includes('portrait') ||
      s.name.toLowerCase().includes('family')
  )
  if (portraitService) {
    const portraitFaqs = [
      {
        question: 'What should we wear for our family photos?',
        answer: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Coordinate colors rather than matching exactly. Choose a color palette of 3-4 complementary colors and mix patterns and textures. Avoid large logos or busy patterns. Most importantly, wear something you feel comfortable and confident in!',
                },
              ],
            },
          ],
        },
        category: 'GENERAL',
        sortOrder: 200,
      },
      {
        question: 'Can we bring our pets to the session?',
        answer: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: "Of course! Pets are family too. Let me know in advance so I can plan extra time and choose a pet-friendly location. Bring treats and a handler if possible to help get your pet's attention during photos.",
                },
              ],
            },
          ],
        },
        category: 'GENERAL',
        sortOrder: 201,
      },
    ]

    for (const faq of portraitFaqs) {
      const created = await prisma.faq.create({
        data: {
          question: faq.question,
          answer: faq.answer,
          category: faq.category as any,
          serviceId: portraitService.id,
          sortOrder: faq.sortOrder,
          isActive: true,
        },
      })
      console.log(`✓ [${portraitService.name}] ${created.question}`)
    }
  }

  const faqCount = await prisma.faq.count()
  console.log(`\n✨ Successfully created ${faqCount} FAQs!`)
  console.log('🌙 FAQ seeding complete!')
}

main()
  .catch((e) => {
    console.error('Error seeding FAQs:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
