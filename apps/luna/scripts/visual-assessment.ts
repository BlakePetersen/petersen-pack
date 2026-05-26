// ABOUTME: Playwright script for visual assessment of Luna website
// ABOUTME: Captures screenshots of all major pages in light and dark mode

import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';
import path from 'path';

const BASE_URL = 'http://localhost:3333';
const OUTPUT_DIR = path.join(process.cwd(), 'visual-assessment');

const PAGES = [
  { name: 'homepage', path: '/' },
  { name: 'about', path: '/about' },
  { name: 'portfolio', path: '/portfolio' },
  { name: 'blog', path: '/blog' },
  { name: 'contact', path: '/contact' },
  { name: 'pricing', path: '/pricing' },
];

const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
];

async function captureScreenshots() {
  // Create output directory
  await mkdir(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });

  console.log('🎨 Starting visual assessment...\n');

  for (const page of PAGES) {
    console.log(`📸 Capturing ${page.name}...`);

    for (const viewport of VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
      });

      const browserPage = await context.newPage();

      // Light mode
      await browserPage.goto(`${BASE_URL}${page.path}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await browserPage.waitForTimeout(2000); // Wait for any animations and images

      const lightPath = path.join(OUTPUT_DIR, `${page.name}-${viewport.name}-light.png`);
      await browserPage.screenshot({ path: lightPath, fullPage: true });
      console.log(`  ✓ ${viewport.name} (light mode)`);

      // Dark mode
      await browserPage.evaluate(() => {
        document.documentElement.classList.add('dark');
      });
      await browserPage.waitForTimeout(500); // Wait for dark mode transition

      const darkPath = path.join(OUTPUT_DIR, `${page.name}-${viewport.name}-dark.png`);
      await browserPage.screenshot({ path: darkPath, fullPage: true });
      console.log(`  ✓ ${viewport.name} (dark mode)`);

      await context.close();
    }

    console.log('');
  }

  await browser.close();

  console.log('✅ Visual assessment complete!');
  console.log(`📁 Screenshots saved to: ${OUTPUT_DIR}`);
  console.log(`\n📊 Total screenshots: ${PAGES.length * VIEWPORTS.length * 2}`);
}

captureScreenshots().catch((error) => {
  console.error('❌ Error during visual assessment:', error);
  process.exit(1);
});
