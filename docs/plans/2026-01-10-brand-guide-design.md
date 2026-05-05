# Brand Guide Page Design

Public brand guidelines page at `/brand` with downloadable logo assets for marketing use.

## Assets to Export

### Logo Icon (LunaLogo)

- `luna-icon.svg` - Vector, scalable
- `luna-icon-dark.png` - For light backgrounds (64, 128, 256, 512, 1024px)
- `luna-icon-light.png` - For dark backgrounds (64, 128, 256, 512, 1024px)

### Full Logo (LogoBranding)

- `luna-full.svg` - Icon + "Ashley Petersen Photography" text
- `luna-full-dark.png` - For light backgrounds (multiple sizes)
- `luna-full-light.png` - For dark backgrounds (multiple sizes)

### Bundle

- `luna-brand-assets.zip` - All assets in one download

## Color Palette

| Name           | Hex     | Usage                                 |
| -------------- | ------- | ------------------------------------- |
| Orange Accent  | #fb923c | Highlights, CTAs, decorative elements |
| Neutral Dark   | #171717 | Text, logo on light backgrounds       |
| Neutral Light  | #fafafa | Logo on dark backgrounds              |
| Warm Orange 50 | #fff7ed | Subtle backgrounds                    |

## Typography

- **Headings**: Playfair Display (serif)
- **Body**: Inter (sans-serif)
- **Logo text**:
  - "Ashley Petersen": uppercase, 12px, letter-spacing 3px
  - "Photography": Playfair Display, 20px, letter-spacing 4px

## Page Sections

1. **Hero** - Centered logo, "Brand Guidelines" heading
2. **Logo Downloads** - Grid of assets with download buttons
3. **Color Palette** - Visual swatches with hex codes, copy-to-clipboard
4. **Typography** - Font specimens with usage examples
5. **Usage Guidelines** - Do's and don'ts with visual examples
6. **Photography Style** - Style notes for consistent imagery
7. **Brand Voice** - Tone and messaging guidelines

## Usage Guidelines

### Do

- Maintain clear space (minimum: icon height)
- Use on clean backgrounds
- Scale proportionally

### Don't

- Rotate or distort
- Place on busy imagery
- Change icon-to-text proportions
- Use low-contrast colors

## Photography Style

- Natural light, warm tones
- Candid moments over posed
- Soft, romantic aesthetic
- Earth tones and golden hour

## Brand Voice

- Warm and approachable
- Professional but not formal
- Personal client connection
- Celebrates authentic moments

## Implementation

### Files

- `public/brand/` - Static assets directory
- `app/brand/page.tsx` - Brand guide page
- `scripts/generate-brand-assets.ts` - Asset generation script

### Footer Update

Add "Brand" link to `GlobalFooter.tsx` navigation after "My Photos"
