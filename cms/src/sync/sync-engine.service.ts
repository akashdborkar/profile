import * as defaultStrapi from './strapi-client'
import * as defaultMedia from './media-processor'
import type { StrapiBlock, MediaType, LinkPreviewCard } from './strapi-client'

export interface IncomingCertification {
  linkedinCertId: string
  title: string
  issuingBody: string
  badgeUrl: string
  verificationUrl: string
  expiryDate?: string
}

export interface IncomingFeaturedPost {
  linkedinPostId: string
  postUrl: string
  textContent: string
  mediaUrls: string[]
  mediaType: MediaType
  linkPreviewCard?: LinkPreviewCard
  postedAt: string
}

export interface LinkedInScraperPayload {
  certifications: IncomingCertification[]
  featuredPosts: IncomingFeaturedPost[]
}

export interface SyncResult {
  activitiesSynced: number
  certsSynced: number
}

type StrapiDeps = Pick<
  typeof defaultStrapi,
  | 'findCertificationByLinkedinCertId'
  | 'findCertificationByCompositeKey'
  | 'createCertification'
  | 'findEngagementByLinkedinPostId'
  | 'createEngagement'
  | 'updateEngagementMedia'
>

type MediaDeps = Pick<
  typeof defaultMedia,
  'syncPostMediaToCloudinary' | 'uploadBadgeViaStrapi'
>

export interface SyncDeps {
  strapi?: StrapiDeps
  media?: MediaDeps
  revalidate?: (model: string) => Promise<void>
}

function getEnv(key: string): string {
  const val = process.env[key]
  if (!val) throw new Error(`Missing required environment variable: ${key}`)
  return val
}

function toEventDate(isoString: string): string {
  return new Date(isoString).toISOString().slice(0, 10)
}

function toBlocksDescription(text: string): StrapiBlock[] {
  return [{ type: 'paragraph', children: [{ type: 'text', text }] }]
}

async function defaultRevalidate(model: string): Promise<void> {
  const url = getEnv('NEXT_REVALIDATION_URL')
  const token = getEnv('REVALIDATION_SECRET_TOKEN')
  const res = await fetch(`${url}/api/revalidate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ model }),
  })
  if (!res.ok) {
    console.error(`[sync-engine] Revalidation for model "${model}" failed: ${res.status}`)
  }
}

async function syncCertification(
  cert: IncomingCertification,
  strapi: StrapiDeps,
  media: MediaDeps
): Promise<boolean> {
  const existing =
    (await strapi.findCertificationByLinkedinCertId(cert.linkedinCertId)) ??
    (await strapi.findCertificationByCompositeKey(cert.title, cert.issuingBody))

  if (existing) return false

  const badgeImageId = await media.uploadBadgeViaStrapi(cert.badgeUrl)

  await strapi.createCertification({
    title: cert.title,
    issuingBody: cert.issuingBody,
    badgeImage: badgeImageId,
    verificationUrl: cert.verificationUrl,
    ...(cert.expiryDate && { expiryDate: cert.expiryDate }),
    linkedinCertId: cert.linkedinCertId,
  })

  return true
}

async function syncFeaturedPost(
  post: IncomingFeaturedPost,
  strapi: StrapiDeps,
  media: MediaDeps
): Promise<boolean> {
  const existing = await strapi.findEngagementByLinkedinPostId(post.linkedinPostId)
  const permanentMediaUrls = await media.syncPostMediaToCloudinary(post.mediaUrls)

  if (existing) {
    await strapi.updateEngagementMedia(existing.documentId, permanentMediaUrls)
    return true
  }

  await strapi.createEngagement({
    title: post.textContent.trim().slice(0, 100),
    description: toBlocksDescription(post.textContent),
    eventDate: toEventDate(post.postedAt),
    isFeatured: false,
    linkedinPostId: post.linkedinPostId,
    postUrl: post.postUrl,
    mediaUrls: permanentMediaUrls,
    mediaType: post.mediaType,
    ...(post.linkPreviewCard && { linkPreviewCard: post.linkPreviewCard }),
  })

  return true
}

export async function syncLinkedInData(
  incomingData: LinkedInScraperPayload,
  deps: SyncDeps = {}
): Promise<SyncResult> {
  const strapi: StrapiDeps = deps.strapi ?? defaultStrapi
  const media: MediaDeps = deps.media ?? defaultMedia
  const revalidate = deps.revalidate ?? defaultRevalidate

  let certsSynced = 0
  let activitiesSynced = 0

  for (const cert of incomingData.certifications) {
    try {
      if (await syncCertification(cert, strapi, media)) certsSynced++
    } catch (err) {
      console.error(`[sync-engine] Failed to sync cert "${cert.title}":`, err)
    }
  }

  for (const post of incomingData.featuredPosts) {
    try {
      if (await syncFeaturedPost(post, strapi, media)) activitiesSynced++
    } catch (err) {
      console.error(`[sync-engine] Failed to sync post "${post.linkedinPostId}":`, err)
    }
  }

  await revalidate('certification')
  await revalidate('engagement-and-activity')

  return { certsSynced, activitiesSynced }
}
