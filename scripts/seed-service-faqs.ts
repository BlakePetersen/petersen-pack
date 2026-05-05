// ABOUTME: Seeds service-specific FAQs for each photography service
// ABOUTME: Run with: npx tsx scripts/seed-service-faqs.ts

import { prisma } from '../lib/prisma'

// Helper to create Tiptap paragraph format
function tiptapParagraph(text: string) {
  return {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text }],
      },
    ],
  }
}

const serviceFaqs: Record<
  string,
  Array<{ question: string; answer: string }>
> = {
  headshots: [
    {
      question: 'What should I wear to my headshot session?',
      answer:
        'Bring 2-3 outfit options in solid colors that complement your skin tone. Avoid busy patterns, logos, and bright whites. For corporate headshots, stick to professional attire. I recommend getting camera-ready makeup done professionally or arriving with a polished, natural look.',
    },
    {
      question: 'How long does a headshot session take?',
      answer:
        'Most headshot sessions run 30-60 minutes depending on the package. This gives us time to capture multiple looks and expressions. I recommend arriving 10-15 minutes early to settle in and review any styling details.',
    },
    {
      question: 'Can I get my headshots retouched?',
      answer:
        'Yes! All packages include professional retouching. I focus on natural enhancements like skin smoothing, under-eye correction, and minor blemish removal while keeping you looking authentically you.',
    },
    {
      question: 'Do you offer team or corporate headshot packages?',
      answer:
        'Absolutely! I offer on-location sessions for businesses needing consistent headshots across their team. Contact me for custom corporate pricing based on team size and location requirements.',
    },
  ],
  'branding-commercial': [
    {
      question:
        'What is branding photography and how is it different from headshots?',
      answer:
        'Branding photography tells your business story through a variety of images showing you in action, your workspace, products, and lifestyle. While headshots focus on your face, branding sessions capture the full essence of your brand for use across your website, social media, and marketing materials.',
    },
    {
      question: 'How should I prepare for a branding session?',
      answer:
        "Start by defining your brand's visual style and the feeling you want to convey. Prepare 3-5 outfits that align with your brand colors. Gather any props, products, or tools you use in your work. I'll send a detailed questionnaire to help plan locations and shot list.",
    },
    {
      question: 'Can you photograph my products as part of the session?',
      answer:
        "Yes! Product photography can be incorporated into branding sessions. Whether it's lifestyle product shots or more styled images, we can create content that showcases your offerings alongside your personal brand.",
    },
    {
      question: 'How many images will I receive from a branding session?',
      answer:
        'This varies by package, typically ranging from 25-75+ fully edited images. The goal is to provide you with a diverse library of content for all your marketing needs, from hero images to social media posts.',
    },
  ],
  'lifestyle-family': [
    {
      question: "What if my kids won't cooperate during the session?",
      answer:
        "Don't worry! I specialize in working with children and know how to capture genuine moments through play and interaction. Some of the best photos come from letting kids be themselves. I recommend scheduling during their best mood time and bringing snacks.",
    },
    {
      question: 'Can we bring our pets to the session?',
      answer:
        "Of course! Pets are family too. Let me know in advance so I can plan extra time and choose a pet-friendly location. Bring treats and a handler if possible to help get your pet's attention during photos.",
    },
    {
      question: 'What locations work best for family sessions?',
      answer:
        "I love outdoor locations with beautiful natural light - parks, beaches, fields, or even your own backyard. The best location is one where your family feels comfortable and relaxed. I'm happy to suggest spots based on the season and your style preferences.",
    },
    {
      question: 'How far in advance should I book a family session?',
      answer:
        'For popular seasons like fall and the holidays, I recommend booking 4-6 weeks in advance. Spring and summer weekends also fill quickly. For a specific date or milestone event, reach out as early as possible to secure your spot.',
    },
  ],
  'creative-specialty': [
    {
      question: 'What should I expect during an underwater session?',
      answer:
        "Underwater sessions are magical but require preparation. You'll need to be comfortable in water and able to hold your breath for short periods. I'll guide you through poses and expressions before we get in the pool. Waterproof makeup is recommended, and I provide all necessary equipment.",
    },
    {
      question: 'How should I prepare for a boudoir session?',
      answer:
        'The most important thing is to feel confident and comfortable. Avoid tight clothing that might leave marks for a few hours before. Bring outfits that make you feel beautiful - this could be lingerie, oversized sweaters, or anything in between. Professional hair and makeup is highly recommended.',
    },
    {
      question: 'Can you help me plan a creative concept or theme?',
      answer:
        "Absolutely! I love collaborating on creative concepts. Whether you have a vision in mind or need inspiration, we'll work together to develop a unique concept. I can connect you with stylists, makeup artists, and prop resources to bring elaborate ideas to life.",
    },
    {
      question: 'Are fantasy and fine art sessions available for couples?',
      answer:
        'Yes! Couples fantasy and fine art sessions create stunning, artistic imagery that celebrates your connection. These sessions are perfect for anniversaries, engagement celebrations, or just creating unique art together.',
    },
  ],
}

async function seedServiceFaqs() {
  console.log('Seeding service FAQs...\n')

  // Get all services
  const services = await prisma.service.findMany({
    select: { id: true, slug: true, name: true },
  })

  for (const service of services) {
    const faqs = serviceFaqs[service.slug]
    if (!faqs) {
      console.log(`No FAQs defined for ${service.name}, skipping...`)
      continue
    }

    console.log(`\nProcessing ${service.name}...`)

    // Check for existing FAQs to avoid duplicates
    const existingFaqs = await prisma.faq.findMany({
      where: { serviceId: service.id },
      select: { question: true },
    })
    const existingQuestions = new Set(
      existingFaqs.map((f) => f.question.toLowerCase())
    )

    let added = 0
    for (let i = 0; i < faqs.length; i++) {
      const faq = faqs[i]

      // Skip if question already exists
      if (existingQuestions.has(faq.question.toLowerCase())) {
        console.log(
          `  - Skipping existing: "${faq.question.substring(0, 40)}..."`
        )
        continue
      }

      await prisma.faq.create({
        data: {
          question: faq.question,
          answer: tiptapParagraph(faq.answer),
          category: 'GENERAL',
          serviceId: service.id,
          sortOrder: (i + 1) * 10,
          isActive: true,
        },
      })
      console.log(`  + Added: "${faq.question.substring(0, 50)}..."`)
      added++
    }

    console.log(`  Total added: ${added}`)
  }

  console.log('\nDone!')
}

seedServiceFaqs()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
