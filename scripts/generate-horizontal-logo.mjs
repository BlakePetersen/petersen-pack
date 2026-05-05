// ABOUTME: Generates horizontal logo SVG with vectorized text
// ABOUTME: Matches the nav logo layout with icon + text side by side

import opentype from 'opentype.js';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Download fonts if needed
async function downloadFonts() {
  const fontsDir = join(__dirname, 'fonts');
  if (!existsSync(fontsDir)) {
    mkdirSync(fontsDir, { recursive: true });
  }

  const fonts = [
    {
      name: 'PlayfairDisplay-Regular.ttf',
      url: 'https://fonts.gstatic.com/s/playfairdisplay/v40/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvUDQ.ttf'
    },
    {
      name: 'Inter-Medium.ttf',
      url: 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fMZg.ttf'
    }
  ];

  for (const font of fonts) {
    const fontPath = join(fontsDir, font.name);
    if (!existsSync(fontPath)) {
      console.log(`Downloading ${font.name}...`);
      const response = await fetch(font.url);
      const buffer = await response.arrayBuffer();
      writeFileSync(fontPath, Buffer.from(buffer));
    }
  }
}

await downloadFonts();

// Load fonts
const playfair = opentype.loadSync(join(__dirname, 'fonts/PlayfairDisplay-Regular.ttf'));
const inter = opentype.loadSync(join(__dirname, 'fonts/Inter-Medium.ttf'));

/**
 * Calculate text width with letter spacing
 */
function getTextWidth(text, font, fontSize, letterSpacing) {
  let totalWidth = 0;
  for (let i = 0; i < text.length; i++) {
    const glyph = font.charToGlyph(text[i]);
    totalWidth += glyph.advanceWidth * (fontSize / font.unitsPerEm);
    if (i < text.length - 1) {
      totalWidth += letterSpacing;
    }
  }
  return totalWidth;
}

/**
 * Convert text to SVG path with letter spacing
 */
function textToPath(text, font, fontSize, x, y, letterSpacing) {
  let pathData = '';
  let currentX = 0;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const glyph = font.charToGlyph(char);
    const glyphPath = glyph.getPath(x + currentX, y, fontSize);
    pathData += glyphPath.toPathData() + ' ';
    currentX += glyph.advanceWidth * (fontSize / font.unitsPerEm);
    if (i < text.length - 1) {
      currentX += letterSpacing;
    }
  }

  return { pathData: pathData.trim(), width: currentX };
}

// Layout settings
const totalHeight = 50;
const iconScale = 50 / 130;
const iconWidth = 76 * iconScale;
const gap = 10;
const textX = iconWidth + gap;

// ASHLEY PETERSEN settings (fixed)
const ashleyFontSize = 10;
const ashleyLetterSpacing = 2.5;
const ashleyWidth = getTextWidth('ASHLEY PETERSEN', inter, ashleyFontSize, ashleyLetterSpacing);

console.log(`ASHLEY PETERSEN width: ${ashleyWidth.toFixed(2)}px`);

// Find Photography size that matches ASHLEY width
// Start with base size and letter spacing, then scale to match
let photographyFontSize = 17;
let photographyLetterSpacing = 3.5;
let photographyWidth = getTextWidth('Photography', playfair, photographyFontSize, photographyLetterSpacing);

// Scale factor to match widths
const scaleFactor = ashleyWidth / photographyWidth;
photographyFontSize = photographyFontSize * scaleFactor;
photographyLetterSpacing = photographyLetterSpacing * scaleFactor;

// Verify
photographyWidth = getTextWidth('Photography', playfair, photographyFontSize, photographyLetterSpacing);
console.log(`Photography width: ${photographyWidth.toFixed(2)}px (font-size: ${photographyFontSize.toFixed(2)}px)`);

// Text positions
const ashleyY = 18;
const photographyY = 38;

// Generate paths
const ashleyPath = textToPath('ASHLEY PETERSEN', inter, ashleyFontSize, textX, ashleyY, ashleyLetterSpacing);
const photographyPath = textToPath('Photography', playfair, photographyFontSize, textX, photographyY, photographyLetterSpacing);

