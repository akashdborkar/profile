import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { extractFirstParagraph } from '@/lib/utils/richTextHelpers'
import type { EngagementAndActivity } from '@/lib/types'

function formatEventDate(dateStr: string): string {
  return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(
    new Date(dateStr)
  )
}

interface EngagementCardProps {
  engagement: EngagementAndActivity
}

export function EngagementCard({ engagement }: EngagementCardProps) {
  const excerpt = extractFirstParagraph(engagement.description)
  const photoCount = engagement.gallery_items?.length ?? 0
  const imageUrl = engagement.gallery_items?.[0]?.imageAsset?.url ?? null

  const card = (
    <Card className={cn(
      'hover:border-accent/40 transition-all overflow-hidden flex flex-col h-full',
      engagement.postUrl && 'cursor-pointer hover:shadow-md'
    )}>
      {imageUrl && (
        <div className="relative w-full aspect-video bg-muted overflow-hidden -mt-4">
          <Image
            src={imageUrl}
            alt={engagement.title}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      )}

      <CardContent className="pt-4 flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold text-foreground leading-snug flex-1 min-w-0">
            {engagement.title}
          </h3>
          <span className="shrink-0 text-xs font-medium text-accent mt-0.5">
            {formatEventDate(engagement.eventDate)}
          </span>
        </div>

        {excerpt && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {excerpt}
          </p>
        )}

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

  if (!engagement.postUrl) return card

  return (
    <a href={engagement.postUrl} target="_blank" rel="noopener noreferrer">
      {card}
    </a>
  )
}
