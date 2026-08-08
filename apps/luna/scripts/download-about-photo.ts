// ABOUTME: Script to download Ashley's photo from the legacy about page
// ABOUTME: Downloads and processes the about page portrait image

import axios from 'axios'
import * as cheerio from 'cheerio'
import * as fs from 'fs'
import * as path from 'path'
import sharp from 'sharp'

const ABOUT_URL = 'https://www.ashleypetersenphoto.com/bio'
const DOWNLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'scraped')

// Ensure download directory exists
if (!fs.existsSync(DOWNLOAD_DIR)) {
  fs.mkdirSync(DOWNLOAD_DIR, { recursive: true })
}

async function downloadAboutPhoto() {
  try {
    console.log('Fetching about page...')
    const response = await axios.get(ABOUT_URL, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
    })

    const $ = cheerio.load(response.data)

    // Find the main portrait image
    const imageUrl =
      $('.sqs-block-image img').first().attr('data-src') ||
      $('.sqs-block-image img').first().attr('src')

    if (!imageUrl) {
      console.log('No image found on about page')
      return
    }

    console.log(`Found image: ${imageUrl}`)

    // Ensure URL is absolute
    const fullUrl = imageUrl.startsWith('http') ? imageUrl : `https:${imageUrl}`

    // Download the image
    const tempPath = path.join(DOWNLOAD_DIR, 'ashley-about-temp.jpg')
    const finalPath = path.join(DOWNLOAD_DIR, 'ashley-about.webp')

    console.log('Downloading image...')
    const imageResponse = await axios.get(fullUrl, {
      responseType: 'arraybuffer',
      timeout: 30000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
    })

    fs.writeFileSync(tempPath, imageResponse.data)
    console.log('✓ Downloaded')

    // Process with Sharp
    console.log('Processing image...')
    await sharp(tempPath)
      .resize(1200, 1600, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 85 })
      .toFile(finalPath)

    console.log('✓ Processed and saved as WebP')

    // Clean up temp file
    fs.unlinkSync(tempPath)

    console.log(`\n✅ Successfully downloaded Ashley's about photo to:`)
    console.log(`   ${finalPath}`)
    console.log(`\n   Use in AboutSection: /uploads/scraped/ashley-about.webp`)
  } catch (error) {
    console.error('Error downloading about photo:', error)
  }
}

downloadAboutPhoto()
