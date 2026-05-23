// ---------------------------------------------------------------------------
// Types — Strapi v5 flat response format (no `attributes` wrapper)
// ---------------------------------------------------------------------------

export type MediaType = 'Image' | 'Video' | 'Carousel' | 'ExternalLink'

export interface LinkPreviewCard {
  title: string
  description: string
  thumbnailUrl: string
}

export interface StrapiBlock {
  type: string
  children: Array<{ type: string; text: string }>
}

export interface StrapiEngagement {
  id: number
  documentId: string
  title: string
  description: StrapiBlock[]
  eventDate: string
  isFeatured: boolean
  linkedinPostId?: string
  postUrl?: string
  mediaUrls?: string[]
  mediaType?: MediaType
  linkPreviewCard?: LinkPreviewCard
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface StrapiCertification {
  id: number
  documentId: string
  title: string
  issuingBody: string
  badgeImage: { id: number; url: string; alternativeText?: string } | null
  verificationUrl: string
  expiryDate?: string | null
  linkedinCertId?: string
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateEngagementInput {
  title: string
  description: StrapiBlock[]
  eventDate: string
  isFeatured: boolean
  linkedinPostId: string
  postUrl: string
  mediaUrls: string[]
  mediaType: MediaType
  linkPreviewCard?: LinkPreviewCard
}

export interface CreateCertificationInput {
  title: string
  issuingBody: string
  badgeImage: number   // Strapi media entry numeric id
  verificationUrl: string
  expiryDate?: string
  linkedinCertId: string
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

interface StrapiListResponse<T> {
  data: T[]
  meta: { pagination: { page: number; pageSize: number; pageCount: number; total: number } }
}

function getEnv(key: string): string {
  const val = process.env[key]
  if (!val) throw new Error(`Missing required environment variable: ${key}`)
  return val
}

function authHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${getEnv('STRAPI_SYNC_API_TOKEN')}`,
    'Content-Type': 'application/json',
  }
}

function baseUrl(): string {
  return getEnv('STRAPI_API_URL')
}

async function strapiGet<T>(path: string): Promise<StrapiListResponse<T>> {
  const res = await fetch(`${baseUrl()}${path}`, { headers: authHeaders() })
  if (!res.ok) throw new Error(`Strapi GET ${path} failed: ${res.status} ${res.statusText}`)
  return res.json() as Promise<StrapiListResponse<T>>
}

async function strapiPost<T>(path: string, body: unknown): Promise<{ data: T }> {
  const res = await fetch(`${baseUrl()}${path}`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ data: body }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Strapi POST ${path} failed: ${res.status} — ${text}`)
  }
  return res.json() as Promise<{ data: T }>
}

async function strapiPut<T>(path: string, body: unknown): Promise<{ data: T }> {
  const res = await fetch(`${baseUrl()}${path}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ data: body }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Strapi PUT ${path} failed: ${res.status} — ${text}`)
  }
  return res.json() as Promise<{ data: T }>
}

// ---------------------------------------------------------------------------
// EngagementAndActivity
// ---------------------------------------------------------------------------

export async function findEngagementByLinkedinPostId(
  postId: string
): Promise<StrapiEngagement | null> {
  const encoded = encodeURIComponent(postId)
  const res = await strapiGet<StrapiEngagement>(
    `/api/engagement-and-activities?filters[linkedinPostId][$eq]=${encoded}&pagination[limit]=1`
  )
  return res.data[0] ?? null
}

export async function createEngagement(
  data: CreateEngagementInput
): Promise<StrapiEngagement> {
  const res = await strapiPost<StrapiEngagement>(
    '/api/engagement-and-activities?status=published',
    data
  )
  return res.data
}

export async function updateEngagementMedia(
  documentId: string,
  mediaUrls: string[]
): Promise<void> {
  await strapiPut<StrapiEngagement>(
    `/api/engagement-and-activities/${documentId}`,
    { mediaUrls }
  )
}

// ---------------------------------------------------------------------------
// Certification
// ---------------------------------------------------------------------------

export async function findCertificationByLinkedinCertId(
  linkedinCertId: string
): Promise<StrapiCertification | null> {
  const encoded = encodeURIComponent(linkedinCertId)
  const res = await strapiGet<StrapiCertification>(
    `/api/certifications?filters[linkedinCertId][$eq]=${encoded}&pagination[limit]=1`
  )
  return res.data[0] ?? null
}

export async function findCertificationByCompositeKey(
  title: string,
  issuingBody: string
): Promise<StrapiCertification | null> {
  const t = encodeURIComponent(title)
  const b = encodeURIComponent(issuingBody)
  const res = await strapiGet<StrapiCertification>(
    `/api/certifications?filters[title][$eq]=${t}&filters[issuingBody][$eq]=${b}&pagination[limit]=1`
  )
  return res.data[0] ?? null
}

export async function createCertification(
  data: CreateCertificationInput
): Promise<StrapiCertification> {
  const res = await strapiPost<StrapiCertification>(
    '/api/certifications?status=published',
    data
  )
  return res.data
}

// ---------------------------------------------------------------------------
// Media upload — badge images via Strapi's /api/upload (proxies to Cloudinary)
// ---------------------------------------------------------------------------

export async function uploadBadgeToStrapiMedia(imageUrl: string): Promise<number> {
  const imageRes = await fetch(imageUrl)
  if (!imageRes.ok) {
    throw new Error(`Failed to download badge image from ${imageUrl}: ${imageRes.status}`)
  }

  const buffer = await imageRes.arrayBuffer()
  const filename = imageUrl.split('/').pop()?.split('?')[0] ?? 'badge.png'

  const form = new FormData()
  form.append('files', new Blob([buffer]), filename)

  const uploadRes = await fetch(`${baseUrl()}/api/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getEnv('STRAPI_SYNC_API_TOKEN')}` },
    body: form,
  })

  if (!uploadRes.ok) {
    const text = await uploadRes.text()
    throw new Error(`Strapi /api/upload failed: ${uploadRes.status} — ${text}`)
  }

  const uploaded = (await uploadRes.json()) as Array<{ id: number }>
  if (!uploaded[0]?.id) throw new Error('Strapi /api/upload returned no media entry')
  return uploaded[0].id
}
