# Requirements: Petersen Group

**Defined:** 2026-03-15
**Core Value:** Developers can discover, reference, and apply opinionated AI-first DX practices from a single authoritative source — both on the web and programmatically via CLI.

## v1.3 Requirements

Requirements for milestone v1.3 Artax Design System. Each maps to roadmap phases.

### Design System Foundation

- [x] **FOUND-01**: artax-ui components reorganized into Atomic Design hierarchy (atoms/molecules/organisms) with unchanged public API
- [x] **FOUND-02**: ThemeProvider component added to artax-ui supporting light/dark mode switching
- [x] **FOUND-03**: theme.css extended with light/dark CSS custom property pairs matching Pencil design tokens
- [x] **FOUND-04**: All existing artax-ui components updated to use semantic color tokens (no hardcoded colors)
- [x] **FOUND-05**: Storybook removed from artax-ui (devDeps, scripts, stories, .storybook/)
- [x] **FOUND-06**: ESLint import/no-cycle rule enforced to prevent circular dependencies in Atomic Design layers

### Artax Reference Site

- [x] **ARTAX-01**: New `apps/artax` Next.js app in monorepo consuming artax-ui as workspace dependency
- [x] **ARTAX-02**: Component catalog with Atomic Design sidebar navigation (Atoms / Molecules / Organisms)
- [x] **ARTAX-03**: Live in-page component previews for all artax-ui components in both light and dark themes
- [x] **ARTAX-04**: Code snippet display with copy-to-clipboard for each component example
- [x] **ARTAX-05**: Props/API table documentation for each component
- [x] **ARTAX-06**: Design token reference page (colors, typography, spacing, radii)
- [x] **ARTAX-07**: Site-wide light/dark theme toggle persisted via next-themes
- [x] **ARTAX-08**: Editable mock data on component previews (gated on react-live React 19 compat; falls back to static)

### Site Updates

- [ ] **SITE-01**: blakepetersen.io wired with ThemeProvider and next-themes for light/dark switching
- [ ] **SITE-02**: User-facing theme toggle in site header
- [ ] **SITE-03**: Homepage updated to match Pencil design
- [ ] **SITE-04**: Skills Detail page updated to match Pencil design
- [x] **SITE-05**: About page updated to match Pencil design
- [ ] **SITE-06**: Start Here page updated to match Pencil design
- [x] **SITE-07**: Collection Listing page updated to match Pencil design
- [ ] **SITE-08**: FOUT prevention via next-themes blocking script on both apps

## Future Requirements

### Artax Enhancements

- **ARTAX-F01**: Interactive code playground with full react-live integration (if deferred from v1.3)
- **ARTAX-F02**: Component accessibility audit reports embedded in reference pages
- **ARTAX-F03**: Design token change history / versioning

## Out of Scope

| Feature | Reason |
|---------|--------|
| Light mode for other monorepo apps (ashleypetersenphoto, dalebridges) | Focus on blakepetersen.io and artax only |
| Custom theme builder UI | Over-engineering for single-maintainer project |
| Figma/Sketch export integration | Pencil is the design tool; no need for others |
| Component playground sandbox (iframe-based) | Anti-pattern per research — in-page rendering is simpler and RSC-compatible |
| Private/authenticated design system | All content is public |
| Automated Pencil → CSS token sync | Manual mapping is sufficient and more reliable |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 | Phase 21 | Complete |
| FOUND-02 | Phase 21 | Complete |
| FOUND-03 | Phase 21 | Complete |
| FOUND-04 | Phase 21 | Complete |
| FOUND-05 | Phase 21 | Complete |
| FOUND-06 | Phase 21 | Complete |
| ARTAX-01 | Phase 22 | Complete |
| ARTAX-02 | Phase 23 | Complete |
| ARTAX-03 | Phase 23 | Complete |
| ARTAX-04 | Phase 23 | Complete |
| ARTAX-05 | Phase 23 | Complete |
| ARTAX-06 | Phase 23 | Complete |
| ARTAX-07 | Phase 22 | Complete |
| ARTAX-08 | Phase 24 | Complete |
| SITE-01 | Phase 25 | Pending |
| SITE-02 | Phase 25 | Pending |
| SITE-03 | Phase 26 | Pending |
| SITE-04 | Phase 26 | Pending |
| SITE-05 | Phase 26 | Complete |
| SITE-06 | Phase 26 | Pending |
| SITE-07 | Phase 26 | Complete |
| SITE-08 | Phase 25 | Pending |

**Coverage:**
- v1.3 requirements: 22 total
- Mapped to phases: 22
- Unmapped: 0

---
*Requirements defined: 2026-03-15*
*Last updated: 2026-03-15 after roadmap creation*
