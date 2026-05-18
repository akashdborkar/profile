import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fetchStrapiData } from '../fetchStrapiData'

// Minimal Response-like object returned by the mocked fetch
function mockOkResponse(data: unknown) {
  return { ok: true, json: () => Promise.resolve(data) }
}

function mockErrorResponse(status: number, statusText: string) {
  return { ok: false, status, statusText, json: () => Promise.resolve({}) }
}

describe('fetchStrapiData', () => {
  beforeEach(() => {
    process.env.STRAPI_API_URL = 'http://localhost:1337'
    process.env.STRAPI_API_TOKEN = 'test-token'
    vi.useFakeTimers()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
    delete process.env.STRAPI_API_URL
    delete process.env.STRAPI_API_TOKEN
  })

  // ---------------------------------------------------------------------------
  // 1. Immediate success
  // ---------------------------------------------------------------------------

  it('resolves on the first attempt without retrying', async () => {
    const payload = { data: { id: 1, title: 'About Me' } }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(mockOkResponse(payload)))

    const result = await fetchStrapiData('/api/about-me', {
      maxRetries: 3,
      initialDelayMs: 100,
    })

    expect(result).toEqual(payload)
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:1337/api/about-me',
      expect.objectContaining({
        headers: { Authorization: 'Bearer test-token' },
      })
    )
    expect(console.warn).not.toHaveBeenCalled()
  })

  // ---------------------------------------------------------------------------
  // 2. Delayed success — first two attempts fail, third succeeds (cold-start sim)
  // ---------------------------------------------------------------------------

  it('retries after network failures and resolves on the third attempt', async () => {
    const payload = { data: { id: 2 } }
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error('connect ECONNREFUSED'))
      .mockRejectedValueOnce(new Error('connect ECONNREFUSED'))
      .mockResolvedValueOnce(mockOkResponse(payload))

    vi.stubGlobal('fetch', fetchMock)

    // Start the call — it won't resolve until sleep timers are advanced
    const promise = fetchStrapiData('/api/about-me', {
      maxRetries: 3,
      initialDelayMs: 100,
      timeoutMs: 5_000,
    })

    // Advance fake timers through all pending sleep delays (100ms, 200ms)
    await vi.runAllTimersAsync()

    const result = await promise
    expect(result).toEqual(payload)
    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(console.warn).toHaveBeenCalledTimes(2)
  })

  it('retries on a non-OK HTTP response and resolves when it clears', async () => {
    const payload = { data: { id: 3 } }
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(mockErrorResponse(503, 'Service Unavailable'))
      .mockResolvedValueOnce(mockOkResponse(payload))

    vi.stubGlobal('fetch', fetchMock)

    const promise = fetchStrapiData('/api/about-me', {
      maxRetries: 2,
      initialDelayMs: 50,
      timeoutMs: 5_000,
    })

    await vi.runAllTimersAsync()

    const result = await promise
    expect(result).toEqual(payload)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  // ---------------------------------------------------------------------------
  // 3. All retries exhausted
  // ---------------------------------------------------------------------------

  it('throws after exhausting all retries', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('connect ECONNREFUSED'))
    vi.stubGlobal('fetch', fetchMock)

    const promise = fetchStrapiData('/api/about-me', {
      maxRetries: 2,
      initialDelayMs: 100,
      timeoutMs: 5_000,
    })
    // Attach the rejection handler BEFORE advancing timers to avoid Node's
    // "unhandled rejection" warning (the rejection fires during runAllTimersAsync).
    const assertion = expect(promise).rejects.toThrow(
      'All 3 attempts failed for http://localhost:1337/api/about-me. Last error: connect ECONNREFUSED'
    )
    await vi.runAllTimersAsync()
    await assertion

    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(console.warn).toHaveBeenCalledTimes(2) // warned before retry 2 and 3, not after last
  })

  it('throws immediately when maxRetries is 0', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValueOnce(new Error('ECONNREFUSED')))

    const promise = fetchStrapiData('/api/about-me', { maxRetries: 0, initialDelayMs: 100 })
    const assertion = expect(promise).rejects.toThrow('All 1 attempts failed')
    await vi.runAllTimersAsync()
    await assertion

    expect(console.warn).not.toHaveBeenCalled()
  })

  // ---------------------------------------------------------------------------
  // 4. Backoff delay values
  // ---------------------------------------------------------------------------

  it('uses exponential backoff delays between retries', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')))

    const promise = fetchStrapiData('/api/about-me', {
      maxRetries: 3,
      initialDelayMs: 100,
      timeoutMs: 5_000,
    })
    const assertion = expect(promise).rejects.toThrow()
    await vi.runAllTimersAsync()
    await assertion

    // warn messages carry the delay value — verify geometric progression
    const calls = (console.warn as ReturnType<typeof vi.fn>).mock.calls
    expect(calls[0][0]).toContain('Retrying in 100ms')   // 100 × 2^0
    expect(calls[1][0]).toContain('Retrying in 200ms')   // 100 × 2^1
    expect(calls[2][0]).toContain('Retrying in 400ms')   // 100 × 2^2
  })

  // ---------------------------------------------------------------------------
  // 5. URL and auth header construction
  // ---------------------------------------------------------------------------

  it('constructs the correct URL and Authorization header', async () => {
    process.env.STRAPI_API_URL = 'https://cms.example.com'
    process.env.STRAPI_API_TOKEN = 'secret'

    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(mockOkResponse({})))

    await fetchStrapiData('/api/blogs?sort=publishedAt:desc', { maxRetries: 0 })

    expect(fetch).toHaveBeenCalledWith(
      'https://cms.example.com/api/blogs?sort=publishedAt:desc',
      expect.objectContaining({ headers: { Authorization: 'Bearer secret' } })
    )
  })
})
