'use client'

import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { trackCertificationVerificationClick } from '@/lib/utils/analytics'
import type { Certification } from '@/lib/types'

function formatExpiry(dateStr: string): string {
  return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(
    new Date(dateStr)
  )
}

interface CertificationCardProps {
  cert: Certification
  strapiUrl: string
}

export function CertificationCard({ cert, strapiUrl }: CertificationCardProps) {
  const rawUrl = cert.badgeImage?.url ?? null
  const badgeUrl = rawUrl
    ? (rawUrl.startsWith('http') ? rawUrl : `${strapiUrl}${rawUrl}`)
    : null

  return (
    <Card className="hover:border-accent/40 transition-colors">
      <CardContent className="pt-4 flex flex-col gap-3">
        {/* Badge image or placeholder */}
        <div className="flex items-center justify-center h-16">
          {badgeUrl ? (
            <Image
              src={badgeUrl}
              alt={cert.badgeImage?.alternativeText ?? cert.title}
              width={64}
              height={64}
              className="object-contain"
              unoptimized
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center text-accent text-xl font-bold">
              {cert.issuingBody.charAt(0)}
            </div>
          )}
        </div>

        {/* Title */}
        <p className="text-sm font-semibold text-foreground leading-snug text-center">
          {cert.title}
        </p>

        {/* Issuing body */}
        <p className="text-xs text-muted-foreground text-center">{cert.issuingBody}</p>

        {/* Expiry */}
        {cert.expiryDate && (
          <p className="text-xs text-muted-foreground text-center">
            Expires: {formatExpiry(cert.expiryDate)}
          </p>
        )}

        {/* Verify link */}
        <a
          href={cert.verificationUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackCertificationVerificationClick(cert.title, cert.verificationUrl)}
          className="text-xs text-accent hover:underline underline-offset-4 text-center mt-auto"
        >
          Verify Credential →
        </a>
      </CardContent>
    </Card>
  )
}
