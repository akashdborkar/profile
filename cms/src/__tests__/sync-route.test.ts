import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import policy from '../api/sync-linkedin/policies/verify-sync-token'
import controller, { syncLoader } from '../api/sync-linkedin/controllers/sync-linkedin'

// ---------------------------------------------------------------------------
// Mock Koa context factory
// ---------------------------------------------------------------------------

function makeCtx(overrides: {
  headers?: Record<string, string>
  body?: unknown
} = {}): any {
  const ctx: any = {
    request: {
      header: overrides.headers ?? {},
      body: overrides.body ?? {},
    },
    status: 200,
    body: null,
  }
  return ctx
}

// ---------------------------------------------------------------------------
// Policy: verify-sync-token
// ---------------------------------------------------------------------------

describe('Policy: verify-sync-token', () => {
  beforeEach(() => {
    process.env.RENDER_SYNC_TOKEN = 'valid-secret-token'
  })

  afterEach(() => {
    delete process.env.RENDER_SYNC_TOKEN
  })

  it('returns false and sets 401 when X-Sync-Token header is missing', async () => {
    const ctx = makeCtx({ headers: {} })

    const result = await policy(ctx)

    expect(result).toBe(false)
    expect(ctx.status).toBe(401)
    expect(ctx.body).toEqual({ error: 'Unauthorized handshake token' })
  })

  it('returns false and sets 401 when X-Sync-Token is present but incorrect', async () => {
    const ctx = makeCtx({ headers: { 'x-sync-token': 'wrong-token' } })

    const result = await policy(ctx)

    expect(result).toBe(false)
    expect(ctx.status).toBe(401)
    expect(ctx.body).toEqual({ error: 'Unauthorized handshake token' })
  })

  it('returns true and leaves the context unchanged when token is correct', async () => {
    const ctx = makeCtx({ headers: { 'x-sync-token': 'valid-secret-token' } })

    const result = await policy(ctx)

    expect(result).toBe(true)
    expect(ctx.status).toBe(200)
    expect(ctx.body).toBeNull()
  })

  it('returns false when RENDER_SYNC_TOKEN env var is not set', async () => {
    delete process.env.RENDER_SYNC_TOKEN
    const ctx = makeCtx({ headers: { 'x-sync-token': 'valid-secret-token' } })

    const result = await policy(ctx)

    expect(result).toBe(false)
    expect(ctx.status).toBe(401)
  })
})

// ---------------------------------------------------------------------------
// Controller: sync-linkedin
// ---------------------------------------------------------------------------

describe('Controller: syncLinkedIn', () => {
  const mockSyncFn = vi.fn()

  beforeEach(() => {
    mockSyncFn.mockReset()
    syncLoader.fn = mockSyncFn
  })

  afterEach(() => {
    syncLoader.fn = null
  })

  it('calls the sync engine with the request body and returns 200 on success', async () => {
    mockSyncFn.mockResolvedValue({ activitiesSynced: 3, certsSynced: 2 })

    const payload = { certifications: [], featuredPosts: [] }
    const ctx = makeCtx({ body: payload })

    await controller.syncLinkedIn(ctx)

    expect(mockSyncFn).toHaveBeenCalledOnce()
    expect(mockSyncFn).toHaveBeenCalledWith(payload)
    expect(ctx.status).toBe(200)
    expect(ctx.body).toEqual({ success: true, activitiesSynced: 3, certsSynced: 2 })
  })

  it('returns 200 with zero counts when sync processes no items', async () => {
    mockSyncFn.mockResolvedValue({ activitiesSynced: 0, certsSynced: 0 })
    const ctx = makeCtx({ body: { certifications: [], featuredPosts: [] } })

    await controller.syncLinkedIn(ctx)

    expect(ctx.status).toBe(200)
    expect(ctx.body).toEqual({ success: true, activitiesSynced: 0, certsSynced: 0 })
  })

  it('returns 500 with an error message when the sync engine throws', async () => {
    mockSyncFn.mockRejectedValue(new Error('Apify API limit exceeded'))
    const ctx = makeCtx({ body: {} })

    await controller.syncLinkedIn(ctx)

    expect(ctx.status).toBe(500)
    expect(ctx.body).toEqual({ error: 'Apify API limit exceeded' })
  })

  it('returns 500 with a fallback message for non-Error throws', async () => {
    mockSyncFn.mockRejectedValue('unknown failure')
    const ctx = makeCtx({ body: {} })

    await controller.syncLinkedIn(ctx)

    expect(ctx.status).toBe(500)
    expect(ctx.body).toEqual({ error: 'Sync failed' })
  })

  it('passes the entire request body as the scraper payload', async () => {
    mockSyncFn.mockResolvedValue({ activitiesSynced: 1, certsSynced: 0 })

    const payload = {
      certifications: [{ linkedinCertId: 'abc', title: 'Test', issuingBody: 'Org', badgeUrl: '', verificationUrl: '' }],
      featuredPosts: [],
    }
    const ctx = makeCtx({ body: payload })

    await controller.syncLinkedIn(ctx)

    expect(mockSyncFn).toHaveBeenCalledWith(payload)
  })
})

// ---------------------------------------------------------------------------
// syncLoader
// ---------------------------------------------------------------------------

describe('syncLoader', () => {
  afterEach(() => {
    syncLoader.fn = null
  })

  it('returns the injected fn when .fn is already set', async () => {
    const customFn = vi.fn()
    syncLoader.fn = customFn

    const fn = await syncLoader.get()

    expect(fn).toBe(customFn)
  })
})
