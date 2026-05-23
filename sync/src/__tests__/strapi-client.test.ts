import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  findEngagementByLinkedinPostId,
  createEngagement,
  updateEngagementMedia,
  findCertificationByLinkedinCertId,
  findCertificationByCompositeKey,
  createCertification,
  uploadBadgeToStrapiMedia,
  type CreateEngagementInput,
  type CreateCertificationInput,
} from '../strapi-client.js'

// ---------------------------------------------------------------------------
// Environment setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  process.env.STRAPI_API_URL = 'https://strapi.example.com'
  process.env.STRAPI_SYNC_API_TOKEN = 'test-token-abc'
  vi.restoreAllMocks()
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockFetch(body: unknown, status = 200): void {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      statusText: status === 200 ? 'OK' : 'Error',
      json: () => Promise.resolve(body),
      text: () => Promise.resolve(JSON.stringify(body)),
    })
  )
}

function mockFetchSequence(responses: Array<{ body: unknown; status?: number }>): void {
  const fetchMock = vi.fn()
  responses.forEach(({ body, status = 200 }) => {
    fetchMock.mockResolvedValueOnce({
      ok: status >= 200 && status < 300,
      status,
      statusText: status === 200 ? 'OK' : 'Error',
      json: () => Promise.resolve(body),
      text: () => Promise.resolve(JSON.stringify(body)),
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
    })
  })
  vi.stubGlobal('fetch', fetchMock)
}

const mockEngagement = {
  id: 1,
  documentId: 'doc-abc-123',
  title: 'Test Post',
  description: [{ type: 'paragraph', children: [{ type: 'text', text: 'Hello' }] }],
  eventDate: '2025-05-01',
  isFeatured: false,
  linkedinPostId: 'urn:li:activity:123',
  postUrl: 'https://linkedin.com/posts/123',
  mediaUrls: ['https://res.cloudinary.com/img1.jpg'],
  mediaType: 'Image' as const,
  linkPreviewCard: null,
  publishedAt: '2025-05-01T00:00:00.000Z',
  createdAt: '2025-05-01T00:00:00.000Z',
  updatedAt: '2025-05-01T00:00:00.000Z',
}

const mockCertification = {
  id: 2,
  documentId: 'doc-cert-456',
  title: 'AWS Solutions Architect',
  issuingBody: 'Amazon Web Services',
  badgeImage: { id: 10, url: 'https://res.cloudinary.com/badge.png' },
  verificationUrl: 'https://aws.amazon.com/verify/123',
  expiryDate: '2026-12-31',
  linkedinCertId: 'li-cert-789',
  publishedAt: '2025-01-01T00:00:00.000Z',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
}

// ---------------------------------------------------------------------------
// findEngagementByLinkedinPostId
// ---------------------------------------------------------------------------

describe('findEngagementByLinkedinPostId', () => {
  it('returns the engagement when found', async () => {
    mockFetch({ data: [mockEngagement], meta: { pagination: {} } })
    const result = await findEngagementByLinkedinPostId('urn:li:activity:123')
    expect(result).toEqual(mockEngagement)
  })

  it('returns null when no records match', async () => {
    mockFetch({ data: [], meta: { pagination: {} } })
    const result = await findEngagementByLinkedinPostId('urn:li:activity:999')
    expect(result).toBeNull()
  })

  it('constructs the correct URL and auth header', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: [], meta: {} }),
    })
    vi.stubGlobal('fetch', fetchSpy)

    await findEngagementByLinkedinPostId('urn:li:post:42')

    const [url, opts] = fetchSpy.mock.calls[0] as [string, RequestInit]
    expect(url).toContain('/api/engagement-and-activities')
    expect(url).toContain('filters[linkedinPostId]')
    expect(url).toContain(encodeURIComponent('urn:li:post:42'))
    expect((opts.headers as Record<string, string>)['Authorization']).toBe('Bearer test-token-abc')
  })

  it('throws when the Strapi request fails', async () => {
    mockFetch({ error: 'Internal Server Error' }, 500)
    await expect(findEngagementByLinkedinPostId('any')).rejects.toThrow('500')
  })
})

