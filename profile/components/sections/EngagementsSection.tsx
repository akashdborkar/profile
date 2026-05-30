import { EngagementCard } from '@/components/ui/EngagementCard'
import { SectionUnavailable } from '@/components/ui/SectionUnavailable'
import type { EngagementAndActivity } from '@/lib/types'

interface EngagementsSectionProps {
  engagements: EngagementAndActivity[] | null
}

export function EngagementsSection({ engagements }: EngagementsSectionProps) {
  if (engagements === null) return <SectionUnavailable sectionName="Engagements" />

  const sorted = [...engagements].sort(
    (a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
  )

  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-accent font-semibold mb-3">
        Activities
      </p>
      <h2 className="text-3xl font-bold text-foreground mb-8">
        Engagements & Activities
      </h2>

      {sorted.length === 0 ? (
        <p className="text-muted-foreground text-sm">No engagements recorded yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sorted.map((engagement) => (
            <EngagementCard key={engagement.id} engagement={engagement} />
          ))}
        </div>
      )}
    </div>
  )
}
