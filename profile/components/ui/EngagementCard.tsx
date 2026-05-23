import Image from 'next/image'
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
  const hasMedia = (engagement.mediaUrls?.length ?? 0) > 0

  const title = (
    <h3 className="text-base font-semibold text-foreground leading-snug hover:text-accent transition-colors">
      {engagement.title}
    </h3>
  )

  return (
    <Card className="hover:border-accent/40 transition-colors">
      <CardContent className="pt-4 flex flex-col gap-2">
        {/* Date label */}
        <p className="text-xs font-semibold text-accent uppercase tracking-wide">
          {formatEventDate(engagement.eventDate)}
        </p>

        {/* Title — external link when postUrl is present */}
        {engagement.postUrl ? (
          <a href={engagement.postUrl} target="_blank" rel="noopener noreferrer">
            {title}
          </a>
        ) : (
          title
        )}

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

        {/* LinkedIn media */}
        {hasMedia && (
          <div className="mt-1 overflow-hidden rounded">
            {(engagement.mediaType === 'Image' || engagement.mediaType === 'Carousel') && (
              <Image
                src={engagement.mediaUrls![0]}
                alt={engagement.title}
                width={400}
                height={225}
                className="w-full object-cover rounded"
                unoptimized
              />
            )}
            {engagement.mediaType === 'Video' && (
              <video controls className="w-full rounded">
                <source src={engagement.mediaUrls![0]} />
              </video>
            )}
          </div>
        )}

        {/* Link preview — only when no media */}
        {!hasMedia && engagement.linkPreviewCard?.title && (
          <div className="rounded border border-border p-3 mt-1">
            <p className="text-sm font-medium text-foreground line-clamp-1">
              {engagement.linkPreviewCard.title}
            </p>
            {engagement.linkPreviewCard.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                {engagement.linkPreviewCard.description}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
