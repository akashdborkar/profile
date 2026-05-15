import { FeaturedCard } from '@/components/ui/FeaturedCard'
import { SectionUnavailable } from '@/components/ui/SectionUnavailable'
import type { FeaturedContentItem } from '@/lib/types'

interface FeaturedSectionProps {
  items: FeaturedContentItem[] | null
}

export function FeaturedSection({ items }: FeaturedSectionProps) {
  if (items === null) return <SectionUnavailable sectionName="Featured" />

  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-accent font-semibold mb-3">
        Featured
      </p>
      <h2 className="text-3xl font-bold text-foreground mb-8">
        Selected Work &amp; Insights
      </h2>

      {items.length === 0 ? (
        <p className="text-muted-foreground text-sm">No featured content available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <FeaturedCard key={`${item.kind}-${item.data.id}`} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
