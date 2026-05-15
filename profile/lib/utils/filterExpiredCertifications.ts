import type { Certification } from '../types'

export function filterExpiredCertifications(
  certs: Certification[]
): Certification[] {
  const now = new Date()
  return certs.filter((cert) => {
    if (!cert.expiryDate) return true
    return new Date(cert.expiryDate) >= now
  })
}
