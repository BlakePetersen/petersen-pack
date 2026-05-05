# Contract & Payment System Design

**Date:** November 12, 2025
**Status:** Approved
**Author:** Claude (with Blake)

## Overview

This design adds contract signing and payment processing to the photography business website, enabling Ashley to send contracts, collect deposits, manage final payments, and enforce usage rights and deliverable limits.

## Business Requirements

### Core Workflow

1. Ashley creates and sends contracts to clients
2. Clients sign contracts and pay deposit via Stripe
3. After shoot, Ashley uploads gallery for client review
4. Clients view watermarked low-res previews, select favorites, request retouches
5. Ashley reviews and approves retouch requests
6. Clients pay final balance (including extra retouches if applicable)
7. Clients download high-res images within contract limits

### Key Features

- Contract templates with customizable variables per client
- In-app signature capture (typed or drawn)
- Stripe payment integration for deposits and final payments
- Tiered usage rights (personal, commercial, etc.)
- Watermarked preview images before final payment
- Download quota and file size enforcement
- Premium "exclusive club" gallery theme after payment
- 30-day gallery expiration with admin extension capability

## Database Schema

### New Models

#### Contract

```prisma
model Contract {
  id                    String            @id @default(cuid())
  clientId              String
  inquiryId             String?           // Optional link to inquiry
  bookingId             String?           // Optional link to booking

  // Shoot details
  shootType             String
  shootDate             DateTime
  shootLocation         String
  sessionDuration       String
  deliverablesDescription String

  // Pricing
  totalAmount           Int               // In cents
  depositAmount         Int               // In cents
  retouchesIncluded     Int
  pricePerExtraRetouch  Int               // In cents
  downloadQuota         Int
  maxFileSizePx         Int               // Max longest edge in pixels

  // Signature
  signedAt              DateTime?
  signatureType         String?           // TYPED or DRAWN
  signatureData         String?           // Name for typed, base64 for drawn
  signatureIpAddress    String?
  signedPdfUrl          String?

  // Status
  status                ContractStatus    @default(DRAFT)
  sentAt                DateTime?
  expiresAt             DateTime?

  createdAt             DateTime          @default(now())
  updatedAt             DateTime          @updatedAt

  client                User              @relation(fields: [clientId], references: [id])
  payments              Payment[]
  usageRights           ContractUsageRight[]
  clientGalleries       ClientGallery[]

  @@index([clientId])
  @@index([status])
}

enum ContractStatus {
  DRAFT
  SENT
  SIGNED
  EXPIRED
}
```

#### UsageRight

```prisma
model UsageRight {
  id          String   @id @default(cuid())
  name        String   @unique
  slug        String   @unique
  description String
  price       Int      // In cents, 0 for personal use
  sortOrder   Int      @default(0)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  contracts   ContractUsageRight[]

  @@index([sortOrder])
}

model ContractUsageRight {
  contractId     String
  usageRightId   String

  contract       Contract    @relation(fields: [contractId], references: [id], onDelete: Cascade)
  usageRight     UsageRight  @relation(fields: [usageRightId], references: [id], onDelete: Cascade)

  @@id([contractId, usageRightId])
}
```

#### Payment

```prisma
model Payment {
  id                    String         @id @default(cuid())
  contractId            String
  clientGalleryId       String?

  type                  PaymentType
  amount                Int            // In cents
  status                PaymentStatus  @default(PENDING)

  stripePaymentIntentId String?        @unique
  stripeReceiptUrl      String?

  createdAt             DateTime       @default(now())
  updatedAt             DateTime       @updatedAt

  contract              Contract       @relation(fields: [contractId], references: [id])

  @@index([contractId])
  @@index([status])
}

enum PaymentType {
  DEPOSIT
  FINAL_BALANCE
  EXTRA_RETOUCHES
  ADDITIONAL_DOWNLOADS
}

enum PaymentStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  REFUNDED
}
```

