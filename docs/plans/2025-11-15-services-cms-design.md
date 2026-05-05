# Services CMS Design

**Date:** 2025-11-15
**Status:** Approved

## Goal

Transform service pages into CMS-managed content. Ashley can edit all content that appears on public service pages through the admin interface.

## Current State

Service pages (`/services/[slug]`) display pricing from `PricingCategory` records with hardcoded content:

- Process steps ("What to Expect" section) - 7 hardcoded steps
- Info cards ("Good to Know" section) - 4 hardcoded cards
- Hero description from PricingCategory

## Proposed Architecture

### Database Schema

**Service Model** - Owns the URL and page content:

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

**PricingCategory Changes** - Belongs to Service:

```prisma
model PricingCategory {
  id          String  @id @default(cuid())
  serviceId   String
  name        String
  description String  @db.Text
  sortOrder   Int     @default(0)
  isActive    Boolean @default(true)

  service  Service           @relation(fields: [serviceId], references: [id], onDelete: Cascade)
  packages PricingPackage[]
}
```

Remove: `slug` field (Service owns the slug)

**ProcessStep Model** - Process workflow steps:

```prisma
model ProcessStep {
  id            String   @id @default(cuid())
  title         String
  content       String   @db.Text
  stepNumber    Int
  icon          String?
  isGlobal      Boolean  @default(false)
  serviceId     String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  service  Service?              @relation(fields: [serviceId], references: [id], onDelete: Cascade)
  services ServiceProcessStep[]
}
```

**InfoCard Model** - Information cards with icons:

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

**Join Tables** - Many-to-many with ordering:

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

### Content Block Management

**Hybrid Library Approach:**

- Global blocks live in a central library and can be reused across services
- Service-specific blocks belong to one service only
- Ashley creates service-specific blocks inline while editing a service
- "Make Global" button promotes service-specific blocks to the library

**Block Types:**

1. **Process Steps** - Numbered workflow items shown in "What to Expect"
2. **Info Cards** - Icon-based information shown in "Good to Know"

### Admin Structure

**Services Admin** (`/admin/services/`):

- `/admin/services` - List all services
- `/admin/services/new` - Create service
- `/admin/services/[id]` - Edit service with sections:
  - Basic info (name, slug, description, heroImage, isActive, sortOrder)
  - Pricing categories (inline management)
  - Process steps (select from library + create custom)
  - Info cards (select from library + create custom)

**Content Libraries** (`/admin/content/`):

- `/admin/content/process-steps` - Manage global process steps
- `/admin/content/info-cards` - Manage global info cards
- Each shows which services use the block

**Pricing Admin Changes**:

- Remove standalone pricing categories page
- Manage categories within service edit page
- Keep global packages and add-ons pages

### Service Edit Workflow

**Basic Information Section:**

- Text inputs: name, description
- Auto-generated slug from name
- Image upload for hero image
- Checkbox for isActive
- Number input for sortOrder

**Pricing Categories Section:**

- List current categories with expand/collapse
- Each category shows: name, package count, active status
- "Add Pricing Category" button
- Inline edit form or modal for category details
- Link to manage packages for each category

**Process Steps Section:**
Two-column layout:

- **Left: Selected Steps** - Shows selected steps in order with drag handles
- **Right: Available Library** - Shows global steps with "+" button to add

Actions:

- "Create Custom Step" button opens inline form
- Each service-specific step has "Make Global" button
- Remove button to deselect
- Drag to reorder (or up/down arrows)

**Info Cards Section:**
Same two-column pattern as Process Steps:

- Selected cards (left) with reordering
- Available library (right) with add buttons
- "Create Custom Card" button
- Icon picker with preset icons + custom SVG option

### API Routes

**Services:**

- `POST /api/admin/services` - Create service
- `GET /api/admin/services` - List services
- `PUT /api/admin/services/[id]` - Update service
- `DELETE /api/admin/services/[id]` - Delete service

**Pricing Categories:**

- `POST /api/admin/services/[serviceId]/categories` - Create category
- `PUT /api/admin/pricing/categories/[id]` - Update category
- `DELETE /api/admin/pricing/categories/[id]` - Delete category

