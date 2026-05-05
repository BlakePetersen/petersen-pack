# Services CMS Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform service pages into CMS-managed content with reusable content blocks

**Architecture:** Add Service model that owns URL/content, make PricingCategory belong to Service, create ProcessStep and InfoCard models with hybrid global/service-specific approach using join tables for ordering

**Tech Stack:** Next.js 15, Prisma ORM, PostgreSQL, TypeScript, Tailwind CSS

**Design Document:** `docs/plans/2025-11-15-services-cms-design.md`

---

## Phase 1: Database Schema

### Task 1: Add Prisma Models

**Files:**

- Modify: `prisma/schema.prisma`

**Step 1: Add Service model**

Add after the PricingCategory model:

```prisma
model Service {
  id              String   @id @default(cuid())
  name            String
  slug            String   @unique
  description     String   @db.Text
  heroImage       String?
  isActive        Boolean  @default(true)
  sortOrder       Int      @default(0)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  pricingCategories PricingCategory[]
  processSteps      ServiceProcessStep[]
  infoCards         ServiceInfoCard[]
}
```

**Step 2: Add serviceId to PricingCategory**

In the PricingCategory model, add:

```prisma
model PricingCategory {
  id          String   @id @default(cuid())
  serviceId   String?  // Nullable during migration
  name        String
  description String   @db.Text
  slug        String   @unique  // Will remove later
  sortOrder   Int      @default(0)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  service  Service?          @relation(fields: [serviceId], references: [id], onDelete: Cascade)
  packages PricingPackage[]
}
```

**Step 3: Add ProcessStep model**

```prisma
model ProcessStep {
  id         String   @id @default(cuid())
  title      String
  content    String   @db.Text
  stepNumber Int
  icon       String?
  isGlobal   Boolean  @default(false)
  serviceId  String?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  service  Service?             @relation(fields: [serviceId], references: [id], onDelete: Cascade)
  services ServiceProcessStep[]
}
```

**Step 4: Add InfoCard model**

```prisma
model InfoCard {
  id            String   @id @default(cuid())
  title         String
  content       String   @db.Text
  icon          String
  customIconSvg String?  @db.Text
  isGlobal      Boolean  @default(false)
  serviceId     String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  service  Service?          @relation(fields: [serviceId], references: [id], onDelete: Cascade)
  services ServiceInfoCard[]
}
```

**Step 5: Add join tables**

```prisma
model ServiceProcessStep {
  id            String @id @default(cuid())
  serviceId     String
  processStepId String
  sortOrder     Int

  service     Service     @relation(fields: [serviceId], references: [id], onDelete: Cascade)
  processStep ProcessStep @relation(fields: [processStepId], references: [id], onDelete: Cascade)

  @@unique([serviceId, processStepId])
}

model ServiceInfoCard {
  id         String @id @default(cuid())
  serviceId  String
  infoCardId String
  sortOrder  Int

  service  Service  @relation(fields: [serviceId], references: [id], onDelete: Cascade)
  infoCard InfoCard @relation(fields: [infoCardId], references: [id], onDelete: Cascade)

  @@unique([serviceId, infoCardId])
}
```

**Step 6: Create and apply migration**

```bash
pnpm prisma migrate dev --name add_services_cms
```

Expected: Migration created and applied successfully

**Step 7: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat: add Services CMS database models

- Add Service model with slug, description, heroImage
- Add ProcessStep and InfoCard models with global/service-specific support
- Add join tables for many-to-many with ordering
- Add serviceId to PricingCategory (nullable during migration)
- Keep PricingCategory slug temporarily for migration

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 2: Seed Initial Content Blocks

**Files:**

- Create: `prisma/seeds/service-content-blocks.ts`
- Modify: `prisma/seed.ts`

**Step 1: Create content blocks seed file**

Create `prisma/seeds/service-content-blocks.ts`:

```typescript
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
```

**Step 2: Update main seed file**

In `prisma/seed.ts`, import and call the new seeder:

```typescript
import { seedServiceContentBlocks } from './seeds/service-content-blocks'

// In the main seed function, add:
await seedServiceContentBlocks()
```

**Step 3: Run seed**

```bash
pnpm prisma db seed
```

Expected: Content blocks seeded successfully