// ---------------------------------------------------------------------------
// createEngagement
// ---------------------------------------------------------------------------

describe('createEngagement', () => {
  const input: CreateEngagementInput = {
    title: 'New Post',
    description: [{ type: 'paragraph', children: [{ type: 'text', text: 'Content' }] }],
    eventDate: '2025-06-01',
    isFeatured: false,
    linkedinPostId: 'urn:li:activity:new',
    postUrl: 'https://linkedin.com/posts/new',
    mediaUrls: ['https://res.cloudinary.com/img.jpg'],
    mediaType: 'Image',
  }

  it('returns the created engagement', async () => {
    mockFetch({ data: { ...mockEngagement, ...input } })
    const result = await createEngagement(input)
    expect(result.title).toBe('New Post')
    expect(result.linkedinPostId).toBe('urn:li:activity:new')
  })

  it('posts to the correct endpoint with status=published', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: mockEngagement }),
    })
    vi.stubGlobal('fetch', fetchSpy)

    await createEngagement(input)

    const [url, opts] = fetchSpy.mock.calls[0] as [string, RequestInit]
    expect(url).toContain('/api/engagement-and-activities')
    expect(url).toContain('status=published')
    expect(opts.method).toBe('POST')
    const body = JSON.parse(opts.body as string)
    expect(body.data.linkedinPostId).toBe('urn:li:activity:new')
  })

  it('throws on Strapi error', async () => {
    mockFetch({ error: 'Validation error' }, 400)
    await expect(createEngagement(input)).rejects.toThrow('400')
  })
})

// ---------------------------------------------------------------------------
// updateEngagementMedia
// ---------------------------------------------------------------------------

describe('updateEngagementMedia', () => {
  it('sends a PUT with only mediaUrls in the body', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: mockEngagement }),
    })
    vi.stubGlobal('fetch', fetchSpy)

    await updateEngagementMedia('doc-abc-123', ['https://res.cloudinary.com/new.jpg'])

    const [url, opts] = fetchSpy.mock.calls[0] as [string, RequestInit]
    expect(url).toContain('/api/engagement-and-activities/doc-abc-123')
    expect(opts.method).toBe('PUT')
    const body = JSON.parse(opts.body as string)
    expect(body.data).toEqual({ mediaUrls: ['https://res.cloudinary.com/new.jpg'] })
    expect(body.data.title).toBeUndefined()
    expect(body.data.description).toBeUndefined()
  })

  it('throws on Strapi error', async () => {
    mockFetch({ error: 'Not found' }, 404)
    await expect(updateEngagementMedia('bad-id', [])).rejects.toThrow('404')
  })
})

// ---------------------------------------------------------------------------
// findCertificationByLinkedinCertId
// ---------------------------------------------------------------------------

