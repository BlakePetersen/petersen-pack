# Page Primitives Consolidation

## Goal

Consolidate repeated patterns across public-facing pages into composable primitives following atomic design principles. Enforce consistency in spacing, typography, and layout.

## Current Problems

| Pattern             | Inconsistencies Found                                     |
| ------------------- | --------------------------------------------------------- |
| Section padding     | `py-section`, `py-12`, `py-24`                            |
| Horizontal padding  | `px-gutter`, `px-6`                                       |
| Container usage     | `Container` component, inline `mx-auto max-w-*`           |
| Hero implementation | `PageHero`, inline sections, `HeroCarouselWithSession`    |
| Section headers     | Varying sizes (`text-heading-xl`, `text-4xl md:text-5xl`) |
| CTA sections        | `CtaSectionPrimary`, custom inline implementations        |

## Component Hierarchy

```
Page (template pattern)
├── PageHeader OR PageHero (organism)
├── Section (molecule) × N
│   └── Container (atom)
│       ├── SectionHeader (molecule) - optional
│       └── {content}
├── CtaSection (organism)
└── GlobalFooter
```

## Component APIs

### Section (molecule) - Enhanced

```tsx
<Section
  variant="default" | "gray"  // background treatment
  id="what-to-expect"         // optional anchor
  className=""                // escape hatch
>
  <Container>...</Container>
</Section>
```

Always uses `py-section px-gutter`. No custom padding props.

### Container (atom) - Existing

```tsx
<Container size="sm" | "md" | "lg" | "xl">
  {content}
</Container>
```

### SectionHeader (molecule) - Rewrite

```tsx
<SectionHeader
  title="Featured Work"
  subtitle="Optional description text"
  align="center" | "left"  // default: center
/>
```

Renders h2 with `font-serif text-heading-xl`, subtitle with `text-body-lg text-gray-600`.

### PageHeader (organism) - Simplify

```tsx
<PageHeader title="Portfolio" subtitle="Optional intro text" />
```

Text-only page hero. Centered, `max-w-4xl`, uses `pt-page-top pb-section px-gutter`.

### CtaSection (organism) - New

```tsx
<CtaSection
  title="Like what you see?"
  description="Optional supporting text"
  buttonText="Book a Session"
  buttonHref="/book"
/>
```

Replaces `CtaSectionPrimary` and all inline CTA implementations.

### ProcessSteps (organism) - New

```tsx
<ProcessSteps
  steps={[
    { title: 'Choose Your Time', description: 'Browse available dates...' },
    { title: 'Share Your Details', description: 'Tell me about...' },
  ]}
  columns={2 | 3} // default: auto based on count
/>
```

Numbered step cards in responsive grid. Does not include Section wrapper.

## Migration Plan

### Files to Create/Modify

1. `components/commons/SectionHeader.tsx` - Rewrite for public pages
2. `components/commons/PageHeader.tsx` - Simplify (remove gradient heading)
3. `components/commons/CtaSection.tsx` - New component
4. `components/commons/ProcessSteps.tsx` - New component
5. `components/commons/Section.tsx` - Add `px-gutter`
6. `components/commons/index.ts` - Export new components

### Pages to Update

| Page         | Changes                                                        |
| ------------ | -------------------------------------------------------------- |
| `/portfolio` | Inline hero → `PageHeader`, inline CTA → `CtaSection`          |
| `/contact`   | Inline hero → `PageHeader`, wrap form in `Section`+`Container` |
| `/faq`       | Inline hero → `PageHeader`, 60-line CTA → `CtaSection`         |
| `/blog`      | Add `PageHeader`, inline CTA → `CtaSection`                    |
| `/book`      | Inline hero → `PageHeader`, inline steps → `ProcessSteps`      |
| `/services`  | Inline steps → `ProcessSteps`, standardize sections            |
| `/` (home)   | Standardize section wrappers                                   |

### Delete After Migration

- `components/luna/CtaSectionPrimary.tsx` - Replaced by `CtaSection`

## Example Transformation

### Before (portfolio page)

```tsx
<div className="relative min-h-screen">
  <section className="relative px-gutter pb-section pt-page-top">
    <div className="mx-auto max-w-4xl text-center">
      <h1 className="font-serif text-display-lg text-gray-900 dark:text-white">
        Portfolio
      </h1>
    </div>
  </section>
  <section className="px-gutter pb-section pt-8">
    <Container>
      <PortfolioGrid galleries={galleries} />
    </Container>
  </section>
  <section className="px-6 py-12">
    <Container>
      <div className="flex flex-col items-center text-center">
        <h2 className="text-4xl... mb-8 font-serif">Like what you see?</h2>
        <BookSessionButton size="lg" />
      </div>
    </Container>
  </section>
  <GlobalFooter />
</div>
```

### After

```tsx
<>
  <PageHeader title="Portfolio" />
  <Section>
    <Container>
      <PortfolioGrid galleries={galleries} />
    </Container>
  </Section>
  <CtaSection
    title="Like what you see?"
    buttonText="Book a Session"
    buttonHref="/book"
  />
  <GlobalFooter />
</>
```
