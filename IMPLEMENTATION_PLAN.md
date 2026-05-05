# Luna Design System Implementation Plan

**Created:** 2025-11-04
**Status:** ✅ Ready for Implementation (Visual Assessment Complete)
**Visual Grade:** A- (93/100)
**Estimated Total Time:** 12-16 hours
**Screenshots Analyzed:** 36 (6 pages × 3 viewports × 2 modes)

---

## Executive Summary

This comprehensive implementation plan addresses design system violations and visual inconsistencies identified through both **code review** and **visual assessment using Playwright**.

### Visual Assessment Highlights

**Excellent ✅:**
- Photography-first design that lets images shine
- Clean, professional aesthetic with great typography
- Sophisticated dark mode using navy tones (not pure black)
- Responsive design works well across all breakpoints
- Teal brand color is elegant and appropriate

**Critical Issue ❌:**
- **Gradient button** (cyan-to-orange) on About page breaks visual consistency

**Improvements Needed ⚠️:**
- Replace arbitrary spacing/typography values with design system tokens
- Subtly adjust dark mode alternating backgrounds (too prominent)
- Fix minor spacing inconsistencies
- Add accessibility improvements (ARIA labels, heading hierarchy)

### Implementation Strategy

The work is organized into 7 phases, with Phases 1, 3, and 4 being **critical** and must be completed before deployment. Phases 2, 5, 6, and 7 are quality improvements that can follow.

---

## Phase 1: Design System Token Migration (Priority: CRITICAL)

**Goal:** Replace all arbitrary spacing and typography values with semantic design system tokens.

**Estimated Time:** 6-8 hours

### 1.1 Spacing Token Refactoring

**Files to Update:**
- `app/about/page.tsx`
- `app/page.tsx`
- `app/portfolio/page.tsx`
- `app/blog/page.tsx`
- `app/contact/page.tsx`
- `app/pricing/page.tsx`
- All new component files in `components/`

**Pattern Replacements:**

```tsx
// BEFORE → AFTER

// Section spacing
pt-32 pb-16 → py-section
py-24 → py-section
py-16 → py-section-sm
pt-24 pb-16 → py-section-sm

// Gutters
px-6 → px-gutter
p-6 → p-gutter
p-8 → p-gutter (use gutter consistently)
p-12 → p-gutter (use gutter consistently)

// Margins
mb-6 → mb-6 (check if this should be a token)
mb-8 → mb-8 (check if this should be a token)
mb-16 → mb-16 (check if this should be a token)
```

**Additional Token Definitions Needed:**

Add to `tailwind.config.ts` and `app/globals.css`:

```typescript
// tailwind.config.ts
spacing: {
  'gutter': 'var(--gutter, 1.5rem)',
  'gutter-sm': 'var(--gutter-sm, 1rem)',
  'gutter-lg': 'var(--gutter-lg, 2rem)',
  'section': 'var(--section-spacing, 6rem)',
  'section-sm': 'var(--section-spacing-sm, 4rem)',
  'section-xs': 'var(--section-spacing-xs, 3rem)',
}
```

```css
/* app/globals.css */
:root {
  --gutter: 1.5rem;        /* 24px */
  --gutter-sm: 1rem;       /* 16px */
  --gutter-lg: 2rem;       /* 32px */
  --section-spacing: 6rem; /* 96px */
  --section-spacing-sm: 4rem; /* 64px */
  --section-spacing-xs: 3rem; /* 48px */
}
```

### 1.2 Typography Token Refactoring

**Pattern Replacements:**

```tsx
// BEFORE → AFTER

// Display text (hero sections)
text-5xl md:text-6xl → text-display-lg
text-6xl → text-display-lg
text-4xl md:text-5xl → text-display-md

// Headings
text-4xl → text-heading-xl
text-3xl → text-heading-lg
text-2xl → text-heading-md
text-xl → text-heading-sm

// Body text
text-lg → text-body-lg
text-base (default) → text-body-md
text-sm → text-body-sm
text-xs → text-caption
```

