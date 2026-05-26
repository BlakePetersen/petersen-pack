Run visual regression tests for gallery components:

1. Run `pnpm test:visual` to execute visual regression tests
2. The tests will:
   - Take screenshots of gallery components, carousels, and layouts
   - Compare them against baseline snapshots
   - Report any visual differences
3. Review test results for:
   - Failed visual comparisons (pixel differences)
   - New or missing snapshots
   - Layout shifts or rendering issues

If tests fail due to intentional design changes:

- Review the diff images in the test report
- If changes are expected, run `pnpm test:visual:update` to update baselines
- Commit the new snapshot images to version control

Visual regression tests cover:

- Hero carousel on desktop and mobile
- Gallery grid layouts (desktop, tablet, mobile)
- Image lightbox/modal
- Loading states and placeholders
- Carousel navigation controls

Tests run on:

- Desktop Chrome (1280x720)
- Mobile Chrome (Pixel 5 viewport)

Baseline snapshots are stored in `tests/visual/*.spec.ts-snapshots/`
