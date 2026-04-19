// ABOUTME: Shared Open Graph image renderer with terminal aesthetic.
// ABOUTME: Generates 1200x630 PNG images for social sharing on all content routes.
// theme-static: OG images render server-side to PNG and are theme-independent by design;
// social platforms preview the same image regardless of the visitor's site theme.

import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

interface OgImageOptions {
  title: string
  category: string
  itemCount?: number
}

export async function renderOgImage({
  title,
  category,
  itemCount,
}: OgImageOptions): Promise<ImageResponse> {
  const fontData = await readFile(
    join(process.cwd(), 'assets', 'JetBrainsMono-Bold.ttf'),
  )

  const displayText =
    itemCount !== undefined ? `${itemCount} ${category}` : title

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          backgroundColor: '#0a0a0a',
          padding: '60px',
          fontFamily: 'JetBrains Mono',
          color: '#e5e5e5',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: '1',
            border: '1px solid #333',
            padding: '40px',
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: '20px',
              color: '#737373',
              marginBottom: '24px',
            }}
          >
            {'// blake_petersen'}
          </div>

          <div
            style={{
              display: 'flex',
              fontSize: '14px',
              color: '#f59e0b',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '20px',
            }}
          >
            {category}
          </div>

          <div
            style={{
              display: 'flex',
              fontSize: itemCount !== undefined ? '64px' : '42px',
              fontWeight: 'bold',
              color: '#e5e5e5',
              lineHeight: 1.2,
              flex: '1',
            }}
          >
            {displayText}
          </div>

          <div
            style={{
              display: 'flex',
              fontSize: '16px',
              color: '#525252',
              marginTop: '20px',
            }}
          >
            {'$ cat /dev/dx | grep patterns'}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'JetBrains Mono',
          data: fontData,
          style: 'normal',
          weight: 700,
        },
      ],
    },
  )
}

export const ogImageSize = { width: 1200, height: 630 }
export const ogImageContentType = 'image/png'