**Step 4: Commit**

```bash
git add prisma/seeds/service-content-blocks.ts prisma/seed.ts
git commit -m "feat: seed global service content blocks

- Extract hardcoded process steps from service detail page
- Extract hardcoded info cards from service detail page
- Create as global blocks available to all services

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Phase 2: Content Library APIs

### Task 3: ProcessStep API Routes

**Files:**

- Create: `app/api/admin/content/process-steps/route.ts`
- Create: `app/api/admin/content/process-steps/[id]/route.ts`
- Create: `app/api/admin/content/process-steps/[id]/make-global/route.ts`

**Step 1: Create ProcessStep list/create API**

Create `app/api/admin/content/process-steps/route.ts`:

```typescript
// ABOUTME: API routes for managing process steps
// ABOUTME: Handles listing all steps and creating new global steps

import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const serviceId = searchParams.get('serviceId')

    // Get global steps and service-specific steps for the given service
    const where = serviceId
      ? { OR: [{ isGlobal: true }, { serviceId }] }
      : { isGlobal: true }

    const steps = await prisma.processStep.findMany({
      where,
      orderBy: { stepNumber: 'asc' },
      include: {
        services: {
          include: {
            service: {
              select: { id: true, name: true },
            },
          },
        },
      },
    })

    return NextResponse.json(steps)
  } catch (error) {
    console.error('Error fetching process steps:', error)
    return NextResponse.json(
      { error: 'Failed to fetch process steps' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = await request.json()
    const { title, content, stepNumber, icon, isGlobal, serviceId } = data

    if (!title || !content || stepNumber === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const step = await prisma.processStep.create({
      data: {
        title,
        content,
        stepNumber,
        icon,
        isGlobal: isGlobal ?? false,
        serviceId: isGlobal ? null : serviceId,
      },
    })

    return NextResponse.json(step, { status: 201 })
  } catch (error) {
    console.error('Error creating process step:', error)
    return NextResponse.json(
      { error: 'Failed to create process step' },
      { status: 500 }
    )
  }
}
```

**Step 2: Create ProcessStep update/delete API**

Create `app/api/admin/content/process-steps/[id]/route.ts`:

```typescript
// ABOUTME: API routes for individual process step operations
// ABOUTME: Handles updating and deleting process steps

import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const data = await request.json()
    const { title, content, stepNumber, icon } = data

    const step = await prisma.processStep.update({
      where: { id },
      data: {
        title,
        content,
        stepNumber,
        icon,
      },
    })

    return NextResponse.json(step)
  } catch (error) {
    console.error('Error updating process step:', error)
    return NextResponse.json(
      { error: 'Failed to update process step' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params

    // Check if step is in use
    const usage = await prisma.serviceProcessStep.count({
      where: { processStepId: id },
    })

    if (usage > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete step that is used by ${usage} service(s)`,
        },
        { status: 400 }
      )
    }

    await prisma.processStep.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting process step:', error)
    return NextResponse.json(
      { error: 'Failed to delete process step' },
      { status: 500 }
    )
  }
}
```

**Step 3: Create make-global API**

Create `app/api/admin/content/process-steps/[id]/make-global/route.ts`:

```typescript
// ABOUTME: API route to convert service-specific step to global
// ABOUTME: Removes serviceId association and sets isGlobal flag

import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params

    const step = await prisma.processStep.update({
      where: { id },
      data: {
        isGlobal: true,
        serviceId: null,
      },
    })

    return NextResponse.json(step)
  } catch (error) {
    console.error('Error making step global:', error)
    return NextResponse.json(
      { error: 'Failed to make step global' },
      { status: 500 }
    )
  }
}
```

**Step 4: Commit**

```bash
git add app/api/admin/content/process-steps/
git commit -m "feat: add ProcessStep API routes

- GET /api/admin/content/process-steps - list all steps
- POST /api/admin/content/process-steps - create step
- PUT /api/admin/content/process-steps/[id] - update step
- DELETE /api/admin/content/process-steps/[id] - delete (prevent if in use)
- POST /api/admin/content/process-steps/[id]/make-global - convert to global

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 4: InfoCard API Routes

**Files:**

- Create: `app/api/admin/content/info-cards/route.ts`
- Create: `app/api/admin/content/info-cards/[id]/route.ts`
- Create: `app/api/admin/content/info-cards/[id]/make-global/route.ts`

**Step 1: Create InfoCard list/create API**

Create `app/api/admin/content/info-cards/route.ts`:

```typescript
// ABOUTME: API routes for managing info cards
// ABOUTME: Handles listing all cards and creating new global cards

import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const serviceId = searchParams.get('serviceId')

    const where = serviceId
      ? { OR: [{ isGlobal: true }, { serviceId }] }
      : { isGlobal: true }

    const cards = await prisma.infoCard.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        services: {
          include: {
            service: {
              select: { id: true, name: true },
            },
          },
        },
      },
    })

    return NextResponse.json(cards)
  } catch (error) {
    console.error('Error fetching info cards:', error)
    return NextResponse.json(
      { error: 'Failed to fetch info cards' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = await request.json()
    const { title, content, icon, customIconSvg, isGlobal, serviceId } = data

    if (!title || !content || !icon) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const card = await prisma.infoCard.create({
      data: {
        title,
        content,
        icon,
        customIconSvg,
        isGlobal: isGlobal ?? false,
        serviceId: isGlobal ? null : serviceId,
      },
    })

    return NextResponse.json(card, { status: 201 })
  } catch (error) {
    console.error('Error creating info card:', error)
    return NextResponse.json(
      { error: 'Failed to create info card' },
      { status: 500 }
    )
  }
}
```

**Step 2: Create InfoCard update/delete API**

Create `app/api/admin/content/info-cards/[id]/route.ts`:

```typescript
// ABOUTME: API routes for individual info card operations
// ABOUTME: Handles updating and deleting info cards

import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const data = await request.json()
    const { title, content, icon, customIconSvg } = data

    const card = await prisma.infoCard.update({
      where: { id },
      data: {
        title,
        content,
        icon,
        customIconSvg,
      },
    })

    return NextResponse.json(card)
  } catch (error) {
    console.error('Error updating info card:', error)
    return NextResponse.json(
      { error: 'Failed to update info card' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params

    const usage = await prisma.serviceInfoCard.count({
      where: { infoCardId: id },
    })

    if (usage > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete card that is used by ${usage} service(s)`,
        },
        { status: 400 }
      )
    }

    await prisma.infoCard.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting info card:', error)
    return NextResponse.json(
      { error: 'Failed to delete info card' },
      { status: 500 }
    )
  }
}
```

**Step 3: Create make-global API**

Create `app/api/admin/content/info-cards/[id]/make-global/route.ts`:

```typescript
// ABOUTME: API route to convert service-specific card to global
// ABOUTME: Removes serviceId association and sets isGlobal flag

import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params

    const card = await prisma.infoCard.update({
      where: { id },
      data: {
        isGlobal: true,
        serviceId: null,
      },
    })

    return NextResponse.json(card)
  } catch (error) {
    console.error('Error making card global:', error)
    return NextResponse.json(
      { error: 'Failed to make card global' },
      { status: 500 }
    )
  }
}
```

**Step 4: Commit**

```bash
git add app/api/admin/content/info-cards/
git commit -m "feat: add InfoCard API routes

- GET /api/admin/content/info-cards - list all cards
- POST /api/admin/content/info-cards - create card
- PUT /api/admin/content/info-cards/[id] - update card
- DELETE /api/admin/content/info-cards/[id] - delete (prevent if in use)
- POST /api/admin/content/info-cards/[id]/make-global - convert to global

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Phase 3: Service APIs

### Task 5: Service CRUD API Routes

**Files:**

- Create: `app/api/admin/services/route.ts`
- Create: `app/api/admin/services/[id]/route.ts`

**Step 1: Create Service list/create API**

Create `app/api/admin/services/route.ts`:

```typescript
// ABOUTME: API routes for managing services
// ABOUTME: Handles listing, creating services with content block associations

import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const services = await prisma.service.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        pricingCategories: {
          include: {
            packages: true,
          },
        },
        processSteps: {
          include: {
            processStep: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
        infoCards: {
          include: {
            infoCard: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    })

    return NextResponse.json(services)
  } catch (error) {
    console.error('Error fetching services:', error)
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = await request.json()
    const {
      name,
      slug,
      description,
      heroImage,
      isActive,
      sortOrder,
      processStepIds,
      infoCardIds,
    } = data

    if (!name || !slug || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const service = await prisma.service.create({
      data: {
        name,
        slug,
        description,
        heroImage,
        isActive: isActive ?? true,
        sortOrder: sortOrder ?? 0,
        processSteps: {
          create: processStepIds?.map((id: string, index: number) => ({
            processStepId: id,
            sortOrder: index,
          })),
        },
        infoCards: {
          create: infoCardIds?.map((id: string, index: number) => ({
            infoCardId: id,
            sortOrder: index,
          })),
        },
      },
      include: {
        processSteps: {
          include: {
            processStep: true,
          },
        },
        infoCards: {
          include: {
            infoCard: true,
          },
        },
      },
    })

    return NextResponse.json(service, { status: 201 })
  } catch (error) {
    console.error('Error creating service:', error)
    return NextResponse.json(
      { error: 'Failed to create service' },
      { status: 500 }
    )
  }
}
```

**Step 2: Create Service update/delete API**

Create `app/api/admin/services/[id]/route.ts`:

```typescript
// ABOUTME: API routes for individual service operations
// ABOUTME: Handles updating and deleting services with content blocks

import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params

    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        pricingCategories: {
          include: {
            packages: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
        processSteps: {
          include: {
            processStep: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
        infoCards: {
          include: {
            infoCard: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    })

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    return NextResponse.json(service)
  } catch (error) {
    console.error('Error fetching service:', error)
    return NextResponse.json(
      { error: 'Failed to fetch service' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const data = await request.json()
    const {
      name,
      slug,
      description,
      heroImage,
      isActive,
      sortOrder,
      processStepIds,
      infoCardIds,
    } = data

    // Delete existing associations and recreate
    await prisma.serviceProcessStep.deleteMany({
      where: { serviceId: id },
    })
    await prisma.serviceInfoCard.deleteMany({
      where: { serviceId: id },
    })

    const service = await prisma.service.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        heroImage,
        isActive,
        sortOrder,
        processSteps: {
          create: processStepIds?.map((stepId: string, index: number) => ({
            processStepId: stepId,
            sortOrder: index,
          })),
        },
        infoCards: {
          create: infoCardIds?.map((cardId: string, index: number) => ({
            infoCardId: cardId,
            sortOrder: index,
          })),
        },
      },
      include: {
        processSteps: {
          include: {
            processStep: true,
          },
        },
        infoCards: {
          include: {
            infoCard: true,
          },
        },
      },
    })

    return NextResponse.json(service)
  } catch (error) {
    console.error('Error updating service:', error)
    return NextResponse.json(
      { error: 'Failed to update service' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params

    await prisma.service.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting service:', error)
    return NextResponse.json(
      { error: 'Failed to delete service' },
      { status: 500 }
    )
  }
}
```

**Step 3: Commit**

```bash
git add app/api/admin/services/
git commit -m "feat: add Service API routes

- GET /api/admin/services - list all services
- POST /api/admin/services - create service with content blocks
- GET /api/admin/services/[id] - get service details
- PUT /api/admin/services/[id] - update service and content blocks
- DELETE /api/admin/services/[id] - delete service

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Phase 4: Shared Components

### Task 6: IconPicker Component

**Files:**

- Create: `components/sol/admin/IconPicker.tsx`

**Step 1: Create IconPicker component**

Create `components/sol/admin/IconPicker.tsx`:

```typescript
// ABOUTME: Icon selection component with preset icons and custom SVG support
// ABOUTME: Used in InfoCardForm for selecting card icons

'use client'

import { useState } from 'react'

const PRESET_ICONS = [
  { value: 'calendar', label: 'Calendar' },
  { value: 'clock', label: 'Clock' },
  { value: 'location', label: 'Location' },
  { value: 'camera', label: 'Camera' },
  { value: 'users', label: 'Users' },
  { value: 'heart', label: 'Heart' },
  { value: 'star', label: 'Star' },
  { value: 'edit', label: 'Edit' },
  { value: 'image', label: 'Image' },
  { value: 'mail', label: 'Mail' },
  { value: 'phone', label: 'Phone' },
  { value: 'check', label: 'Check' },
  { value: 'info', label: 'Info' },
  { value: 'warning', label: 'Warning' },
  { value: 'dollar', label: 'Dollar' },
]

interface IconPickerProps {
  value: string
  onChange: (icon: string) => void
  customSvg?: string
  onCustomSvgChange?: (svg: string) => void
}

export default function IconPicker({
  value,
  onChange,
  customSvg,
  onCustomSvgChange,
}: IconPickerProps) {
  const [useCustom, setUseCustom] = useState(value === 'custom')

  const handleIconChange = (newValue: string) => {
    if (newValue === 'custom') {
      setUseCustom(true)
    } else {
      setUseCustom(false)
    }
    onChange(newValue)
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">Icon</label>
      <select
        value={useCustom ? 'custom' : value}
        onChange={(e) => handleIconChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
      >
        {PRESET_ICONS.map((icon) => (
          <option key={icon.value} value={icon.value}>
            {icon.label}
          </option>
        ))}
        <option value="custom">Custom SVG</option>
      </select>

      {useCustom && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">
            Custom SVG Code
          </label>
          <textarea
            value={customSvg || ''}
            onChange={(e) => onCustomSvgChange?.(e.target.value)}
            placeholder="Paste SVG code here"
            rows={6}
            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 font-mono text-sm focus:border-blue-500 focus:outline-none"
          />
          <p className="mt-1 text-xs text-gray-500">
            Paste complete SVG markup including the &lt;svg&gt; tag
          </p>
        </div>
      )}
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add components/sol/admin/IconPicker.tsx
git commit -m "feat: add IconPicker component

- Dropdown with preset icons (calendar, clock, location, etc.)
- Custom SVG option with textarea
- Used in InfoCardForm for icon selection

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 7: ProcessStepForm Component

**Files:**

- Create: `components/sol/admin/ProcessStepForm.tsx`

**Step 1: Create ProcessStepForm component**

Create `components/sol/admin/ProcessStepForm.tsx`:

```typescript
// ABOUTME: Form for creating and editing process steps
// ABOUTME: Used in content library admin and inline in ContentBlockSelector

'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

interface ProcessStepFormProps {
  step?: {
    id: string
    title: string
    content: string
    stepNumber: number
    icon?: string | null
    isGlobal: boolean
  }
  serviceId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export default function ProcessStepForm({
  step,
  serviceId,
  onSuccess,
  onCancel,
}: ProcessStepFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    title: step?.title || '',
    content: step?.content || '',
    stepNumber: step?.stepNumber || 1,
    icon: step?.icon || '',
    isGlobal: step?.isGlobal ?? !serviceId,
  })

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const url = step
        ? `/api/admin/content/process-steps/${step.id}`
        : '/api/admin/content/process-steps'
      const method = step ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          serviceId: formData.isGlobal ? null : serviceId,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save process step')
      }

      router.refresh()
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!step || !confirm('Delete this process step?')) return

    setIsSubmitting(true)
    try {
      const response = await fetch(
        `/api/admin/content/process-steps/${step.id}`,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete process step')
      }

      router.refresh()
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Content
        </label>
        <textarea
          value={formData.content}
          onChange={(e) =>
            setFormData({ ...formData, content: e.target.value })
          }
          required
          rows={4}
          className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Step Number
        </label>
        <input
          type="number"
          value={formData.stepNumber}
          onChange={(e) =>
            setFormData({ ...formData, stepNumber: parseInt(e.target.value) })
          }
          required
          min={1}
          className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Icon (optional)
        </label>
        <input
          type="text"
          value={formData.icon}
          onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
          placeholder="Icon name"
          className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
        />
      </div>

      {!step && (
        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isGlobal}
              onChange={(e) =>
                setFormData({ ...formData, isGlobal: e.target.checked })
              }
              className="h-4 w-4 rounded border-gray-300"
            />
            <span className="text-sm font-medium text-gray-700">
              Make this step available to all services
            </span>
          </label>
        </div>
      )}

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : step ? 'Update' : 'Create'}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-gray-300 px-6 py-3 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        )}

        {step && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isSubmitting}
            className="ml-auto rounded-lg bg-red-600 px-6 py-3 text-white hover:bg-red-700 disabled:opacity-50"
          >
            Delete
          </button>
        )}
      </div>
    </form>
  )
}
```

**Step 2: Commit**

```bash
git add components/sol/admin/ProcessStepForm.tsx
git commit -m "feat: add ProcessStepForm component