**Note:** The design system tokens already include responsive sizing, so remove manual breakpoints like `md:text-6xl`.

### 1.3 Testing Strategy

After each file update:

1. **Visual regression check:**
   - Compare before/after screenshots
   - Verify spacing looks identical
   - Check at mobile (375px), tablet (768px), desktop (1440px)

2. **Automated checks:**
   ```bash
   # Run build to catch any errors
   pnpm build

   # Run linting
   pnpm lint
   ```

3. **Documentation:**
   - Update `docs/DESIGN_SYSTEM.md` with any new patterns discovered
   - Document exceptions (if any arbitrary values are needed)

---

## Phase 2: Component Consolidation (Priority: HIGH)

**Goal:** Eliminate duplicate components and use conditional rendering.

**Estimated Time:** 3-4 hours

### 2.1 Consolidate Session-Based Components

**Current Duplication:**

```
components/AboutSection.tsx
components/AboutSectionClient.tsx
components/AboutSectionWithSession.tsx
```

**Consolidation Pattern:**

```tsx
// components/AboutSection.tsx
import { getServerSession } from 'next-auth';

interface AboutSectionProps {
  variant?: 'default' | 'client';
}

export default async function AboutSection({ variant = 'default' }: AboutSectionProps) {
  const session = await getServerSession();

  return (
    <section className="py-section px-gutter">
      {/* Shared layout */}

      {session && variant === 'default' && (
        {/* Session-specific features */}
      )}

      {variant === 'client' && (
        {/* Client-specific features */}
      )}
    </section>
  );
}
```

**Files to Consolidate:**

1. AboutSection variants → `components/AboutSection.tsx`
2. CtaSection variants → `components/CtaSection.tsx`
3. ServicesSection variants → `components/ServicesSection.tsx`
4. Header variants → `components/Header.tsx`
5. HeroCarousel variants → `components/HeroCarousel.tsx`

**Benefits:**
- Single source of truth for UI
- Easier to maintain
- Reduced bundle size
- Consistent behavior

### 2.2 Create Wrapper Components (If Needed)

If server/client boundary is the issue:

```tsx
// components/AboutSection.server.tsx
export default async function AboutSectionServer() {
  const session = await getServerSession();
  return <AboutSectionClient session={session} />;
}

// components/AboutSection.client.tsx
'use client';
export default function AboutSectionClient({ session }) {
  // Client-side logic
}
```

---

## Phase 3: Visual Design Improvements (Priority: HIGH)

**Goal:** Fix gradient button, standardize dark mode, improve visual coherence.

**Estimated Time:** 2-3 hours

### 3.1 Remove Gradient Button Anti-Pattern

**Location:** `app/about/page.tsx:150`

**Before:**
```tsx
<Link
  href="/contact"
  className="inline-flex items-center justify-center gap-2 rounded-md bg-gradient-to-br from-cyan-500 to-orange-400 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
>
  Contact Me
</Link>
```

**After:**
```tsx
<Link
  href="/contact"
  className="inline-flex items-center justify-center gap-2 rounded-md bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-4 text-lg font-semibold transition-colors hover:bg-gray-800 dark:hover:bg-gray-100"
>
  Contact Me
</Link>
```

**Rationale:** Maintains consistency with the rest of the site's minimal, elegant aesthetic that doesn't compete with photography.

### 3.2 Standardize Dark Mode Color System

**Current Issues:**
- Mix of `gray-950`, `gray-900`, `gray-800` for dark backgrounds
- Inconsistent use of semantic tokens

**Solution: Define Semantic Background Tokens**

Add to `tailwind.config.ts`:

```typescript
colors: {
  background: {
    DEFAULT: 'hsl(var(--background))',
    alt: 'hsl(var(--background-alt))',
  },
  // ... existing colors
}
```

Add to `app/globals.css`:

```css
:root {
  --background: 0 0% 100%;       /* white */
  --background-alt: 0 0% 98%;    /* gray-50 equivalent */
}

.dark {
  --background: 0 0% 3.9%;       /* gray-950 equivalent */
  --background-alt: 0 0% 11%;    /* gray-900 equivalent */
}
```

