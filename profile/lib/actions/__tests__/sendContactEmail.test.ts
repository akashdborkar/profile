import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/env', () => ({
  env: {
    strapiUrl: 'http://localhost:1337',
    strapiToken: 'test-token',
    revalidationToken: 'test-secret',
    resendKey: 're_test_key',
    gaId: 'G-TEST',
  },
}))

const mockSend = vi.fn()
vi.mock('resend', () => ({
  Resend: vi.fn(() => ({
    emails: { send: mockSend },
  })),
}))

// Dynamic import after mocks are registered
const { sendContactEmail } = await import('../sendContactEmail')

function makeFormData(fields: Record<string, string>): FormData {
  const fd = new FormData()
  for (const [k, v] of Object.entries(fields)) fd.set(k, v)
  return fd
}

const valid = { name: 'Akash Borkar', email: 'akash@example.com', message: 'Hello!' }

beforeEach(() => {
  vi.clearAllMocks()
  mockSend.mockResolvedValue({ data: { id: 'test-id' }, error: null })
})

describe('sendContactEmail', () => {
  it('returns validation error when all fields are empty', async () => {
    const result = await sendContactEmail(null, makeFormData({}))
    expect(result.success).toBe(false)
    expect(result.error).toMatch(/required/i)
  })

  it('returns validation error when name is missing', async () => {
    const result = await sendContactEmail(null, makeFormData({ email: valid.email, message: valid.message }))
    expect(result.success).toBe(false)
    expect(result.error).toMatch(/required/i)
  })

  it('returns validation error for invalid email', async () => {
    const result = await sendContactEmail(null, makeFormData({ ...valid, email: 'not-an-email' }))
    expect(result.success).toBe(false)
    expect(result.error).toMatch(/email/i)
  })

  it('returns LinkedIn fallback message on Resend 429', async () => {
    mockSend.mockResolvedValue({ data: null, error: { statusCode: 429, message: 'Too Many Requests', name: 'rate_limit_exceeded' } })
    const result = await sendContactEmail(null, makeFormData(valid))
    expect(result.success).toBe(false)
    expect(result.error).toMatch(/LinkedIn/i)
  })

  it('returns generic error on other Resend failures', async () => {
    mockSend.mockResolvedValue({ data: null, error: { statusCode: 500, message: 'Internal Error', name: 'internal_server_error' } })
    const result = await sendContactEmail(null, makeFormData(valid))
    expect(result.success).toBe(false)
    expect(result.error).toMatch(/try again/i)
  })

  it('returns success when Resend call succeeds', async () => {
    const result = await sendContactEmail(null, makeFormData(valid))
    expect(result.success).toBe(true)
    expect(result.error).toBeNull()
    expect(mockSend).toHaveBeenCalledOnce()
  })
})