describe('findCertificationByLinkedinCertId', () => {
  it('returns the certification when found', async () => {
    mockFetch({ data: [mockCertification], meta: {} })
    const result = await findCertificationByLinkedinCertId('li-cert-789')
    expect(result).toEqual(mockCertification)
  })

  it('returns null when not found', async () => {
    mockFetch({ data: [], meta: {} })
    const result = await findCertificationByLinkedinCertId('li-cert-unknown')
    expect(result).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// findCertificationByCompositeKey
// ---------------------------------------------------------------------------

describe('findCertificationByCompositeKey', () => {
  it('returns certification matching title + issuingBody', async () => {
    mockFetch({ data: [mockCertification], meta: {} })
    const result = await findCertificationByCompositeKey(
      'AWS Solutions Architect',
      'Amazon Web Services'
    )
    expect(result?.title).toBe('AWS Solutions Architect')
  })

  it('constructs the correct dual filter URL', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: [], meta: {} }),
    })
    vi.stubGlobal('fetch', fetchSpy)

    await findCertificationByCompositeKey('My Cert', 'My Org')

    const [url] = fetchSpy.mock.calls[0] as [string]
    expect(url).toContain('/api/certifications')
    expect(url).toContain('filters[title]')
    expect(url).toContain('filters[issuingBody]')
    expect(url).toContain(encodeURIComponent('My Cert'))
    expect(url).toContain(encodeURIComponent('My Org'))
  })

  it('returns null when nothing matches', async () => {
    mockFetch({ data: [], meta: {} })
    const result = await findCertificationByCompositeKey('Unknown', 'Unknown')
    expect(result).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// createCertification
// ---------------------------------------------------------------------------

describe('createCertification', () => {
  const input: CreateCertificationInput = {
    title: 'Azure Expert',
    issuingBody: 'Microsoft',
    badgeImage: 42,
    verificationUrl: 'https://microsoft.com/verify/42',
    expiryDate: '2027-01-01',
    linkedinCertId: 'li-cert-new',
  }

  it('returns the created certification', async () => {
    mockFetch({ data: { ...mockCertification, ...input, id: 99 } })
    const result = await createCertification(input)
    expect(result.title).toBe('Azure Expert')
    expect(result.issuingBody).toBe('Microsoft')
  })

  it('posts to certifications with status=published', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: mockCertification }),
    })
    vi.stubGlobal('fetch', fetchSpy)

    await createCertification(input)

    const [url, opts] = fetchSpy.mock.calls[0] as [string, RequestInit]
    expect(url).toContain('/api/certifications')
    expect(url).toContain('status=published')
    expect(opts.method).toBe('POST')
    const body = JSON.parse(opts.body as string)
    expect(body.data.badgeImage).toBe(42)
  })
})

// ---------------------------------------------------------------------------
// uploadBadgeToStrapiMedia
// ---------------------------------------------------------------------------

describe('uploadBadgeToStrapiMedia', () => {
  it('downloads the badge, uploads to Strapi, and returns the media id', async () => {
    mockFetchSequence([
      // 1. Download badge image
      { body: null, status: 200 },
      // 2. POST to /api/upload
      { body: [{ id: 77, url: 'https://res.cloudinary.com/badge.png' }], status: 200 },
    ])

    // Override arrayBuffer on first response
    const fetchSpy = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(16)),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve([{ id: 77, url: 'https://res.cloudinary.com/badge.png' }]),
      })
    vi.stubGlobal('fetch', fetchSpy)

    const mediaId = await uploadBadgeToStrapiMedia('https://li-cdn.com/badge.png')

    expect(mediaId).toBe(77)
    const uploadCall = fetchSpy.mock.calls[1] as [string, RequestInit]
    expect(uploadCall[0]).toContain('/api/upload')
    expect(uploadCall[1].method).toBe('POST')
    expect((uploadCall[1].headers as Record<string, string>)['Authorization']).toBe(
      'Bearer test-token-abc'
    )
  })

  it('throws when the badge image download fails', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({ ok: false, status: 403 })
    vi.stubGlobal('fetch', fetchSpy)
    await expect(uploadBadgeToStrapiMedia('https://li-cdn.com/bad.png')).rejects.toThrow('403')
  })

  it('throws when the Strapi upload fails', async () => {
    const fetchSpy = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Upload error'),
      })
    vi.stubGlobal('fetch', fetchSpy)
    await expect(uploadBadgeToStrapiMedia('https://li-cdn.com/ok.png')).rejects.toThrow('500')
  })

  it('throws when upload response contains no media entry', async () => {
    const fetchSpy = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve([]),
      })
    vi.stubGlobal('fetch', fetchSpy)
    await expect(uploadBadgeToStrapiMedia('https://li-cdn.com/ok.png')).rejects.toThrow(
      'no media entry'
    )
  })
})