- Create and edit process steps
- Support for global vs service-specific steps
- Delete functionality with confirmation
- Used in content library and inline creation

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 8: InfoCardForm Component

**Files:**

- Create: `components/sol/admin/InfoCardForm.tsx`

**Step 1: Create InfoCardForm component**

Create `components/sol/admin/InfoCardForm.tsx`:

```typescript
// ABOUTME: Form for creating and editing info cards
// ABOUTME: Used in content library admin and inline in ContentBlockSelector

'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import IconPicker from './IconPicker'

interface InfoCardFormProps {
  card?: {
    id: string
    title: string
    content: string
    icon: string
    customIconSvg?: string | null
    isGlobal: boolean
  }
  serviceId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export default function InfoCardForm({
  card,
  serviceId,
  onSuccess,
  onCancel,
}: InfoCardFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    title: card?.title || '',
    content: card?.content || '',
    icon: card?.icon || 'info',
    customIconSvg: card?.customIconSvg || '',
    isGlobal: card?.isGlobal ?? !serviceId,
  })

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const url = card
        ? `/api/admin/content/info-cards/${card.id}`
        : '/api/admin/content/info-cards'
      const method = card ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          serviceId: formData.isGlobal ? null : serviceId,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save info card')
      }

      router.refresh()
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!card || !confirm('Delete this info card?')) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/admin/content/info-cards/${card.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete info card')
      }

      router.refresh()
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Content
        </label>
        <textarea
          value={formData.content}
          onChange={(e) =>
            setFormData({ ...formData, content: e.target.value })
          }
          required
          rows={4}
          className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
        />
      </div>

      <IconPicker
        value={formData.icon}
        onChange={(icon) => setFormData({ ...formData, icon })}
        customSvg={formData.customIconSvg}
        onCustomSvgChange={(svg) =>
          setFormData({ ...formData, customIconSvg: svg })
        }
      />

      {!card && (
        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isGlobal}
              onChange={(e) =>
                setFormData({ ...formData, isGlobal: e.target.checked })
              }
              className="h-4 w-4 rounded border-gray-300"
            />
            <span className="text-sm font-medium text-gray-700">
              Make this card available to all services
            </span>
          </label>
        </div>
      )}

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : card ? 'Update' : 'Create'}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-gray-300 px-6 py-3 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        )}

        {step && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isSubmitting}
            className="ml-auto rounded-lg bg-red-600 px-6 py-3 text-white hover:bg-red-700 disabled:opacity-50"
          >
            Delete
          </button>
        )}
      </div>
    </form>
  )
}
```

