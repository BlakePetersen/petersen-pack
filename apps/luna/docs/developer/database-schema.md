# Database Schema

## Overview

Luna uses PostgreSQL as the database with Prisma ORM for type-safe database access.

**Location**: `prisma/schema.prisma`

## Entity Relationship Diagram

```
User
├─┬─ Session (1:N)
│ └─ ClientGallery (1:N)
│
Gallery
├─┬─ Image (1:N)
│ └─ coverImage (1:1 optional)
│
ClientGallery
└─── ClientImage (1:N)

AvailabilitySlot
└─── Booking (1:N)

Inquiry (standalone)
```

## Models

### User

Represents both admin users and clients.

```prisma
model User {
  id              String           @id @default(cuid())
  email           String           @unique
  password        String
  name            String?
  role            Role             @default(CLIENT)
  sessions        Session[]
  clientGalleries ClientGallery[]
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
}
```

**Fields**:

- `id`: Unique identifier (CUID)
- `email`: User's email (unique, used for login)
- `password`: Bcrypt-hashed password (10 salt rounds)
- `name`: Optional display name
- `role`: Either `ADMIN` or `CLIENT`
- `sessions`: Related session records (NextAuth)
- `clientGalleries`: Private galleries assigned to this user
- `createdAt`: Account creation timestamp
- `updatedAt`: Last modification timestamp

**Indexes**:

- Unique on `email`

**Usage**:

- Admin users: Access admin dashboard, manage content
- Client users: Access private client galleries

---

### Session

NextAuth.js session management.

