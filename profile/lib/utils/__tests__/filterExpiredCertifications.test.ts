import { describe, it, expect } from 'vitest'
import { filterExpiredCertifications } from '../filterExpiredCertifications'
import type { Certification } from '../../types'

const base: Omit<Certification, 'expiryDate'> = {
  id: 1,
  documentId: 'test-doc',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  publishedAt: '2024-01-01T00:00:00.000Z',
  title: 'AWS Solutions Architect',
  issuingBody: 'Amazon Web Services',
  badgeImage: {} as Certification['badgeImage'],
  verificationUrl: 'https://example.com/verify',
}

const future = new Date()
future.setFullYear(future.getFullYear() + 1)

const past = new Date()
past.setFullYear(past.getFullYear() - 1)

describe('filterExpiredCertifications', () => {
  it('includes cert with no expiryDate', () => {
    const result = filterExpiredCertifications([base])
    expect(result).toHaveLength(1)
  })

  it('includes cert with a future expiryDate', () => {
    const cert: Certification = { ...base, expiryDate: future.toISOString().split('T')[0] }
    const result = filterExpiredCertifications([cert])
    expect(result).toHaveLength(1)
  })

  it('excludes cert with a past expiryDate', () => {
    const cert: Certification = { ...base, expiryDate: past.toISOString().split('T')[0] }
    const result = filterExpiredCertifications([cert])
    expect(result).toHaveLength(0)
  })

  it('returns empty array for empty input', () => {
    expect(filterExpiredCertifications([])).toHaveLength(0)
  })

  it('filters mixed list correctly', () => {
    const certs: Certification[] = [
      { ...base, id: 1, title: 'No expiry' },
      { ...base, id: 2, title: 'Future', expiryDate: future.toISOString().split('T')[0] },
      { ...base, id: 3, title: 'Expired', expiryDate: past.toISOString().split('T')[0] },
    ]
    const result = filterExpiredCertifications(certs)
    expect(result).toHaveLength(2)
    expect(result.map((c) => c.title)).toEqual(['No expiry', 'Future'])
  })
})
