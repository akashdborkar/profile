import { vi, describe, it, expect, beforeEach } from 'vitest'
import { syncLinkedInData } from '../sync-engine.service.js'
import type { LinkedInScraperPayload, SyncDeps } from '../sync-engine.service.js'
import type { StrapiEngagement, StrapiCertification } from '../strapi-client.js'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const existingEngagement: StrapiEngagement = {
  id: 1,
  documentId: 'doc-eng-abc',
  title: 'Custom edited title',
  description: [{ type: 'paragraph', children: [{ type: 'text', text: 'Edited by hand in Strapi' }] }],
  eventDate: '2025-01-01',
  isFeatured: true,
  linkedinPostId: 'urn:li:activity:existing',
  postUrl: 'https://linkedin.com/posts/existing',
  mediaUrls: ['https://res.cloudinary.com/old.jpg'],
  mediaType: 'Image',
  publishedAt: '2025-01-01T00:00:00.000Z',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
}

const existingCertification: StrapiCertification = {
  id: 2,
  documentId: 'doc-cert-xyz',
  title: 'AWS Solutions Architect',
  issuingBody: 'Amazon Web Services',
  badgeImage: { id: 10, url: 'https://res.cloudinary.com/badge.png' },
  verificationUrl: 'https://aws.amazon.com/verify/123',
  linkedinCertId: 'li-cert-existing',
  publishedAt: '2025-01-01T00:00:00.000Z',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
}

const newCertPayload: LinkedInScraperPayload['certifications'][0] = {
  linkedinCertId: 'li-cert-new',
  title: 'Azure Solutions Architect Expert',
  issuingBody: 'Microsoft',
  badgeUrl: 'https://li-cdn.com/badge.png',
  verificationUrl: 'https://microsoft.com/verify/42',
  expiryDate: '2027-01-01',
}

const newPostPayload: LinkedInScraperPayload['featuredPosts'][0] = {
  linkedinPostId: 'urn:li:activity:new',
  postUrl: 'https://linkedin.com/posts/new',
  textContent: 'This is a brand new LinkedIn post about TypeScript and Strapi integration.',
  mediaUrls: ['https://li-cdn.com/img.jpg'],
  mediaType: 'Image',
  postedAt: '2025-06-15T10:00:00.000Z',
}

const existingPostPayload: LinkedInScraperPayload['featuredPosts'][0] = {
  ...newPostPayload,
  linkedinPostId: 'urn:li:activity:existing',
  textContent: 'Updated text that should NOT overwrite the custom Strapi edit.',
}

// ---------------------------------------------------------------------------
// Dep factory
// ---------------------------------------------------------------------------

function makeDeps(overrides: Partial<{
  findCertificationByLinkedinCertId: StrapiCertification | null
  findCertificationByCompositeKey: StrapiCertification | null
  createCertificationResult: StrapiCertification
  findEngagementByLinkedinPostId: StrapiEngagement | null
  createEngagementResult: StrapiEngagement
  syncPostMediaResult: string[]
  uploadBadgeResult: number
}>= {}): { deps: SyncDeps; mocks: Record<string, ReturnType<typeof vi.fn>> } {
  const mocks = {
    findCertificationByLinkedinCertId: vi.fn().mockResolvedValue(
      overrides.findCertificationByLinkedinCertId ?? null
    ),
    findCertificationByCompositeKey: vi.fn().mockResolvedValue(
      overrides.findCertificationByCompositeKey ?? null
    ),
    createCertification: vi.fn().mockResolvedValue(
      overrides.createCertificationResult ?? existingCertification
    ),
    findEngagementByLinkedinPostId: vi.fn().mockResolvedValue(
      overrides.findEngagementByLinkedinPostId ?? null
    ),
    createEngagement: vi.fn().mockResolvedValue(
      overrides.createEngagementResult ?? existingEngagement
    ),
    updateEngagementMedia: vi.fn().mockResolvedValue(undefined),
    syncPostMediaToCloudinary: vi.fn().mockResolvedValue(
      overrides.syncPostMediaResult ?? ['https://res.cloudinary.com/permanent.jpg']
    ),
    uploadBadgeViaStrapi: vi.fn().mockResolvedValue(overrides.uploadBadgeResult ?? 42),
    revalidate: vi.fn().mockResolvedValue(undefined),
  }

  const deps: SyncDeps = {
    strapi: {
      findCertificationByLinkedinCertId: mocks.findCertificationByLinkedinCertId,
      findCertificationByCompositeKey: mocks.findCertificationByCompositeKey,
      createCertification: mocks.createCertification,
      findEngagementByLinkedinPostId: mocks.findEngagementByLinkedinPostId,
      createEngagement: mocks.createEngagement,
      updateEngagementMedia: mocks.updateEngagementMedia,
    },
    media: {
      syncPostMediaToCloudinary: mocks.syncPostMediaToCloudinary,
      uploadBadgeViaStrapi: mocks.uploadBadgeViaStrapi,
    },
    revalidate: mocks.revalidate,
  }

  return { deps, mocks }
}