#### ContractTemplate

```prisma
model ContractTemplate {
  id          String   @id @default(cuid())
  section     String   @unique  // copyright, cancellation, liability, etc.
  content     String   @db.Text
  sortOrder   Int      @default(0)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([sortOrder])
}
```

### Modified Models

#### ClientGallery (add fields)

```prisma
model ClientGallery {
  // ... existing fields ...

  contractId            String?
  downloadQuotaUsed     Int               @default(0)
  finalPaymentStatus    PaymentStatus?

  contract              Contract?         @relation(fields: [contractId], references: [id])
}
```

## Admin Workflow

### Contract Creation (`/admin/contracts/new`)

Multi-step form to create and send contracts:

**Step 1: Client Selection**

- Search existing clients or create new
- Optionally link to Inquiry or Booking
- Pre-fills client name and email

**Step 2: Shoot Details**

- Shoot type (dropdown)
- Date and location
- Session duration
- Deliverables description (textarea)

**Step 3: Pricing Configuration**

- Total package price
- Deposit amount (supports "$1,250" or "50%")
- Retouches included (number)
- Price per extra retouch
- Download quota
- Max file size (dropdown: 2000px, 3000px, 4000px, original)

**Step 4: Usage Rights**

- Checkbox list of available tiers
- Each shows name, description, price
- Selected tiers add to total price
- Must select at least one (default: Personal Use - $0)

**Step 5: Review & Send**

- Preview contract with all fields populated
- Save as Draft or Send to Client
- Sending creates PENDING deposit Payment record
- Email sent with contract link

### Retouch Approval (`/admin/client-galleries/[id]`)

After client requests retouches:

- Table showing all retouch requests with notes
- Approve/decline individual requests
- Adjust pricing for complex retouches
- "Approve All" button
- Email sent when approved with final payment amount

## Client Workflow

### Contract Signing (`/contract/[contractId]`)

**Page Layout:**

- Ashley's branding header
- Contract title with client name
- Status badge and key details

**Contract Body:**

- Populated contract text from templates
- Variable fields filled in
- Pricing breakdown table
- Deliverables summary

**Signature Section:**

- Two methods (client chooses):
  1. Typed signature: Text input + "I agree" checkbox
  2. Drawn signature: HTML canvas for drawing
- Legal text
- IP and timestamp captured automatically

**Payment:**

- "Pay Deposit" button launches Stripe Checkout
- On success:
  - Contract status → SIGNED
  - Payment → COMPLETED
  - Signed PDF generated and stored
  - Email confirmations sent

### Gallery Review (Before Payment)

**Preview Mode** (`/client/[slug]`):

- All images watermarked with "PROOF - [Client Name]"
- Diagonal across center
- Max 1200px longest edge
- Served via `/api/client-images/[imageId]/preview`

**Client Actions:**

- Mark favorites (limited by download quota)
- Request retouches with notes
- See retouch counter: "5 included, 3 used, 2 remaining"
- If over limit: "2 extra @ $100 each = $200"

**Final Payment Banner:**

- Persistent at top
- Shows total due with breakdown
- Countdown timer to expiration
- "Pay Now" button

### Post-Payment Premium Experience

**Visual Transformation:**

After final payment, gallery receives luxury redesign:

**Color Scheme:**