**Content Libraries:**

- `POST /api/admin/content/process-steps` - Create step
- `GET /api/admin/content/process-steps` - List steps
- `PUT /api/admin/content/process-steps/[id]` - Update step
- `DELETE /api/admin/content/process-steps/[id]` - Delete step (prevent if in use)
- `POST /api/admin/content/process-steps/[id]/make-global` - Convert to global

- `POST /api/admin/content/info-cards` - Create card
- `GET /api/admin/content/info-cards` - List cards
- `PUT /api/admin/content/info-cards/[id]` - Update card
- `DELETE /api/admin/content/info-cards/[id]` - Delete card (prevent if in use)
- `POST /api/admin/content/info-cards/[id]/make-global` - Convert to global

All routes check session and require ADMIN role.

### Public Service Pages

**Service List** (`/services`):

- Query active services ordered by sortOrder
- Display service cards with name, description, heroImage
- Link to `/services/[slug]`

**Service Detail** (`/services/[slug]`):
Query Service with relations:

- Pricing categories with packages
- Process steps (ordered by sortOrder)
- Info cards (ordered by sortOrder)
- Other active services

Page sections (in order):

1. **Hero** - Service name, description, back link to services
2. **Pricing** - Each pricing category with its packages in grid
3. **Add-ons** - Global add-ons (unchanged)
4. **What to Expect** - Selected process steps rendered with step numbers
5. **Good to Know** - Selected info cards in grid with icons
6. **Other Services** - Links to other active services
7. **CTA** - Contact and portfolio buttons

**Icon Rendering:**

- Use `icon` field to select from preset SVG library
- Fall back to `customIconSvg` if provided
- Preset icons: calendar, clock, location, camera, users, heart, star, edit, etc.

### Migration Strategy

**Phase 1 - Schema:**

- Add Service, ProcessStep, InfoCard, join tables
- Add serviceId to PricingCategory
- Run migration without data changes

**Phase 2 - Data:**

- For each PricingCategory, create matching Service (same name, slug, description)
- Link PricingCategory to new Service via serviceId
- Extract hardcoded process steps → ProcessStep records (isGlobal = true)
- Extract hardcoded info cards → InfoCard records (isGlobal = true)
- Create join records linking all services to these global blocks

**Phase 3 - Cleanup:**

- Remove slug field from PricingCategory
- Update service detail page to query Service.slug instead of PricingCategory.slug
- Add redirects for old URLs during transition

### Component Architecture

**ServiceForm** - Main service editor:

- Client component with form state management
- Handles create (POST) vs edit (PUT)
- Delete button in edit mode
- Follows existing form patterns (GalleryForm, TestimonialForm)

**PricingCategoryInlineForm** - Nested in ServiceForm:

- Expandable sections for each category
- Fields: name, description, isActive, sortOrder
- Link to package management

**ContentBlockSelector** - Reusable for steps and cards:
Props: `selectedBlocks`, `availableBlocks`, `blockType`, `onSelect`, `onRemove`, `onReorder`, `onCreate`, `onMakeGlobal`

- Two-panel layout (selected | library)
- Drag-and-drop or arrow buttons for ordering
- Inline creation form
- Make Global button for service-specific blocks

**ProcessStepForm** - Step creation/editing:

- Fields: title, content (textarea), stepNumber, icon (optional)
- Used in library admin and inline in ContentBlockSelector

**InfoCardForm** - Card creation/editing:

- Fields: title, content (textarea)
- Icon picker component
- Custom SVG textarea (optional)

**IconPicker** - Icon selection component:

- Dropdown with visual preview
- 20-30 preset icons from existing design system
- "Custom" option enables SVG textarea

## Success Criteria

1. Ashley can create and edit services without touching code
2. All content on service pages comes from the database
3. Content blocks can be reused across multiple services
4. Service-specific customizations are possible
5. Existing URLs continue to work after migration
6. Admin interface matches existing patterns

## Out of Scope

- Video embeds, testimonials, FAQs, custom HTML blocks
- Advanced WYSIWYG editor for content
- Image galleries within service pages
- Service-specific add-ons (add-ons remain global)

These can be added later if needed.
