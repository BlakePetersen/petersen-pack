# CMS Content Management Design

**Date:** 2025-01-05
**Status:** Approved

## Overview

Extend the Luna admin dashboard to allow Ashley to edit homepage sections, about page content, site settings, and featured work descriptions without touching code.

## Current State

The homepage already fetches content from the `HomepageContent` table for three sections:

- About section (heading, image, paragraphs, stats, link)
- Services section (heading, subtitle, array of services)
- CTA section (heading, subtitle, button text/URL)

Data exists in the database with the correct structure, but no admin interface exists to edit it. The about page is entirely hardcoded.

## Design

### Navigation Structure

Add a new "Content" section to the admin sidebar:

```
Content
├── Homepage Sections
├── About Page
├── Site Settings
└── Featured Work
```

This groups all content editing in one place, separate from operational items like galleries and bookings.

### Homepage Sections Interface

**Main Page:** `/admin/content/homepage`

Display three collapsible cards showing current content:

1. **About Section Card**
   - Shows: heading, image thumbnail, paragraph count, stats count
   - Action: Edit button → `/admin/content/homepage/about`

2. **Services Section Card**
   - Shows: heading, subtitle, service count
   - Action: Edit button → `/admin/content/homepage/services`

3. **CTA Section Card**
   - Shows: heading, button text/URL
   - Action: Edit button → `/admin/content/homepage/cta`

### Edit Forms

Each section has a dedicated edit page with full dark mode support.

#### About Section Form (`/admin/content/homepage/about`)

Fields:

- Heading (text input)
- Image (image upload with preview)
- Paragraphs (array of textareas, add/remove buttons)
- Stats (array with value/label pairs, add/remove buttons)
- Link Text (text input)
- Link URL (text input with validation)

#### Services Section Form (`/admin/content/homepage/services`)

Fields:

- Heading (text input)
- Subtitle (text input)
- Services (repeatable array):
  - Icon (dropdown: Camera, Users, Building2, Sparkles, etc.)
  - Title (text input)
  - Description (textarea)
  - Drag handle for reordering
  - Remove button

#### CTA Section Form (`/admin/content/homepage/cta`)

Fields:

- Heading (text input)
- Subtitle (text input)
- Button Text (text input)
- Button URL (text input with validation)

### Form Behaviors

All forms share:

- Save button → updates database, redirects to `/admin/content/homepage`
- Cancel button → returns without saving
- Form validation before save
- Success/error toast notifications
- Dark mode styling matching existing admin patterns

### Data Model

Uses existing `HomepageContent` table:

- `section` (unique string: "about", "services", "cta")
- `content` (JSON matching component type definitions)

No database changes required.

## Future Extensions

This design sets the foundation for:

- About page content management
- Site settings (contact info, social links, footer)
- Featured work section customization

These will follow the same pattern: overview page with cards, dedicated edit pages for each content area.

## Technical Notes

- Reuse existing ImageUpload component from Sol design system
- Follow dark mode patterns from recent admin work
- Use Server Actions for form submission
- Icon dropdown limited to lucide-react icons already in use
- All forms are full-page admin routes (not modals/inline editing)
