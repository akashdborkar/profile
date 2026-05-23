import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from '../sync-linkedin/route'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRequest(headers: Record<string, string> = {}): NextRequest {
  return new NextRequest('https://example.com/api/cron/sync-linkedin', { headers })
}

function mockFetch(status: number): void {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ ok: status >= 200 && status < 300, status })
  )
}

// ---------------------------------------------------------------------------
// Environment
// ---------------------------------------------------------------------------

beforeEach(() => {
  process.env.CRON_SECRET = 'test-cron-secret'
  process.env.STRAPI_API_URL = 'https://strapi-cms-2usx.onrender.com'
  process.env.RENDER_SYNC_TOKEN = 'render-sync-secret'
  vi.restoreAllMocks()
})

// ---------------------------------------------------------------------------
// Authentication
// ---------------------------------------------------------------------------

describe('Authentication', () => {
  it('returns 401 when the Authorization header is missing', async () => {
    const res = await GET(makeRequest())
    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ error: 'Unauthorized' })
  })

  it('returns 401 when the Authorization token is incorrect', async () => {
    const res = await GET(makeRequest({ Authorization: 'Bearer wrong-token' }))
    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ error: 'Unauthorized' })
  })

  it('returns 401 when CRON_SECRET env var is not set', async () => {
    delete process.env.CRON_SECRET
    const res = await GET(makeRequest({ Authorization: 'Bearer test-cron-secret' }))
    expect(res.status).toBe(401)
  })

  it('does not call Strapi when authentication fails', async () => {
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)

    await GET(makeRequest({ Authorization: 'Bearer wrong-token' }))

    expect(fetchSpy).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// Successful proxy
// ---------------------------------------------------------------------------

describe('Successful proxy', () => {
  it('returns { triggered: true } with status 200 when Strapi responds 2xx', async () => {
    mockFetch(200)
    const res = await GET(makeRequest({ Authorization: 'Bearer test-cron-secret' }))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ triggered: true })
  })

  it('also returns triggered: true for 201 responses', async () => {
    mockFetch(201)
    const res = await GET(makeRequest({ Authorization: 'Bearer test-cron-secret' }))
    expect(res.status).toBe(200)
    expect((await res.json()).triggered).toBe(true)
  })

  it('sends POST to the correct Strapi URL', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true, status: 200 })
    vi.stubGlobal('fetch', fetchSpy)

    await GET(makeRequest({ Authorization: 'Bearer test-cron-secret' }))

    const [url, opts] = fetchSpy.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://strapi-cms-2usx.onrender.com/api/sync-linkedin')
    expect(opts.method).toBe('POST')
  })

  it('passes X-Sync-Token header to Strapi', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true, status: 200 })
    vi.stubGlobal('fetch', fetchSpy)

    await GET(makeRequest({ Authorization: 'Bearer test-cron-secret' }))

    const [, opts] = fetchSpy.mock.calls[0] as [string, RequestInit]
    expect((opts.headers as Record<string, string>)['X-Sync-Token']).toBe('render-sync-secret')
  })
})

// ---------------------------------------------------------------------------
// Strapi failure responses
// ---------------------------------------------------------------------------

describe('Strapi failure responses', () => {
  it('returns 502 with triggered: false when Strapi responds 500', async () => {
    mockFetch(500)
    const res = await GET(makeRequest({ Authorization: 'Bearer test-cron-secret' }))
    expect(res.status).toBe(502)
    const body = await res.json()
    expect(body.triggered).toBe(false)
    expect(body.status).toBe(500)
  })

  it('returns 502 with triggered: false when Strapi responds 401', async () => {
    mockFetch(401)
    const res = await GET(makeRequest({ Authorization: 'Bearer test-cron-secret' }))
    expect(res.status).toBe(502)
    const body = await res.json()
    expect(body.triggered).toBe(false)
    expect(body.status).toBe(401)
  })

  it('preserves the upstream Strapi status code in the response body', async () => {
    mockFetch(503)
    const res = await GET(makeRequest({ Authorization: 'Bearer test-cron-secret' }))
    expect((await res.json()).status).toBe(503)
  })
})

// ---------------------------------------------------------------------------
// Network errors
// ---------------------------------------------------------------------------

describe('Network errors', () => {
  it('returns 502 with triggered: false when fetch throws', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('ECONNREFUSED')))
    const res = await GET(makeRequest({ Authorization: 'Bearer test-cron-secret' }))
    expect(res.status).toBe(502)
    const body = await res.json()
    expect(body.triggered).toBe(false)
  })

  it('returns 502 when the connection times out', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(Object.assign(new Error('timeout'), { name: 'AbortError' }))
    )
    const res = await GET(makeRequest({ Authorization: 'Bearer test-cron-secret' }))
    expect(res.status).toBe(502)
  })
})