- Background: Deep black (#0a0a0a) or pure white (#ffffff)
- Accent: Champagne gold (#d4af37)
- Secondary: Rose gold (#b76e79)

**UI Elements:**

- Thin gold borders with subtle glow
- Metallic shimmer animation on hover
- Glint effect sweeps across borders
- Serif fonts for headings (Playfair Display)
- Gold gradient download buttons

**Animations:**

- Entrance fade-in with scale
- Periodic border shimmer (every 8-10s)
- Hover lift transform
- Gold particle effect on quota updates

**Welcome Message:**

- "Your Collection Awaits" with gold accent
- Download quota display
- Expiration countdown

**Download Access:**

- No watermarks
- Full resolution up to contract max
- Download button on each image
- Quota tracker: "47 downloads remaining"
- Each download logged with timestamp and IP
- Upsell when quota exhausted

## Technical Implementation

### Stripe Integration

**Deposit Payment:**

1. Client signs → Create Stripe Checkout Session
2. Metadata: `{ type: 'DEPOSIT', contractId, userId, amount }`
3. Success redirect: `/contract/[id]/success`
4. Webhook (`/api/webhooks/stripe`):
   - Verify signature
   - On `checkout.session.completed`:
     - Create Payment (COMPLETED)
     - Update Contract to SIGNED
     - Generate signed PDF
     - Send emails

**Final Payment:**

1. Click "Pay Now" → Calculate total
2. Checkout Session metadata: `{ type: 'FINAL_BALANCE', contractId, clientGalleryId }`
3. Webhook updates ClientGallery.finalPaymentStatus = PAID
4. Triggers premium theme
5. Sends confirmation email

### Image Watermarking

**Preview API** (`/api/client-images/[imageId]/preview`):

- Uses Sharp library
- Fetches original from storage
- Resizes to 1200px max
- Composites diagonal text: "PROOF - [Client Name]"
- Returns buffer
- Caches result

**Download API** (`/api/client-images/[imageId]/download`):

- Validates final payment status
- Checks download quota
- Enforces usage rights
- Serves full resolution (up to contract max)
- Increments downloadQuotaUsed
- Logs download event

### PDF Generation

Uses Puppeteer or jsPDF to generate signed contract PDF:

- Renders contract with all fields
- Includes signature image
- Adds timestamp and IP
- Uploads to storage
- Stores URL in Contract.signedPdfUrl

## Edge Cases & Security

### Gallery Expiration

- Daily cron checks expiresAt
- Expired galleries become view-only
- Client sees: "Expired on [date]. Contact to extend."
- Admin dashboard shows expired list
- One-click extension: adds 7/14/30 days

### Failed Payments

- Payment status = FAILED
- Client sees error with retry
- After 3 attempts, admin notified
- Admin can send manual link or mark paid

### Contract Expiration

- Unsigned contracts expire after 30 days
- Status → EXPIRED
- Admin can reactivate with new date

### Security

- Contract URLs use secure tokens (not IDs)
- Gallery requires login OR password
- Download validates ownership
- Webhook signature verification
- Rate limiting on preview generation
- Signed PDF URLs expire

## Email Notifications

1. **Contract Sent** (client): Link, deposit amount, CTA
2. **Contract Signed** (both): PDF, shoot reminder
3. **Gallery Ready** (client): Link, expiration, payment due
4. **Retouches Reviewed** (client): Approved count, final total
5. **Final Payment Received** (both): Download instructions
6. **Gallery Expiring** (client): 7/3/1 days before, CTA to pay or extend

## Implementation Phases

### Phase 1: Core Contract System

- Database migration
- Admin contract creation UI
- Client signing page
- Stripe deposit integration
- Email notifications

### Phase 2: Gallery Integration

- Link contracts to galleries
- Watermark generation
- Retouch requests with pricing
- Expiration tracking

### Phase 3: Final Payment & Premium

- Admin retouch approval
- Final payment calculation
- Premium gallery theme
- Download quota enforcement

### Phase 4: Polish & Admin Tools

- Dashboard enhancements
- Usage rights in downloads
- Reporting
- Automated expiration handling

## Testing Strategy

- Unit: Payment calculations, quota enforcement, watermarking
- Integration: Stripe webhooks
- E2E (Playwright): Full contract flow, retouches, downloads
- Manual QA: Premium theme, animations

## Success Metrics

- Contract conversion rate (sent → signed)
- Average time to final payment
- Retouch upsell revenue
- Download quota utilization
- Client satisfaction with premium experience