// ---------------------------------------------------------------------------
// Certification sync
// ---------------------------------------------------------------------------

describe('Certification sync', () => {
  it('uploads the badge and creates the certification when it is brand new', async () => {
    const { deps, mocks } = makeDeps({ uploadBadgeResult: 77 })

    const result = await syncLinkedInData({ certifications: [newCertPayload], featuredPosts: [] }, deps)

    expect(mocks.uploadBadgeViaStrapi).toHaveBeenCalledOnce()
    expect(mocks.uploadBadgeViaStrapi).toHaveBeenCalledWith(newCertPayload.badgeUrl)

    expect(mocks.createCertification).toHaveBeenCalledOnce()
    expect(mocks.createCertification).toHaveBeenCalledWith(
      expect.objectContaining({
        title: newCertPayload.title,
        issuingBody: newCertPayload.issuingBody,
        badgeImage: 77,
        verificationUrl: newCertPayload.verificationUrl,
        linkedinCertId: newCertPayload.linkedinCertId,
        expiryDate: newCertPayload.expiryDate,
      })
    )

    expect(result.certsSynced).toBe(1)
  })

  it('skips when found by linkedinCertId — no badge upload, no create call', async () => {
    const { deps, mocks } = makeDeps({
      findCertificationByLinkedinCertId: existingCertification,
    })

    const result = await syncLinkedInData({ certifications: [newCertPayload], featuredPosts: [] }, deps)

    expect(mocks.findCertificationByLinkedinCertId).toHaveBeenCalledOnce()
    expect(mocks.findCertificationByCompositeKey).not.toHaveBeenCalled()
    expect(mocks.uploadBadgeViaStrapi).not.toHaveBeenCalled()
    expect(mocks.createCertification).not.toHaveBeenCalled()

    expect(result.certsSynced).toBe(0)
  })

  it('falls back to composite key lookup when linkedinCertId is not found, then skips', async () => {
    const { deps, mocks } = makeDeps({
      findCertificationByLinkedinCertId: null,
      findCertificationByCompositeKey: existingCertification,
    })

    const result = await syncLinkedInData({ certifications: [newCertPayload], featuredPosts: [] }, deps)

    expect(mocks.findCertificationByLinkedinCertId).toHaveBeenCalledOnce()
    expect(mocks.findCertificationByCompositeKey).toHaveBeenCalledOnce()
    expect(mocks.createCertification).not.toHaveBeenCalled()

    expect(result.certsSynced).toBe(0)
  })

  it('omits expiryDate from the create payload when not provided', async () => {
    const { deps, mocks } = makeDeps()
    const certWithoutExpiry = { ...newCertPayload, expiryDate: undefined }

    await syncLinkedInData({ certifications: [certWithoutExpiry], featuredPosts: [] }, deps)

    const callArg = mocks.createCertification.mock.calls[0][0] as Record<string, unknown>
    expect(callArg).not.toHaveProperty('expiryDate')
  })

  it('logs and continues when badge upload throws — does not abort the whole sync', async () => {
    const { deps, mocks } = makeDeps()
    mocks.uploadBadgeViaStrapi.mockRejectedValue(new Error('Cloudinary error'))

    const secondCert = { ...newCertPayload, linkedinCertId: 'li-cert-second', title: 'Second Cert' }
    const result = await syncLinkedInData(
      { certifications: [newCertPayload, secondCert], featuredPosts: [] },
      deps
    )

    expect(mocks.createCertification).not.toHaveBeenCalled()
    expect(result.certsSynced).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// Featured post sync
// ---------------------------------------------------------------------------

describe('Featured post sync', () => {
  it('uploads media and creates the engagement with correct Blocks description for a new post', async () => {
    const { deps, mocks } = makeDeps({
      syncPostMediaResult: ['https://res.cloudinary.com/perm.jpg'],
    })

    const result = await syncLinkedInData(
      { certifications: [], featuredPosts: [newPostPayload] },
      deps
    )

    expect(mocks.syncPostMediaToCloudinary).toHaveBeenCalledWith(newPostPayload.mediaUrls)

    expect(mocks.createEngagement).toHaveBeenCalledOnce()
    const arg = mocks.createEngagement.mock.calls[0][0] as Record<string, unknown>

    // Title: first 100 chars of textContent, trimmed
    expect(arg.title).toBe(newPostPayload.textContent.trim().slice(0, 100))

    // description: Strapi Blocks paragraph format
    expect(arg.description).toEqual([
      { type: 'paragraph', children: [{ type: 'text', text: newPostPayload.textContent }] },
    ])

    // eventDate: ISO → YYYY-MM-DD
    expect(arg.eventDate).toBe('2025-06-15')

    expect(arg.isFeatured).toBe(false)
    expect(arg.linkedinPostId).toBe(newPostPayload.linkedinPostId)
    expect(arg.postUrl).toBe(newPostPayload.postUrl)
    expect(arg.mediaUrls).toEqual(['https://res.cloudinary.com/perm.jpg'])
    expect(arg.mediaType).toBe('Image')

    expect(result.activitiesSynced).toBe(1)
  })

  it('truncates title at 100 characters when textContent is longer', async () => {
    const { deps, mocks } = makeDeps()
    const longText = 'A'.repeat(200)

    await syncLinkedInData(
      { certifications: [], featuredPosts: [{ ...newPostPayload, textContent: longText }] },
      deps
    )

    const arg = mocks.createEngagement.mock.calls[0][0] as Record<string, unknown>
    expect((arg.title as string).length).toBe(100)
  })

  it('for an existing post: refreshes mediaUrls only — createEngagement is never called', async () => {
    const { deps, mocks } = makeDeps({
      findEngagementByLinkedinPostId: existingEngagement,
      syncPostMediaResult: ['https://res.cloudinary.com/fresh.jpg'],
    })

    const result = await syncLinkedInData(
      { certifications: [], featuredPosts: [existingPostPayload] },
      deps
    )

    expect(mocks.createEngagement).not.toHaveBeenCalled()

    expect(mocks.updateEngagementMedia).toHaveBeenCalledOnce()
    expect(mocks.updateEngagementMedia).toHaveBeenCalledWith(
      existingEngagement.documentId,
      ['https://res.cloudinary.com/fresh.jpg']
    )

    expect(result.activitiesSynced).toBe(1)
  })

  it('preserves textContent on existing posts — the description in Strapi is never touched', async () => {
    const { deps, mocks } = makeDeps({
      findEngagementByLinkedinPostId: existingEngagement,
    })

    await syncLinkedInData(
      { certifications: [], featuredPosts: [existingPostPayload] },
      deps
    )

    // updateEngagementMedia only passes mediaUrls — no description field
    const updateArg = mocks.updateEngagementMedia.mock.calls[0] as [string, string[]]
    expect(updateArg).toHaveLength(2)
    expect(typeof updateArg[0]).toBe('string') // documentId
    expect(Array.isArray(updateArg[1])).toBe(true) // mediaUrls array

    // createEngagement was never invoked so description was never overwritten
    expect(mocks.createEngagement).not.toHaveBeenCalled()
  })

  it('includes linkPreviewCard in the create payload when provided', async () => {
    const { deps, mocks } = makeDeps()
    const preview = { title: 'Preview', description: 'Desc', thumbnailUrl: 'https://t.co/img.jpg' }
    const postWithPreview = { ...newPostPayload, linkPreviewCard: preview }

    await syncLinkedInData({ certifications: [], featuredPosts: [postWithPreview] }, deps)

    const arg = mocks.createEngagement.mock.calls[0][0] as Record<string, unknown>
    expect(arg.linkPreviewCard).toEqual(preview)
  })

  it('omits linkPreviewCard when not provided', async () => {
    const { deps, mocks } = makeDeps()

    await syncLinkedInData({ certifications: [], featuredPosts: [newPostPayload] }, deps)

    const arg = mocks.createEngagement.mock.calls[0][0] as Record<string, unknown>
    expect(arg).not.toHaveProperty('linkPreviewCard')
  })
})

// ---------------------------------------------------------------------------
// Revalidation
// ---------------------------------------------------------------------------

describe('Revalidation', () => {
  it('calls revalidate for both "certification" and "engagement-and-activity" after sync', async () => {
    const { deps, mocks } = makeDeps()

    await syncLinkedInData(
      { certifications: [newCertPayload], featuredPosts: [newPostPayload] },
      deps
    )

    expect(mocks.revalidate).toHaveBeenCalledTimes(2)
    expect(mocks.revalidate).toHaveBeenCalledWith('certification')
    expect(mocks.revalidate).toHaveBeenCalledWith('engagement-and-activity')
  })

  it('still calls revalidate even when there is no incoming data', async () => {
    const { deps, mocks } = makeDeps()

    await syncLinkedInData({ certifications: [], featuredPosts: [] }, deps)

    expect(mocks.revalidate).toHaveBeenCalledTimes(2)
  })

  it('revalidates after all upserts complete — not before', async () => {
    const callOrder: string[] = []
    const { deps, mocks } = makeDeps()
    mocks.createCertification.mockImplementation(async () => {
      callOrder.push('createCertification')
      return existingCertification
    })
    mocks.revalidate.mockImplementation(async (model: string) => {
      callOrder.push(`revalidate:${model}`)
    })

    await syncLinkedInData({ certifications: [newCertPayload], featuredPosts: [] }, deps)

    expect(callOrder.indexOf('createCertification')).toBeLessThan(
      callOrder.indexOf('revalidate:certification')
    )
  })
})

// ---------------------------------------------------------------------------
// Result counters
// ---------------------------------------------------------------------------

describe('Result counters', () => {
  it('returns correct counts for a mixed payload', async () => {
    const secondPost = { ...newPostPayload, linkedinPostId: 'urn:li:activity:second' }
    const { deps } = makeDeps()

    const result = await syncLinkedInData(
      { certifications: [newCertPayload], featuredPosts: [newPostPayload, secondPost] },
      deps
    )

    expect(result.certsSynced).toBe(1)
    expect(result.activitiesSynced).toBe(2)
  })

  it('returns zero counts for an empty payload', async () => {
    const { deps } = makeDeps()

    const result = await syncLinkedInData({ certifications: [], featuredPosts: [] }, deps)

    expect(result.certsSynced).toBe(0)
    expect(result.activitiesSynced).toBe(0)
  })
})
