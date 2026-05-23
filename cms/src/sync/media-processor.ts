import { v2 as cloudinary } from 'cloudinary'
import { uploadBadgeToStrapiMedia } from './strapi-client'

function initCloudinary(): void {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
  })
}

async function fetchBufferWithTimeout(url: string, timeoutMs = 10_000): Promise<Buffer> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { signal: controller.signal })
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`)
    return Buffer.from(await res.arrayBuffer())
  } finally {
    clearTimeout(timer)
  }
}

function uploadBufferToCloudinary(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ resource_type: 'auto' }, (error, result) => {
        if (error || !result) {
          return reject(error ?? new Error('No result returned from Cloudinary'))
        }
        resolve(result.secure_url)
      })
      .end(buffer)
  })
}

export async function syncPostMediaToCloudinary(mediaUrls: string[]): Promise<string[]> {
  initCloudinary()
  const permanent: string[] = []

  for (const url of mediaUrls) {
    try {
      const buffer = await fetchBufferWithTimeout(url)
      const secureUrl = await uploadBufferToCloudinary(buffer)
      permanent.push(secureUrl)
    } catch (err) {
      console.error(`[media-processor] Skipping asset ${url}:`, err)
    }
  }

  return permanent
}

export async function uploadBadgeViaStrapi(badgeUrl: string): Promise<number> {
  return uploadBadgeToStrapiMedia(badgeUrl)
}
