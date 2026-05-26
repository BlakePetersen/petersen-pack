# FAQ System Design

**Date:** 2025-11-26
**Status:** Approved for implementation
**Priority:** Phase 1 - Quick Win

---

## Overview

Implement a comprehensive FAQ system with database-driven content management. The system provides both general FAQs (accessible via `/faq` page) and service-specific FAQs (displayed on individual service pages).

---

## Database Schema

Add a single `Faq` model to handle both general and service-specific FAQs:

```prisma
model Faq {
  id          String      @id @default(cuid())
  question    String
  answer      Json        // TipTap JSON content
  category    FaqCategory
  serviceId   String?     // Nullable - null = general FAQ
  sortOrder   Int         @default(0)
  isActive    Boolean     @default(true)
  viewCount   Int         @default(0)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  service     Service?    @relation(fields: [serviceId], references: [id], onDelete: Cascade)

  @@index([serviceId])
  @@index([category])
  @@index([isActive])
  @@index([sortOrder])
}

enum FaqCategory {
  GENERAL
  BOOKING
  PRICING
  PROCESS
  POLICIES
}
```

**Key Design Decisions:**

- Single model handles both general and service-specific FAQs via nullable `serviceId`
- Rich text stored as JSON (TipTap format) for structured, safe content
- Built-in analytics via `viewCount` field
- Cascade delete removes service FAQs when parent service deleted
- Indexes on frequently filtered/sorted fields for performance

---

## Admin Interface

### Route Structure

- `/admin/faqs` - Main list view
- `/admin/faqs/new` - Create FAQ
- `/admin/faqs/[id]` - Edit FAQ

### List View (`/admin/faqs`)

**Filters:**

- Service dropdown (All Services, General, [Service Names])
- Category tabs (All, General, Booking, Pricing, Process, Policies)
- Status toggle (Active/Inactive/All)
- Search box (real-time question filtering)

**Display:**

- Card/row layout showing:
  - Question text
  - Category badge
  - Service name (or "General")
  - Active status indicator
  - View count
- Drag-and-drop reordering (or up/down arrows)
- Quick actions per FAQ:
  - Edit
  - Duplicate
  - Toggle Active
  - Delete (with confirmation)

**Bulk Actions:**

- Multi-select checkboxes
- Actions: Activate, Deactivate, Delete
- Confirmation dialogs for destructive actions

**Top Bar:**

- "New FAQ" button
- "Preview FAQs" link (opens public `/faq` page)

### Create/Edit Form

**Fields:**

- Question (text input, required)
- Category (dropdown, required)
- Service (dropdown with "General FAQ" option for null, required)
- Answer (TipTap rich text editor, required)
- Active (toggle, default: true)
- Sort order (number input, auto-suggests next available)

**Validation:**

- Question: 5-500 characters
- Answer: max length check on JSON
- Category: must be valid enum value
- Service: must exist or be null

---

## Public Pages

### General FAQ Page (`/app/faq/page.tsx`)

**Layout:**

1. **Hero Section**
   - Heading: "Frequently Asked Questions"
   - Subheading: "Find answers to common questions about our services"

2. **Category Tabs**
   - Tabs: All | General | Booking | Pricing | Process | Policies
   - Horizontal tabs on desktop
   - Dropdown select on mobile
   - Filters FAQs by selected category

3. **FAQ Accordion**
   - Multi-expand accordion (multiple FAQs can be open simultaneously)
   - Questions grouped by selected category
   - Each FAQ displays:
     - Question as clickable header
     - Expand/collapse chevron icon
     - Rich text answer with formatting
     - Smooth expand/collapse animations
   - Empty state: "No FAQs in this category yet."

**Technical:**

- Server-side data fetching for SEO
- Client component for accordion interactivity
- URL hash support for direct linking (`/faq#question-slug`)
- Auto-scroll and expand when hash present

### Service Page FAQs (`/app/services/[slug]/page.tsx`)

**Integration:**
Add FAQ section at bottom of existing service page (above footer):

1. **Section Heading**
   - "[Service Name] FAQs"
   - Only shown if service has active FAQs

