import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { Certification } from '@/lib/types'

// next/image is a server component — stub it for jsdom
vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />
  },
}))

// env is server-only — provide a stub so the module loads in jsdom
vi.mock('@/lib/env', () => ({
  env: { strapiUrl: 'http://localhost:1337' },
}))

const { CertificationsSection } = await import('../CertificationsSection')

function makeCert(overrides: Partial<Certification> & Pick<Certification, 'id' | 'title'>): Certification {
  return {
    documentId: `doc-${overrides.id}`,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    issuingBody: 'Test Body',
    verificationUrl: 'https://verify.example.com',
    badgeImage: null,
    ...overrides,
  }
}

const futureCert  = makeCert({ id: 1, title: 'Valid Cert',   expiryDate: '2099-01-01' })
const expiredCert = makeCert({ id: 2, title: 'Expired Cert', expiryDate: '2000-01-01' })
const noDatCert   = makeCert({ id: 3, title: 'No Expiry Cert' })

describe('CertificationsSection', () => {
  it('renders only non-expired certifications from a mixed list', () => {
    render(<CertificationsSection certifications={[futureCert, expiredCert, noDatCert]} />)
    expect(screen.getByText('Valid Cert')).toBeInTheDocument()
    expect(screen.getByText('No Expiry Cert')).toBeInTheDocument()
    expect(screen.queryByText('Expired Cert')).not.toBeInTheDocument()
  })

  it('shows the empty state when all certs are expired', () => {
    render(<CertificationsSection certifications={[expiredCert]} />)
    expect(screen.getByText(/no active certifications/i)).toBeInTheDocument()
  })

  it('shows SectionUnavailable when certifications is null', () => {
    render(<CertificationsSection certifications={null} />)
    expect(screen.getByText(/temporarily unavailable/i)).toBeInTheDocument()
  })
})
