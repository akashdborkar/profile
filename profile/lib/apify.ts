const APIFY_BASE = 'https://api.apify.com/v2'

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
  postedAt: string
}

export interface LinkedInScraperPayload {
  certifications: IncomingCertification[]
  featuredPosts: IncomingFeaturedPost[]
}

export interface ApifyRunResult {
  runId: string
}

export async function triggerLinkedInActorRun(opts: {
  apifyToken: string
  actorId: string
  profileUrl: string
  webhookUrl: string
}): Promise<ApifyRunResult> {
  // Webhooks must be a Base64-encoded JSON array in the query string — NOT in the actor input body
  const webhooksB64 = Buffer.from(
    JSON.stringify([{ eventTypes: ['ACTOR.RUN.SUCCEEDED', 'ACTOR.RUN.FAILED'], requestUrl: opts.webhookUrl }])
  ).toString('base64')

  const res = await fetch(
    `${APIFY_BASE}/acts/${encodeURIComponent(opts.actorId)}/runs?webhooks=${encodeURIComponent(webhooksB64)}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${opts.apifyToken}`,
      },
      body: JSON.stringify({
        profileUrls: [opts.profileUrl],
        scrapeType: 'profiles',
        maxResults: 1,
      }),
    }
  )

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Apify actor trigger failed: ${res.status} — ${text}`)
  }

  const json = await res.json()
  return { runId: json.data?.id ?? json.id }
}

export async function fetchDatasetItems(datasetId: string, apifyToken: string): Promise<unknown[]> {
  const res = await fetch(`${APIFY_BASE}/datasets/${datasetId}/items?clean=true`, {
    headers: { Authorization: `Bearer ${apifyToken}` },
  })

  if (!res.ok) {
    throw new Error(`Apify dataset fetch failed: ${res.status}`)
  }

  return res.json()
}

// --- Transformer ---
// Handles output from sovereigntaylor/linkedin-profile-scraper.
// If switching actors, only the functions below need updating.

type RawCert = Record<string, unknown>
type RawPost = Record<string, unknown>
type RawProfile = Record<string, unknown>

// Handles "Jan 2026" string OR { endDate: { year: 2026, month: 1 } } object
function toExpiryDate(raw: unknown): string | undefined {
  if (!raw) return undefined

  // String format: "Jan 2026", "2026-01", "January 2026"
  if (typeof raw === 'string') {
    const parsed = new Date(raw)
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().slice(0, 10)
    }
    return undefined
  }

  // Object format: { endDate: { year: 2026, month: 1 } }
  if (typeof raw === 'object') {
    const tp = raw as Record<string, unknown>
    const end = (tp.endDate ?? tp) as Record<string, unknown> | undefined
    if (!end?.year) return undefined
    const month = String(end.month ?? 1).padStart(2, '0')
    return `${end.year}-${month}-01`
  }

  return undefined
}

function transformCertification(cert: RawCert): IncomingCertification | null {
  const title = (cert.name ?? cert.title) as string | undefined
  const issuingBody = (cert.authority ?? cert.issuingOrganization ?? cert.company) as string | undefined

  if (!title || !issuingBody) return null

  const linkedinCertId =
    ((cert.licenseNumber ?? cert.credentialId ?? cert.certificationId ?? cert.id) as string | undefined) ??
    `${title}::${issuingBody}`

  const verificationUrl =
    ((cert.url ?? cert.credentialUrl ?? cert.verificationUrl) as string | undefined) ?? ''

  const badgeUrl =
    ((cert.img ?? cert.imageUrl ?? cert.badgeUrl ?? cert.logoUrl) as string | undefined) ?? ''

  // sovereigntaylor actor returns "expiryDate" string; others use timePeriod object
  const expiry = toExpiryDate(cert.expiryDate ?? cert.timePeriod)

  return {
    linkedinCertId,
    title,
    issuingBody,
    badgeUrl,
    verificationUrl,
    ...(expiry ? { expiryDate: expiry } : {}),
  }
}

function transformPost(post: RawPost): IncomingFeaturedPost | null {
  const linkedinPostId =
    ((post.id ?? post.postId ?? post.linkedinPostId) as string | undefined)
  const postUrl = (post.url ?? post.postUrl) as string | undefined
  const textContent = (post.text ?? post.content ?? post.description ?? '') as string
  const postedAt = (post.createdAt ?? post.postedAt ?? post.publishedAt ?? new Date().toISOString()) as string

  if (!linkedinPostId || !postUrl) return null

  return {
    linkedinPostId,
    postUrl,
    textContent,
    postedAt,
  }
}

export function transformLinkedInOutput(items: unknown[]): LinkedInScraperPayload {
  if (!items.length) return { certifications: [], featuredPosts: [] }

  // Actor returns one object per input URL — take the first profile
  const profile = items[0] as RawProfile

  const rawCerts = (profile.certifications ?? profile.licenses ?? []) as RawCert[]
  const certifications = rawCerts
    .map(transformCertification)
    .filter((c): c is IncomingCertification => c !== null)

  // Posts may be under various keys depending on the actor
  const rawPosts = (
    profile.posts ?? profile.activities ?? profile.featuredActivity ?? profile.featured ?? []
  ) as RawPost[]
  const featuredPosts = rawPosts
    .map(transformPost)
    .filter((p): p is IncomingFeaturedPost => p !== null)

  return { certifications, featuredPosts }
}
