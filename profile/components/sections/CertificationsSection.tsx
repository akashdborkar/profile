import { CertificationCard } from '@/components/ui/CertificationCard'
import { SectionUnavailable } from '@/components/ui/SectionUnavailable'
import { filterExpiredCertifications } from '@/lib/utils/filterExpiredCertifications'
import { env } from '@/lib/env'
import type { Certification } from '@/lib/types'

interface CertificationsSectionProps {
  certifications: Certification[] | null
}

export function CertificationsSection({ certifications }: CertificationsSectionProps) {
  if (certifications === null) return <SectionUnavailable sectionName="Certifications" />

  const active = filterExpiredCertifications(certifications)
  const strapiUrl = env.strapiUrl

  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-accent font-semibold mb-3">
        Credentials
      </p>
      <h2 className="text-3xl font-bold text-foreground mb-8">Active Certifications</h2>

      {active.length === 0 ? (
        <p className="text-muted-foreground text-sm">No active certifications on record.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {active.map((cert) => (
            <CertificationCard key={cert.id} cert={cert} strapiUrl={strapiUrl} />
          ))}
        </div>
      )}
    </div>
  )
}
