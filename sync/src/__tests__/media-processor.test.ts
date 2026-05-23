import { vi, describe, it, expect, beforeEach } from 'vitest'
import { PassThrough } from 'node:stream'

// ---------------------------------------------------------------------------
// Module mocks — hoisted by Vitest before imports
// ---------------------------------------------------------------------------

vi.mock('cloudinary', () => ({
  v2: {
    config: vi.fn(),
    uploader: {
      upload_stream: vi.fn(),
    },
  },
}))

vi.mock('../strapi-client.js', () => ({
  uploadBadgeToStrapiMedia: vi.fn(),
}))

// ---------------------------------------------------------------------------
// Deferred imports — resolved after mocks are wired
// ---------------------------------------------------------------------------

import { syncPostMediaToCloudinary, uploadBadgeViaStrapi } from '../media-processor.js'
import { v2 as cloudinaryMock } from 'cloudinary'
import { uploadBadgeToStrapiMedia } from '../strapi-client.js'

const mockUploadStream = cloudinaryMock.uploader.upload_stream as ReturnType<typeof vi.fn>
const mockUploadBadge = uploadBadgeToStrapiMedia as ReturnType<typeof vi.fn>

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns an upload_stream mock that resolves with the given secure_url */
function makeSuccessfulUploadStream(secureUrl: string) {
  return vi.fn((_opts: unknown, callback: (err: null, result: { secure_url: string }) => void) => {
    const stream = new PassThrough()
    stream.on('finish', () => callback(null, { secure_url: secureUrl }))
    return stream
  })
}

/** Returns an upload_stream mock that rejects with an error */
function makeFailingUploadStream(message: string) {
  return vi.fn((_opts: unknown, callback: (err: Error, result?: undefined) => void) => {
    const stream = new PassThrough()
    stream.on('finish', () => callback(new Error(message)))
    return stream
  })
}

function mockFetchSuccess(data: ArrayBuffer = new ArrayBuffer(16)): void {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      arrayBuffer: () => Promise.resolve(data),
    })
  )
}

function mockFetchFailure(status = 500): void {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ ok: false, status })
  )
}

function mockFetchAbort(): void {
  const err = Object.assign(new Error('The operation was aborted'), { name: 'AbortError' })
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(err))
}

// ---------------------------------------------------------------------------
// Environment
// ---------------------------------------------------------------------------

beforeEach(() => {
  process.env.CLOUDINARY_NAME = 'test-cloud'
  process.env.CLOUDINARY_KEY = 'test-key'
  process.env.CLOUDINARY_SECRET = 'test-secret'
  process.env.STRAPI_API_URL = 'https://strapi.example.com'
  process.env.STRAPI_SYNC_API_TOKEN = 'test-token'
  vi.restoreAllMocks()
  mockUploadStream.mockReset()
  mockUploadBadge.mockReset()
})

// ---------------------------------------------------------------------------
// syncPostMediaToCloudinary
// ---------------------------------------------------------------------------

describe('syncPostMediaToCloudinary', () => {
  it('returns permanent Cloudinary URLs for each successfully processed asset', async () => {
    mockFetchSuccess()
    mockUploadStream.mockImplementation(
      makeSuccessfulUploadStream('https://res.cloudinary.com/img1.jpg')
    )

    const result = await syncPostMediaToCloudinary([
      'https://li-cdn.com/img1.jpg',
      'https://li-cdn.com/img2.jpg',
    ])

    expect(result).toHaveLength(2)
    expect(result[0]).toBe('https://res.cloudinary.com/img1.jpg')
    expect(result[1]).toBe('https://res.cloudinary.com/img1.jpg')
  })

  it('initialises Cloudinary with the correct env vars', async () => {
    mockFetchSuccess()
    mockUploadStream.mockImplementation(
      makeSuccessfulUploadStream('https://res.cloudinary.com/x.jpg')
    )

    await syncPostMediaToCloudinary(['https://li-cdn.com/x.jpg'])

    expect(cloudinaryMock.config).toHaveBeenCalledWith({
      cloud_name: 'test-cloud',
      api_key: 'test-key',
      api_secret: 'test-secret',
    })
  })

  it('excludes a timed-out asset without throwing and continues with the remaining ones', async () => {
    const fetchSpy = vi.fn()
      .mockRejectedValueOnce(
        Object.assign(new Error('The operation was aborted'), { name: 'AbortError' })
      )
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
      })
    vi.stubGlobal('fetch', fetchSpy)

    mockUploadStream.mockImplementation(
      makeSuccessfulUploadStream('https://res.cloudinary.com/ok.jpg')
    )

    const result = await syncPostMediaToCloudinary([
      'https://li-cdn.com/timeout.jpg',
      'https://li-cdn.com/ok.jpg',
    ])

    expect(result).toHaveLength(1)
    expect(result[0]).toBe('https://res.cloudinary.com/ok.jpg')
  })

  it('excludes an asset whose HTTP download fails (non-2xx)', async () => {
    mockFetchFailure(403)

    const result = await syncPostMediaToCloudinary(['https://li-cdn.com/forbidden.jpg'])

    expect(result).toHaveLength(0)
    expect(mockUploadStream).not.toHaveBeenCalled()
  })

  it('excludes an asset that Cloudinary rejects without crashing the pipeline', async () => {
    mockFetchSuccess()
    mockUploadStream.mockImplementation(makeFailingUploadStream('Cloudinary quota exceeded'))

    const result = await syncPostMediaToCloudinary(['https://li-cdn.com/img.jpg'])

    expect(result).toHaveLength(0)
  })

  it('returns an empty array when given an empty input', async () => {
    const result = await syncPostMediaToCloudinary([])
    expect(result).toEqual([])
    expect(mockUploadStream).not.toHaveBeenCalled()
  })

  it('processes all assets even when an earlier one fails', async () => {
    const fetchSpy = vi.fn()
      .mockRejectedValueOnce(new Error('network error'))
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
      })
    vi.stubGlobal('fetch', fetchSpy)

    let callCount = 0
    mockUploadStream.mockImplementation(
      (_opts: unknown, cb: (err: null, r: { secure_url: string }) => void) => {
        callCount++
        const stream = new PassThrough()
        stream.on('finish', () => cb(null, { secure_url: `https://res.cloudinary.com/img${callCount}.jpg` }))
        return stream
      }
    )

    const result = await syncPostMediaToCloudinary([
      'https://li-cdn.com/fail.jpg',
      'https://li-cdn.com/ok1.jpg',
      'https://li-cdn.com/ok2.jpg',
    ])

    expect(result).toHaveLength(2)
  })
})

// ---------------------------------------------------------------------------
// uploadBadgeViaStrapi
// ---------------------------------------------------------------------------

describe('uploadBadgeViaStrapi', () => {
  it('delegates to uploadBadgeToStrapiMedia and returns the numeric media id', async () => {
    mockUploadBadge.mockResolvedValue(42)

    const id = await uploadBadgeViaStrapi('https://li-cdn.com/badge.png')

    expect(id).toBe(42)
    expect(mockUploadBadge).toHaveBeenCalledOnce()
    expect(mockUploadBadge).toHaveBeenCalledWith('https://li-cdn.com/badge.png')
  })

  it('propagates errors thrown by uploadBadgeToStrapiMedia', async () => {
    mockUploadBadge.mockRejectedValue(new Error('Strapi upload failed: 500'))

    await expect(uploadBadgeViaStrapi('https://li-cdn.com/bad.png')).rejects.toThrow(
      'Strapi upload failed: 500'
    )
  })
})