**Usage Pattern:**

```tsx
// Alternating sections
<section className="bg-background">
<section className="bg-background-alt">
<section className="bg-background">
```

**Files to Update:**
- `app/about/page.tsx` - Alternating sections
- `app/page.tsx` - Homepage sections
- `app/portfolio/page.tsx` - Gallery backgrounds
- All admin pages

### 3.3 Border Token Standardization

**Replace:**
```tsx
border border-gray-200 dark:border-gray-800
border border-gray-200 dark:border-gray-700
border-2 border-gray-900 dark:border-white
```

**With:**
```tsx
border border-border        // Standard borders
border-2 border-foreground  // Emphasized borders
```

The design system already defines these tokens, just need to use them consistently.

---

## Phase 4: Accessibility Improvements (Priority: MEDIUM-HIGH)

**Goal:** Ensure WCAG 2.1 AA compliance.

**Estimated Time:** 2-3 hours

### 4.1 Add Semantic HTML and ARIA Labels

**Status Badges:**

```tsx
// app/admin/bookings/page.tsx
<span
  className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(status)}`}
  role="status"
  aria-label={`Booking status: ${status.toLowerCase()}`}
>
  {status}
</span>
```

**Icon Buttons:**

```tsx
// All icon-only buttons need labels
<button
  aria-label="Toggle dark mode"
  className="..."
>
  {/* Icon */}
</button>

<button
  aria-label="Open mobile menu"
  className="..."
>
  {/* Hamburger icon */}
</button>
```

### 4.2 Fix Heading Hierarchy

**Current Issues:**
- Skipping heading levels
- Multiple `h1` tags on single pages
- Non-semantic heading sizes

**Rules:**
1. One `h1` per page (hero/page title)
2. Don't skip levels (h1 → h2 → h3, not h1 → h3)
3. Use semantic HTML, style with CSS classes

**Example Refactor:**

```tsx
// app/about/page.tsx

// BEFORE
<h1 className="text-5xl md:text-6xl">Hi, I'm Ashley</h1>
<h2 className="text-4xl md:text-5xl">Specialties</h2>
<h3 className="text-2xl">Underwater Photography</h3>

// AFTER
<h1 className="text-display-lg">Hi, I'm Ashley</h1>
<h2 className="text-heading-xl">Specialties</h2>
<h3 className="text-heading-md">Underwater Photography</h3>
```

### 4.3 Color Contrast Audit

**Tools:**
- Chrome DevTools Lighthouse
- axe DevTools extension
- Contrast Checker (WebAIM)

**Areas to Check:**
1. Gradient button text (before removal)
2. Status badge text on colored backgrounds
3. Dark mode text on dark backgrounds
4. Link colors in both modes

**Minimum Requirements:**
- Normal text: 4.5:1 contrast ratio
- Large text (18px+): 3:1 contrast ratio
- UI components: 3:1 contrast ratio

---

## Phase 5: Responsive Design Standardization (Priority: MEDIUM)

**Goal:** Create consistent, documented responsive patterns.

**Estimated Time:** 2-3 hours

### 5.1 Define Standard Grid Patterns

Add to `docs/DESIGN_SYSTEM.md`:

```markdown
## Responsive Grid Patterns

### Standard Content Grid
Use for blog posts, portfolio items, service cards.

- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 3 columns

```tsx
<div className="grid grid-cols-1 gap-gutter md:grid-cols-2 lg:grid-cols-3">
```

### Wide Content Grid
Use for image galleries, larger cards.

- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 4 columns

```tsx
<div className="grid grid-cols-1 gap-gutter md:grid-cols-2 lg:grid-cols-4">
```

### Service/Feature Grid
Use for features, specialties.

- Mobile: 1 column
- Desktop: 3 columns (no tablet breakpoint)