const totalWidth = textX + ashleyWidth + 2;

console.log(`Total logo size: ${totalWidth.toFixed(0)} × ${totalHeight}`);

// Icon SVG
const iconSvg = `
  <g transform="scale(${iconScale.toFixed(4)}) translate(-12, 8)">
    <defs>
      <mask id="MASK_ID">
        <rect x="0" y="-20" width="120" height="160" fill="white"/>
        <ellipse cx="49.782" cy="50.319" rx="20.407" ry="20.393" fill="black"/>
      </mask>
    </defs>
    <g mask="url(#MASK_ID)" stroke="FILL_COLOR" stroke-linecap="butt" stroke-linejoin="round">
      <line x1="50" y1="9.983" x2="50" y2="34.466" stroke-width="5"/>
      <line x1="71.884" y1="28.116" x2="61.818" y2="38.182" stroke-width="4"/>
      <line x1="70.232" y1="50" x2="80" y2="50" stroke-width="3"/>
      <line x1="71.83" y1="71.83" x2="61.672" y2="61.672" stroke-width="4"/>
      <line x1="50" y1="66.247" x2="50" y2="91" stroke-width="5" stroke-linecap="round"/>
      <line x1="28.17" y1="71.83" x2="37" y2="63" stroke-width="4"/>
      <polyline points="20 50 27.15 50 32.711 50" stroke-width="3"/>
      <line x1="28.17" y1="28.17" x2="37" y2="37" stroke-width="4"/>
    </g>
    <g fill="FILL_COLOR" stroke="FILL_COLOR">
      <circle cx="50" cy="0" r="0.5" stroke-width="3.5"/>
      <circle cx="50" cy="10" r="0.5" stroke-width="4"/>
      <circle cx="71.83" cy="28.17" r="0.25" stroke-width="3.5"/>
      <circle cx="80" cy="50" r="0.125" stroke-width="2.785"/>
      <circle cx="71.83" cy="71.83" r="0.25" stroke-width="3.5"/>
      <circle cx="50" cy="91" r="0.5" stroke-width="4"/>
      <circle cx="50" cy="100.997" r="0.5" stroke-width="3.5"/>
      <circle cx="50" cy="111.033" r="0.5" stroke-width="2.75"/>
      <circle cx="28.17" cy="71.83" r="0.25" stroke-width="3.5"/>
      <circle cx="20" cy="50" r="0.125" stroke-width="2.75"/>
      <circle cx="28.17" cy="28.17" r="0.25" stroke-width="3.5"/>
    </g>
    <path
      d="M 48.197 29.548 C 65.672 29.548 71.297 42.811 71.045 50.372 C 70.468 67.705 56.307 70.867 48.197 70.867 C 59.207 70.822 62.763 55.949 62.483 49.81 C 61.999 39.216 55.789 29.389 48.197 29.548 Z"
      fill="FILL_COLOR"
      stroke="FILL_COLOR"
      stroke-width="1.33"
      stroke-linecap="round"
    />
  </g>`;

function generateSvg(fillColor, maskId) {
  const icon = iconSvg.replace(/FILL_COLOR/g, fillColor).replace(/MASK_ID/g, maskId);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${Math.ceil(totalWidth)} ${totalHeight}" fill="none">
${icon}

  <!-- "ASHLEY PETERSEN" -->
  <path
    d="${ashleyPath.pathData}"
    fill="${fillColor}"
  />

  <!-- "Photography" -->
  <path
    d="${photographyPath.pathData}"
    fill="${fillColor}"
  />
</svg>`;
}

const darkSvg = generateSvg('#171717', 'hz-ray-mask-dark');
const lightSvg = generateSvg('#fafafa', 'hz-ray-mask-light');

// Save to brand directory
const brandDir = join(__dirname, '../public/brand');
writeFileSync(join(brandDir, 'luna-horizontal-dark.svg'), darkSvg);
writeFileSync(join(brandDir, 'luna-horizontal-light.svg'), lightSvg);

console.log('\nSaved to public/brand/luna-horizontal-dark.svg and luna-horizontal-light.svg');