**Step 2: Commit**

```bash
git add components/sol/admin/InfoCardForm.tsx
git commit -m "feat: add InfoCardForm component

- Create and edit info cards with icon selection
- Support for global vs service-specific cards
- Delete functionality with confirmation
- Uses IconPicker for icon selection

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Phase 5: Service Management

Due to complexity, the remaining tasks (ContentBlockSelector, ServiceForm, admin pages, public pages, and migration) need to be broken down into smaller subtasks. This plan provides the foundation:

### Remaining Work

**Task 9-12:** Build ContentBlockSelector and ServiceForm components
**Task 13-16:** Create admin pages for content libraries and services
**Task 17-18:** Update public service pages to use Service model
**Task 19-20:** Create and run data migration script

Each of these should be broken into bite-sized subtasks following the same TDD pattern when implementing.

---

## Testing Strategy

For each component:

1. Write visual tests using Playwright
2. Test form validation
3. Test API integration
4. Test error states

For each API route:

1. Test unauthorized access returns 401
2. Test missing fields returns 400
3. Test successful operations
4. Test edge cases (delete in-use items, etc.)

---

## Notes

- All forms follow existing patterns (GalleryForm, TestimonialForm)
- All API routes follow existing auth/validation patterns
- Icon rendering will need SVG component mapping
- Migration must be idempotent
- Frequent commits after each working feature