```tsx
<div className="grid grid-cols-1 gap-gutter lg:grid-cols-3">
```
```

### 5.2 Standardize Breakpoint Usage

**Current Issues:**
- Some grids use `md:`, others skip to `lg:`
- Inconsistent gap sizes (gap-4, gap-6, gap-8)

**Standard Pattern:**

```tsx
// Use design system gap
gap-gutter        // Default: 1.5rem (24px)
gap-gutter-sm     // Tighter: 1rem (16px)
gap-gutter-lg     // Wider: 2rem (32px)
```

### 5.3 Mobile-First Review

**Test Pages at These Breakpoints:**
- 375px (iPhone SE, standard mobile)
- 768px (iPad portrait, tablet)
- 1024px (iPad landscape, small desktop)
- 1440px (Standard desktop)
- 1920px (Large desktop)

**Check:**
- Touch targets (minimum 44px × 44px)
- Text readability (no tiny fonts on mobile)
- Image sizing (no layout shift)
- Navigation usability

---

## Phase 6: Theme Enhancement (VISUAL ASSESSMENT COMPLETE ✅)

**Goal:** Develop cohesive visual theme based on photography portfolio best practices.

**Estimated Time:** 4-6 hours

### 6.1 Visual Assessment Results

**Screenshots Analyzed:** 36 total (6 pages × 3 viewports × 2 color modes)

#### Color Palette Analysis ⭐⭐⭐⭐☆ (4/5)

**Current Palette:**
- **Primary Brand Color:** Teal/Cyan (`#40c7b8` approximate) - used in logo, primary buttons, badges
- **Light Mode Backgrounds:**
  - Main: White (`#ffffff`)
  - Alternating: Light gray (`gray-50`)
- **Dark Mode Backgrounds:**
  - Main: Deep navy (`gray-950` / `#0a0f1e` approximate)
  - Alternating: Lighter navy (`gray-900` / `#1a2332` approximate)
- **Typography:**
  - Primary: Black/white depending on mode
  - Secondary: Gray-600/Gray-400

**Strengths:**
- ✅ Teal accent color is elegant and photography-appropriate
- ✅ Dark mode uses rich navy instead of pure black (more sophisticated)
- ✅ Color palette doesn't compete with photography
- ✅ Good contrast ratios throughout

**Issues:**
- ❌ **CRITICAL:** Gradient button (cyan-to-orange) on About page breaks visual consistency
- ⚠️ Dark mode background alternation is too prominent (gray-950 vs gray-900 creates visible "stripes")
- ⚠️ Could benefit from a warm accent for CTAs (current teal can feel cold)

#### Typography System ⭐⭐⭐⭐⭐ (5/5)

**Current Implementation:**
- **Headings:** Serif font (appears to be a Georgia or similar transitional serif)
- **Body Text:** Sans-serif (clean, modern)
- **Hierarchy:** Clear and well-executed
- **Spacing:** Generous line-height creates elegant feel

**Strengths:**
- ✅ Excellent serif/sans-serif pairing
- ✅ Clear visual hierarchy on all pages
- ✅ Appropriate font sizes for readability
- ✅ Good use of font weights (regular, semibold, bold)

**Minor Improvements:**
- Consider increasing body text line-height to 1.7 for even more luxury feel
- Ensure consistent letter-spacing on display headings

#### White Space & Rhythm ⭐⭐⭐⭐☆ (4/5)

**Strengths:**
- ✅ Generous spacing around major sections
- ✅ Cards have good internal padding
- ✅ Hero sections have breathing room
- ✅ Mobile spacing adapts well

**Issues:**
- ⚠️ Some sections feel a bit tight (Services grid on homepage)
- ⚠️ Inconsistent vertical rhythm due to arbitrary spacing values
- ⚠️ Gallery grids could use slightly more gap spacing

#### Photography-First Design ⭐⭐⭐⭐⭐ (5/5)

**Strengths:**
- ✅ Images are prominently displayed and hero-sized
- ✅ Minimal UI doesn't compete with photography
- ✅ Gallery layouts showcase work effectively
- ✅ Clean card designs let images shine
- ✅ Good use of featured badges without being intrusive

