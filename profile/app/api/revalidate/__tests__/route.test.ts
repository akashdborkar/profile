import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const mockRevalidateTag = vi.fn()
vi.mock('next/cache', () => ({ revalidateTag: mockRevalidateTag }))

const TEST_TOKEN = 'test-revalidation-secret'

beforeAll(() => {
  process.env.REVALIDATION_SECRET_TOKEN = TEST_TOKEN
})

const { POST } = await import('../route')

function makeRequest(opts: {
  token?: string | null
  body?: unknown
  malformed?: boolean
}): NextRequest {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (opts.token !== null) {
    headers['Authorization'] = `Bearer ${opts.token ?? TEST_TOKEN}`
  }

  return new NextRequest('http://localhost:3000/api/revalidate', {
    method: 'POST',
    headers,
    body: opts.malformed ? 'not json{{' : JSON.stringify(opts.body ?? {}),
  })
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('POST /api/revalidate', () => {
  it('returns 401 when Authorization header is missing', async () => {
    const req = new NextRequest('http://localhost:3000/api/revalidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'blog' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 401 when token is wrong', async () => {
    const req = makeRequest({ token: 'wrong-token', body: { model: 'blog' } })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 400 when body has no model', async () => {
    const req = makeRequest({ body: {} })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.message).toMatch(/unknown or missing/i)
  })

  it('returns 200 and calls revalidateTag with correct tags for model: blog', async () => {
    const req = makeRequest({ body: { model: 'blog' } })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.revalidated).toBe(true)
    expect(json.tags).toEqual(['blogs'])
    expect(mockRevalidateTag).toHaveBeenCalledWith('blogs', 'default')
  })

  it('returns 400 for unknown model', async () => {
    const req = makeRequest({ body: { model: 'unknown-type' } })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('also calls revalidateTag with slug when slug is provided', async () => {
    const req = makeRequest({ body: { model: 'blog', slug: 'my-blog-post' } })
    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(mockRevalidateTag).toHaveBeenCalledWith('blogs', 'default')
    expect(mockRevalidateTag).toHaveBeenCalledWith('my-blog-post', 'default')
    expect(mockRevalidateTag).toHaveBeenCalledTimes(2)
  })
})
