import { uploadBadgeToStrapiMedia } from './strapi-client'

export async function uploadBadgeViaStrapi(badgeUrl: string): Promise<number> {
  return uploadBadgeToStrapiMedia(badgeUrl)
}