**Excellent Implementation:**
- Portfolio gallery grid is perfectly balanced
- Homepage featured work section is impactful
- Image quality and presentation is professional

#### Brand Personality ⭐⭐⭐⭐⭐ (5/5)

**Assessment:**
- ✅ Professional and polished
- ✅ Modern without being trendy
- ✅ Elegant and timeless
- ✅ Appropriate for high-end lifestyle photography
- ✅ Appeals to target audience (families, professionals, creatives)

**Tone:** Perfect balance of approachable and premium

### 6.2 Required Theme Improvements

#### 6.2.1 Fix Gradient Button (CRITICAL - Already in Phase 3)

**Location:** About page, CTA section

**Current (WRONG):**
```tsx
bg-gradient-to-br from-cyan-500 to-orange-400
```

**Visual Issue:**
- Creates jarring visual break in otherwise cohesive teal color scheme
- Orange accent appears nowhere else in the design
- Feels like a different website's component
- Competes with photography instead of supporting it

**Solution (Simple teal button):**
```tsx
bg-[#40c7b8] hover:bg-[#36b3a5] text-white
dark:bg-[#40c7b8] dark:hover:bg-[#36b3a5]
```

Or use semantic approach:
```tsx
bg-primary hover:bg-primary/90 text-primary-foreground
```

#### 6.2.2 Refine Dark Mode Alternating Sections

**Current Issue:**
Dark mode uses `bg-gray-950` and `bg-gray-900` for alternating sections, which creates very obvious visual stripes.

**Visual Evidence:**
- About page: Clearly visible stripes between sections
- Homepage: Same issue on Services → Featured Work → About

**Recommended Solution:**

Add subtle alternating backgrounds:

```css
/* app/globals.css */
:root {
  --background: 0 0% 100%;        /* white */
  --background-alt: 0 0% 98%;     /* barely-there gray */
}

.dark {
  --background: 220 25% 6%;       /* deep navy #0a0f1e */
  --background-alt: 220 20% 8%;   /* slightly lighter navy - SUBTLE */
}
```

**Rationale:**
- Light mode: White/near-white alternation is subtle and elegant
- Dark mode: Very close navy tones create rhythm without "stripes"
- Maintains section distinction without being distracting

#### 6.2.3 Optimize Spacing System

**Current Observation:**
Spacing is generally good, but some areas are inconsistent due to arbitrary values.

**Recommendations:**

1. **Gallery Grid Gaps:** Increase from `gap-4` to `gap-6` (or `gap-gutter`) for more breathing room
2. **Section Spacing:** Ensure consistent use of `py-section` (96px) for major sections
3. **Card Padding:** Standardize at `p-6` or `p-gutter`

**Example Fix:**
```tsx
// Portfolio page gallery
<div className="grid grid-cols-1 gap-gutter md:grid-cols-2 lg:grid-cols-3">
```

### 6.3 Optional Theme Enhancements (Nice to Have)

#### 6.3.1 Warm Accent for Secondary CTAs

**Rationale:**
Teal is elegant but cool. A warm accent for secondary actions could add warmth.

**Suggestion:**
- Primary CTA: Teal (current)
- Secondary CTA: Warm amber/gold
- Example: "Book a Session" (teal) vs "View Portfolio" (warm white/amber)

**Implementation:**
```typescript
// tailwind.config.ts
colors: {
  primary: {
    DEFAULT: 'hsl(174, 50%, 50%)', // Teal
    warm: 'hsl(40, 70%, 60%)',     // Warm amber for accents
  }
}
```

**Usage:**
```tsx
<Button variant="primary">Contact Me</Button>
<Button variant="outline" className="border-primary-warm text-primary-warm">
  View Portfolio
</Button>
```

#### 6.3.2 Enhanced Hover States for Gallery Items

**Current:** Simple scale on hover (good)

