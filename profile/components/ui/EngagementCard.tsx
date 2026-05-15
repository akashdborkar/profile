import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { extractFirstParagraph } from '@/lib/utils/richTextHelpers'
import type { EngagementAndActivity } from '@/lib/types'

function formatEventDate(dateStr: string): string {
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(
    new Date(dateStr)
  )
}

interface EngagementCardProps {
  engagement: EngagementAndActivity
}

export function EngagementCard({ engagement }: EngagementCardProps) {
  const excerpt = extractFirstParagraph(engagement.description)
  const photoCount = engagement.gallery_items?.length ?? 0

  return (
    <Card className="hover:border-accent/40 transition-colors">
      <CardContent className="pt-4 flex flex-col gap-2">
        {/* Date label */}
        <p className="text-xs font-semibold text-accent uppercase tracking-wide">
          {formatEventDate(engagement.eventDate)}
        </p>

        {/* Title */}
        <h3 className="text-base font-semibold text-foreground leading-snug">
          {engagement.title}
        </h3>

        {/* Excerpt */}
        {excerpt && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {excerpt}
          </p>
        )}

        {/* Photo count badge */}
        {photoCount > 0 && (
          <div className="pt-1">
            <Badge variant="secondary" className="text-xs gap-1">
              📷 {photoCount} {photoCount === 1 ? 'Photo' : 'Photos'}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
