// ABOUTME: Test if the Vercel blob URL is accessible
// ABOUTME: Quick check to verify the image URL loads

const imageUrl =
  'https://iwdr7kqxwo00nm51.public.blob.vercel-storage.com/images/general/1764036562365-IMG_7954.webp'

console.log('Testing image URL:', imageUrl)

fetch(imageUrl)
  .then((response) => {
    console.log('Response status:', response.status)
    console.log('Response ok:', response.ok)
    console.log('Content-Type:', response.headers.get('content-type'))
    return response.blob()
  })
  .then((blob) => {
    console.log('Blob size:', blob.size, 'bytes')
    console.log('Blob type:', blob.type)
    console.log('✅ Image URL is accessible and valid')
  })
  .catch((error) => {
    console.error('❌ Error fetching image:', error)
  })