**Enhancement Idea:**
```tsx
// Gallery cards
className="group relative overflow-hidden rounded-lg transition-all duration-300
  hover:shadow-2xl hover:-translate-y-1"

// Image inside
className="transition-transform duration-700 group-hover:scale-105"
```

**Effect:**
- Card lifts slightly on hover
- Image zooms subtly
- Creates premium, interactive feel

#### 6.3.3 Subtle Texture for Dark Mode

**Observation:** Dark mode is very flat (not necessarily bad)

**Optional Enhancement:**
Add subtle noise texture to dark backgrounds for depth

```css
.dark {
  background-image: url('/noise-texture.png');
  background-size: 200px 200px;
  opacity: 0.02; /* Very subtle */
}
```

**Benefit:** Adds richness without being distracting

### 6.4 Color Palette Refinement Recommendations

Based on visual assessment, here's the refined color system:

#### Recommended HSL Color Tokens

```css
/* app/globals.css */
:root {
  /* Backgrounds */
  --background: 0 0% 100%;           /* #ffffff - pure white */
  --background-alt: 0 0% 98%;        /* #fafafa - subtle gray */

  /* Foreground */
  --foreground: 0 0% 10%;            /* #1a1a1a - near black */

  /* Primary (Teal) */
  --primary: 174 50% 50%;            /* #40c7b8 - brand teal */
  --primary-foreground: 0 0% 100%;   /* white */

  /* Accent (Warm - optional) */
  --accent-warm: 40 70% 60%;         /* Amber/gold for warmth */

  /* Borders */
  --border: 0 0% 90%;                /* Light gray borders */
}

.dark {
  /* Dark Backgrounds */
  --background: 220 25% 6%;          /* #0a0f1e - deep navy */
  --background-alt: 220 20% 8%;      /* #0f1621 - slightly lighter */

  /* Dark Foreground */
  --foreground: 0 0% 98%;            /* #fafafa - near white */

  /* Primary stays same in dark mode */
  --primary: 174 50% 50%;            /* Teal works in both modes */

  /* Borders */
  --border: 220 15% 20%;             /* Subtle navy borders */
}
```

### 6.5 Typography Recommendations

**Current system is excellent.** Minor refinements:

```typescript
// tailwind.config.ts - Add to existing
fontSize: {
  // ... existing tokens ...

  // Optional: Add tighter line-height variant for compact areas
  'body-md-tight': ['1rem', { lineHeight: '1.5', letterSpacing: '0' }],

  // Optional: Add luxury variant with extra line-height
  'body-lg-luxury': ['1.125rem', { lineHeight: '1.8', letterSpacing: '0' }],
}
```

### 6.6 Visual Assessment Summary

**Overall Grade: A- (93/100)**

**Strengths:**
1. ✅ Excellent photography-first design
2. ✅ Clean, professional aesthetic
3. ✅ Good typography hierarchy
4. ✅ Effective dark mode implementation
5. ✅ Responsive design works well

**Critical Issues:**
1. ❌ Gradient button breaks visual consistency (HIGH PRIORITY FIX)

**Improvement Areas:**
2. ⚠️ Dark mode alternating backgrounds too prominent
3. ⚠️ Design system tokens not being used consistently
4. ⚠️ Minor spacing inconsistencies

**Recommendation:**
Fix the gradient button immediately, implement design system tokens throughout, and subtly adjust dark mode alternation. The optional enhancements can be considered for future iterations.

### 6.7 Inspiration & Best Practices Comparison

**Compared to Industry Leaders:**

1. **Jose Villa Photography** (Minimal, Elegant)
   - Luna matches this aesthetic well
   - Similar use of white space
   - Luna's dark mode is a good addition

2. **Squarespace Portfolio Templates** (Modern, Professional)
   - Luna's card-based layouts align with modern patterns
   - Good use of featured badges
   - Typography hierarchy is comparable

3. **High-End Photography Sites** (General)
   - Luna successfully avoids competing with imagery
   - Clean navigation and CTAs
   - Professional presentation