```prisma
model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**Fields**:

- `id`: Session identifier
- `sessionToken`: Unique token stored in cookie
- `userId`: Reference to authenticated user
- `expires`: Session expiration timestamp
- `user`: Related user record

**Indexes**:

- Unique on `sessionToken`

**Cascade Behavior**:

- Deleting user deletes all their sessions

---

### Gallery

Public portfolio galleries.

```prisma
model Gallery {
  id           String   @id @default(cuid())
  title        String
  slug         String   @unique
  description  String?  @db.Text
  shootType    String?
  featured     Boolean  @default(false)
  sortOrder    Int      @default(0)
  coverImageId String?
  images       Image[]
  coverImage   Image?   @relation("CoverImage", fields: [coverImageId], references: [id])
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

**Fields**:

- `id`: Gallery identifier
- `title`: Gallery name (e.g., "Summer Weddings 2024")
- `slug`: URL-friendly identifier (unique, e.g., "summer-weddings-2024")
- `description`: Optional long-form description
- `shootType`: Category (e.g., "WEDDING", "PORTRAIT", "COMMERCIAL")
- `featured`: Whether to display on homepage
- `sortOrder`: Manual ordering (lower = earlier)
- `coverImageId`: Optional cover image reference
- `images`: All images in this gallery
- `coverImage`: The designated cover image
- `createdAt`: Gallery creation timestamp
- `updatedAt`: Last modification timestamp

**Indexes**:

- Unique on `slug`

**Relationships**:

- One-to-many with `Image`
- Self-referential one-to-one with `Image` (cover)

**Cascade Behavior**:

- Deleting gallery deletes all images

---

### Image

Images within public galleries.

```prisma
model Image {
  id              String    @id @default(cuid())
  url             String
  publicId        String?
  width           Int?
  height          Int?
  altText         String?
  sortOrder       Int       @default(0)
  galleryId       String
  gallery         Gallery   @relation(fields: [galleryId], references: [id], onDelete: Cascade)
  coverImageFor   Gallery[] @relation("CoverImage")
  createdAt       DateTime  @default(now())
}
```

**Fields**:

- `id`: Image identifier
- `url`: File path (e.g., "/uploads/12345-image.webp")
- `publicId`: Optional external storage ID (Vercel Blob, Cloudinary)
- `width`: Image width in pixels
- `height`: Image height in pixels
- `altText`: Accessibility description
- `sortOrder`: Order within gallery (lower = earlier)
- `galleryId`: Parent gallery reference
- `gallery`: Related gallery
- `coverImageFor`: Galleries using this as cover
- `createdAt`: Upload timestamp

**Indexes**:

- Foreign key on `galleryId`

**Cascade Behavior**:

- Deleting parent gallery deletes image

**Storage**:

- Local: `/public/uploads/` directory
- Optional: Vercel Blob (url would be CDN URL)

---

### ClientGallery

Private photo delivery galleries for clients.

```prisma
model ClientGallery {
  id        String        @id @default(cuid())
  title     String
  slug      String        @unique
  clientId  String
  client    User          @relation(fields: [clientId], references: [id], onDelete: Cascade)
  images    ClientImage[]
  expiresAt DateTime?
  password  String?
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt
}
```

**Fields**:

- `id`: Gallery identifier
- `title`: Gallery name (e.g., "Smith Wedding Delivery")
- `slug`: URL-friendly identifier (unique)
- `clientId`: User who can access this gallery
- `client`: Related client user
- `images`: Photos in this gallery
- `expiresAt`: Optional expiration timestamp
- `password`: Optional bcrypt-hashed password (additional protection)
- `createdAt`: Gallery creation timestamp
- `updatedAt`: Last modification timestamp

**Indexes**:

- Unique on `slug`
- Foreign key on `clientId`

**Access Control**:

- Only assigned client can view (enforced in middleware)
- Admin can view all
- Optional password adds extra protection layer

**Cascade Behavior**:

- Deleting client deletes their galleries
- Deleting gallery deletes all images

---

### ClientImage

Images in client galleries with client interaction tracking.

```prisma
model ClientImage {
  id              String        @id @default(cuid())
  url             String
  publicId        String?
  width           Int?
  height          Int?
  altText         String?
  sortOrder       Int           @default(0)
  isFavorite      Boolean       @default(false)
  downloaded      Boolean       @default(false)
  downloadedAt    DateTime?
  clientGalleryId String
  clientGallery   ClientGallery @relation(fields: [clientGalleryId], references: [id], onDelete: Cascade)
  createdAt       DateTime      @default(now())
}
```

**Fields**:

- `id`: Image identifier
- `url`: File path
- `publicId`: Optional external storage ID
- `width`: Image width in pixels
- `height`: Image height in pixels
- `altText`: Accessibility description
- `sortOrder`: Order within gallery
- `isFavorite`: Client marked as favorite
- `downloaded`: Whether client downloaded
- `downloadedAt`: Download timestamp
- `clientGalleryId`: Parent gallery reference
- `clientGallery`: Related gallery
- `createdAt`: Upload timestamp

**Indexes**:

- Foreign key on `clientGalleryId`

**Client Features**:

- Mark favorites (useful for ordering prints)
- Track downloads
- Filter by favorites

**Cascade Behavior**:

- Deleting parent gallery deletes image

---

### AvailabilitySlot

Available time slots for booking.

```prisma
model AvailabilitySlot {
  id          String    @id @default(cuid())
  date        DateTime
  startTime   String
  endTime     String
  notes       String?   @db.Text
  isAvailable Boolean   @default(true)
  bookings    Booking[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

**Fields**:

- `id`: Slot identifier
- `date`: Date of availability (date portion only)
- `startTime`: Start time (HH:MM format)
- `endTime`: End time (HH:MM format)
- `notes`: Optional notes (e.g., "Limited outdoor locations")
- `isAvailable`: Whether slot is bookable
- `bookings`: Booking requests for this slot
- `createdAt`: Slot creation timestamp
- `updatedAt`: Last modification timestamp

**Usage**:

- Admin creates slots for open dates
- Public booking page shows available slots
- Multiple bookings can reference same slot (pending approval)
- Admin can mark slot as unavailable once booked

---

### Booking

Client booking requests.

```prisma
model Booking {
  id                 String           @id @default(cuid())
  availabilitySlotId String
  availabilitySlot   AvailabilitySlot @relation(fields: [availabilitySlotId], references: [id])
  name               String
  email              String
  phone              String?
  serviceType        String
  sessionDuration    Int
  message            String?          @db.Text
  status             BookingStatus    @default(PENDING)
  createdAt          DateTime         @default(now())
  updatedAt          DateTime         @updatedAt
}
```

**Fields**:

- `id`: Booking identifier
- `availabilitySlotId`: Requested time slot
- `availabilitySlot`: Related availability slot
- `name`: Client name
- `email`: Client email
- `phone`: Optional phone number
- `serviceType`: Type of session (e.g., "WEDDING", "PORTRAIT")
- `sessionDuration`: Hours requested (1-8)
- `message`: Optional client message/notes
- `status`: Current status (enum)
- `createdAt`: Request timestamp
- `updatedAt`: Last status change timestamp

**Status Flow**:

```
PENDING → CONFIRMED or CANCELLED
       ↓
   COMPLETED
```

**Indexes**:

- Foreign key on `availabilitySlotId`

**Email Notifications**:

- Created: Notify admin + confirm to client
- Status change: Notify client

---

### Inquiry

Contact form submissions.

```prisma
model Inquiry {
  id               String        @id @default(cuid())
  name             String
  email            String
  phone            String?
  message          String        @db.Text
  preferredContact String?
  status           InquiryStatus @default(NEW)
  createdAt        DateTime      @default(now())
  updatedAt        DateTime      @updatedAt
}
```

**Fields**:

- `id`: Inquiry identifier
- `name`: Contact name
- `email`: Contact email
- `phone`: Optional phone number
- `message`: Inquiry message
- `preferredContact`: Preferred contact method ("email" or "phone")
- `status`: Current status (enum)
- `createdAt`: Submission timestamp
- `updatedAt`: Last status change timestamp

**Status Flow**:

```
NEW → CONTACTED → CONVERTED or CLOSED
```

**Email Notifications**:

- Created: Notify admin + confirm to sender

---

## Enums

### Role

User role enumeration.

```prisma
enum Role {
  ADMIN
  CLIENT
}
```

**Values**:

- `ADMIN`: Full access to admin dashboard
- `CLIENT`: Access only to assigned client galleries

---

### BookingStatus

Booking request status.

```prisma
enum BookingStatus {
  PENDING
  CONFIRMED
  CANCELLED
  COMPLETED
}
```

**Values**:

- `PENDING`: Newly submitted, awaiting admin review
- `CONFIRMED`: Admin has confirmed the booking
- `CANCELLED`: Booking was cancelled (by admin or client)
- `COMPLETED`: Session has been completed

---

### InquiryStatus

Inquiry/contact form status.

```prisma
enum InquiryStatus {
  NEW
  CONTACTED
  CONVERTED
  CLOSED
}
```

**Values**:

- `NEW`: Newly submitted, not yet contacted
- `CONTACTED`: Admin has reached out
- `CONVERTED`: Converted to booking/client
- `CLOSED`: Closed without conversion

---

## Indexes & Performance

### Unique Constraints

- `User.email`: Prevent duplicate accounts
- `Session.sessionToken`: Session lookup
- `Gallery.slug`: URL uniqueness
- `ClientGallery.slug`: URL uniqueness

### Foreign Keys

All relations have automatic foreign key indexes:

- `Session.userId`
- `Image.galleryId`
- `ClientImage.clientGalleryId`
- `ClientGallery.clientId`
- `Booking.availabilitySlotId`

### Recommended Additional Indexes

For production performance, consider:

```prisma
@@index([createdAt])           // On Gallery, Booking, Inquiry
@@index([status])              // On Booking, Inquiry
@@index([featured, sortOrder]) // On Gallery
@@index([date, isAvailable])   // On AvailabilitySlot
```

---

## Cascade Behaviors

### On Delete Cascade

- Deleting `User` → deletes `Session` and `ClientGallery`
- Deleting `Gallery` → deletes `Image`
- Deleting `ClientGallery` → deletes `ClientImage`

### No Cascade (Protected)

- Deleting `AvailabilitySlot` with `Booking` → should fail (business logic)

---

## Migrations

### Creating Migrations

```bash
# After schema changes
npm run db:migrate -- --name description_of_change
```

### Migration Files

Location: `prisma/migrations/`

Each migration creates a timestamped directory:

```
prisma/migrations/
└── 20240101000000_initial_schema/
    └── migration.sql
```

### Applying Migrations

```bash
# Development (push without migration files)
npm run db:push

# Production (apply all pending migrations)
npx prisma migrate deploy
```

### Resetting Database

```bash
# Development only - DELETES ALL DATA
npm run db:push -- --force-reset
npm run db:seed
```

---

## Seeding

### Seed Script

Location: `prisma/seed.ts`

Creates:

- Admin user (admin@example.com / admin123)
- Sample galleries
- Sample images

**Run**:

```bash
npm run db:seed
```

---

## Prisma Client Usage

### Import

```typescript
import { prisma } from '@/lib/prisma'
```

### Singleton Pattern

```typescript
// lib/prisma.ts
const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

**Why**: Prevents multiple instances in development hot reload

---

## Common Queries

### Find User by Email

```typescript
const user = await prisma.user.findUnique({
  where: { email: 'user@example.com' },
})
```

### Get Gallery with Images

```typescript
const gallery = await prisma.gallery.findUnique({
  where: { slug: 'wedding-2024' },
  include: {
    images: {
      orderBy: { sortOrder: 'asc' },
    },
  },
})
```

### Create Booking with Slot

```typescript
const booking = await prisma.booking.create({
  data: {
    name: 'John Doe',
    email: 'john@example.com',
    serviceType: 'WEDDING',
    sessionDuration: 4,
    availabilitySlotId: slotId,
  },
  include: {
    availabilitySlot: true,
  },
})
```

### Update Inquiry Status

```typescript
await prisma.inquiry.update({
  where: { id: inquiryId },
  data: { status: 'CONTACTED' },
})
```

---

## Best Practices

### Type Safety

Prisma generates TypeScript types automatically:

```typescript
import { User, Gallery, BookingStatus } from '@prisma/client';

// Types are automatically inferred
const user: User = await prisma.user.findUnique(...);
```

### Select vs Include

```typescript
// Include: Add related data
const gallery = await prisma.gallery.findUnique({
  include: { images: true },
})

// Select: Choose specific fields
const gallery = await prisma.gallery.findUnique({
  select: {
    title: true,
    slug: true,
    images: { select: { url: true } },
  },
})
```

### Transactions

For atomic operations:

```typescript
await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({ data: userData })
  const gallery = await tx.clientGallery.create({
    data: { ...galleryData, clientId: user.id },
  })
  return { user, gallery }
})
```

### Connection Management

Prisma manages connection pooling automatically. Close in serverless:

```typescript
// Usually not needed with Next.js
await prisma.$disconnect()
```

---

## Schema Evolution

### Adding Fields

1. Add to `schema.prisma`:

   ```prisma
   model Gallery {
     // ...
     newField String?
   }
   ```

2. Create migration:

   ```bash
   npm run db:migrate -- --name add_new_field
   ```

3. Update code to use new field

### Renaming Fields

Use Prisma migrate with `@map`:

```prisma
model Gallery {
  description String? @map("desc") @db.Text
}
```

Or create migration manually.

### Removing Fields

1. Remove from `schema.prisma`
2. Create migration (data will be lost)
3. Review SQL before applying

---

## Related Documentation

- [Prisma Docs](https://www.prisma.io/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [API Reference](./api-reference.md) - How schema maps to APIs
- [Development Guide](./development.md) - Working with database in code