2. **Accordion**
   - Simpler multi-expand accordion (no tabs needed)
   - Shows FAQs where `serviceId` matches current service
   - Same expand/collapse behavior as general FAQ page

3. **Fallback**
   - Section completely hidden if no FAQs exist for service
   - No empty state displayed

---

## Rich Text Editor (TipTap)

### Enabled Features

- Text formatting: Bold, Italic, Underline
- Lists: Bullet lists, Numbered lists
- Links: with URL validation
- Headings: H3, H4 (for answer structure)
- Paragraph spacing
- Hard break (Shift+Enter)

### Excluded Features

- Images (keep answers text-focused)
- Code blocks (not needed)
- Tables (overkill)
- Text alignment/colors (maintain brand consistency)

### Component Structure

```
components/luna/admin/
  ├── RichTextEditor.tsx       // TipTap editor wrapper
  └── RichTextDisplay.tsx      // Read-only renderer

lib/
  └── tiptap.ts                // Shared configuration
```

### Data Flow

1. Admin: Edit in TipTap → Save as JSON to database
2. Public: Fetch FAQ → Pass JSON to RichTextDisplay
3. Render: JSON → Formatted HTML output
4. Security: TipTap's JSON structure provides built-in sanitization

---

## Analytics

### View Count Tracking

- Increment `viewCount` when FAQ expanded (client-side event)
- Debounced API call: `POST /api/faqs/[id]/view`
- Track once per session using sessionStorage
- Prevent duplicate counts from same user

### Admin Analytics Display

- View count shown in FAQ list
- Sort by "most viewed" to identify popular questions
- Future: trending FAQs widget on admin dashboard

---

## Additional Features

### FAQ Duplication

- "Duplicate" button in admin list actions
- Copies FAQ with "(Copy)" appended to question
- Sets `isActive: false` by default for review
- Useful for creating service-specific variants

### Direct Linking

- Each FAQ gets unique URL hash (slug from question)
- Format: `/faq#what-should-i-bring`
- Auto-scrolls and expands when URL contains hash
- Admin "Copy Link" button for easy sharing

### Empty States

- **Admin list:** "No FAQs yet. Create your first FAQ to get started."
- **Public FAQ page:** "No FAQs in this category yet."
- **Service page:** Section hidden entirely (no empty state)

### SEO Optimization

- FAQ schema.org structured data (JSON-LD)
- Proper OpenGraph meta tags on `/faq` page
- Each question as semantic heading (h3/h4)
- Server-side rendering for search indexing

---

## Implementation Order

1. **Database & Migration**
   - Add Faq model and FaqCategory enum to schema
   - Create and run migration
   - Add FAQ relation to Service model

2. **Components**
   - TipTap editor wrapper (admin)
   - TipTap display renderer (public)
   - FAQ accordion component
   - Category tabs component

3. **API Routes**
   - `/api/admin/faqs` - List, create
   - `/api/admin/faqs/[id]` - Get, update, delete
   - `/api/admin/faqs/[id]/duplicate` - Duplicate FAQ
   - `/api/admin/faqs/[id]/view` - Increment view count
   - `/api/admin/faqs/reorder` - Update sort orders

4. **Admin Pages**
   - List view with filters
   - Create form
   - Edit form

5. **Public Pages**
   - General FAQ page with tabs and accordion
   - Service page FAQ section integration

6. **Testing**
   - API route tests
   - Component tests
   - E2E tests for admin workflows
   - E2E tests for public display

---

## Dependencies

New packages required:

- `@tiptap/react` - Rich text editor
- `@tiptap/starter-kit` - TipTap base extensions
- `@tiptap/extension-link` - Link support
- `@tiptap/extension-underline` - Underline support

---

## Success Metrics

- Reduced support inquiry volume (track via Inquiry model)
- FAQ view counts identify most important questions
- Admin can update FAQs without code deployments
- Service pages have relevant, contextual FAQs
- SEO improvement from FAQ structured data

---

## Future Enhancements

- Video answers (embed YouTube/Vimeo)
- FAQ search on public page (in addition to category tabs)
- Related FAQs suggestions
- FAQ rating system (helpful/not helpful)
- Export FAQs as PDF
- AI-powered FAQ suggestions from inquiry data