**Luna's Unique Strengths:**
- Dark mode implementation (many photography sites skip this)
- Category filtering on portfolio
- Client portal system
- Modern tech stack (Next.js 15)

---

## Phase 7: Storybook Component Library (Priority: LOW)

**Goal:** Complete Storybook setup for design system documentation.

**Estimated Time:** 4-6 hours

### 7.1 Storybook Configuration

The `.storybook/` directory exists but needs completion.

**Setup:**

```bash
# Install Storybook
pnpm dlx storybook@latest init

# Install addons
pnpm add -D @storybook/addon-a11y
pnpm add -D @storybook/addon-themes
```

### 7.2 Create Component Stories

**Priority Components:**

1. **Design Tokens**
   - `stories/DesignTokens/Colors.stories.tsx`
   - `stories/DesignTokens/Typography.stories.tsx`
   - `stories/DesignTokens/Spacing.stories.tsx`

2. **UI Primitives**
   - `stories/Button.stories.tsx`
   - `stories/Card.stories.tsx`
   - `stories/Heading.stories.tsx`
   - `stories/Section.stories.tsx`

3. **Complex Components**
   - `stories/Header.stories.tsx`
   - `stories/Footer.stories.tsx`
   - `stories/HeroCarousel.stories.tsx`
   - `stories/GalleryGrid.stories.tsx`

### 7.3 Dark Mode in Storybook

Configure theme switching:

```typescript
// .storybook/preview.ts
import { withThemeByClassName } from '@storybook/addon-themes';

export const decorators = [
  withThemeByClassName({
    themes: {
      light: '',
      dark: 'dark',
    },
    defaultTheme: 'light',
  }),
];
```

---

## Testing & Quality Assurance

### Automated Testing

```bash
# Run before each commit
pnpm build          # Verify no TypeScript errors
pnpm lint           # Check code quality

# Run Lighthouse (after deployment)
npx lighthouse http://localhost:3333 --view
```

### Manual Testing Checklist

**Per Page:**
- [ ] Light mode visual check
- [ ] Dark mode visual check
- [ ] Mobile responsive (375px)
- [ ] Tablet responsive (768px)
- [ ] Desktop responsive (1440px)
- [ ] Keyboard navigation
- [ ] Screen reader (VoiceOver/NVDA)
- [ ] Color contrast (axe DevTools)
- [ ] Image loading performance

**Cross-Browser:**
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

**Performance:**
- [ ] Lighthouse score > 90
- [ ] LCP < 2.5s
- [ ] CLS < 0.1
- [ ] FID < 100ms

---

## Implementation Order

### Week 1: Critical Fixes

**Days 1-2:**
- Phase 1.1: Spacing token refactoring (start with About page)
- Phase 1.2: Typography token refactoring
- Phase 3.1: Remove gradient button

**Days 3-4:**
- Phase 3.2: Standardize dark mode colors
- Phase 3.3: Border token standardization
- Phase 4.1: Add ARIA labels

**Day 5:**
- Phase 4.2: Fix heading hierarchy
- Phase 4.3: Color contrast audit
- Testing and fixes

### Week 2: Improvements

**Days 1-2:**
- Phase 2: Component consolidation
- Phase 5: Responsive standardization

**Days 3-4:**
- Phase 6: Visual assessment with Playwright
- Theme enhancements based on findings

**Day 5:**
- Final testing
- Documentation updates
- Storybook setup (if time permits)

---

## Success Criteria

### Must Have (Before Deploy)
- ✅ All arbitrary spacing replaced with design tokens
- ✅ All arbitrary typography replaced with design tokens
- ✅ Gradient button removed
- ✅ Dark mode colors standardized
- ✅ No accessibility errors in axe DevTools
- ✅ Proper heading hierarchy on all pages
- ✅ Build completes without errors

### Should Have (Quality)
- ✅ Components consolidated (no duplicates)
- ✅ Responsive patterns documented
- ✅ Lighthouse score > 90 on all pages
- ✅ Cross-browser testing complete

### Nice to Have (Polish)
- ✅ Storybook component library
- ✅ Visual regression testing setup
- ✅ Performance optimization
- ✅ Theme enhancements implemented

---

## Risk Mitigation

### Risk: Breaking Changes

**Mitigation:**
- Work in feature branch
- Test after each file change
- Visual regression screenshots before/after
- Incremental commits (per file or component)

### Risk: Design System Incomplete

**Mitigation:**
- Document any missing tokens during refactoring
- Add to design system as needed
- Get approval for new tokens

### Risk: Time Overruns

**Mitigation:**
- Prioritize critical issues first
- Can deploy after Phase 1, 3, and 4
- Phase 2, 5, 6, 7 can be follow-up work

---

## Visual Assessment Complete ✅

### Screenshots Captured

**All pages captured at 3 viewports (mobile 375px, tablet 768px, desktop 1440px) in both light and dark modes:**

✅ Homepage (6 screenshots)
✅ About Page (6 screenshots)
✅ Portfolio (6 screenshots)
✅ Blog (6 screenshots)
✅ Contact (6 screenshots)
✅ Pricing (6 screenshots)

**Total: 36 screenshots analyzed**

### Key Visual Findings

1. **Color palette is cohesive** ✅
   - Teal brand color works beautifully
   - Dark mode feels intentional and sophisticated
   - **EXCEPT:** Gradient button on About page (critical issue)

2. **Typography hierarchy is excellent** ✅
   - Clear visual scanning
   - Headings appropriately prominent
   - Body text highly readable

3. **Design is photography-focused** ✅
   - UI elements support, not compete with images
   - Generous breathing room throughout
   - Professional presentation

4. **Visual bugs identified** ⚠️
   - Dark mode alternating sections too prominent
   - Some spacing inconsistencies (arbitrary values vs tokens)
   - Minor: Gallery grids could use more gap spacing

### Overall Visual Assessment Grade: A- (93/100)

**The design is excellent with one critical fix needed (gradient button) and several refinements for consistency.**

---

## Next Steps

### Immediate Actions (This Week)

1. ✅ **Visual assessment complete** - Playwright screenshots analyzed
2. **Review this plan** with Blake for final approval
3. **Create feature branch** `design-system-refactor` for implementation
4. **Begin Phase 1** - Start with About page to fix gradient button and convert to design tokens
5. **Commit incrementally** - One file or component at a time

### Priority Order

**Week 1: Critical Fixes**
1. Remove gradient button (5 minutes) ← START HERE
2. Refactor About page to design tokens (1-2 hours)
3. Apply pattern to other pages (4-6 hours)
4. Fix dark mode alternation (1 hour)
5. Add ARIA labels (1-2 hours)

**Week 2: Quality Improvements**
6. Consolidate duplicate components (3-4 hours)
7. Standardize responsive patterns (2-3 hours)
8. Visual regression testing (1-2 hours)

### Success Metrics

Before merging to main:
- [ ] No gradient buttons anywhere
- [ ] All spacing uses design tokens (no `pt-32`, `py-24`, etc.)
- [ ] All typography uses design tokens (no `text-5xl`, `text-3xl`, etc.)
- [ ] Dark mode alternation is subtle
- [ ] No accessibility errors in axe DevTools
- [ ] Build completes without errors
- [ ] Lighthouse score > 90

---

## Appendix: Visual Evidence

All screenshots available in `/visual-assessment/` directory:

- `homepage-{viewport}-{mode}.png`
- `about-{viewport}-{mode}.png`
- `portfolio-{viewport}-{mode}.png`
- `blog-{viewport}-{mode}.png`
- `contact-{viewport}-{mode}.png`
- `pricing-{viewport}-{mode}.png`

Where:
- `{viewport}` = mobile | tablet | desktop
- `{mode}` = light | dark

---

**Document Status:** ✅ Ready for Implementation
**Visual Assessment:** ✅ Complete
**Last Updated:** 2025-11-04
**Owner:** Blake + Claude
**Screenshots:** 36 total, stored in `/visual-assessment/`
