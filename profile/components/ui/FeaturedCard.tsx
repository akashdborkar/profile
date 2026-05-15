'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { trackExternalBlogClick } from '@/lib/utils/analytics'
import type { FeaturedContentItem } from '@/lib/types'

const KIND_CONFIG = {
  blog:       { label: 'Blog',       color: 'text-sky-400  bg-sky-500/15'    },
  project:    { label: 'Project',    color: 'text-violet-400 bg-violet-500/15' },
  engagement: { label: 'Engagement', color: 'text-emerald-400 bg-emerald-500/15' },
} as const

function getDescriptor(item: FeaturedContentItem): string {
  switch (item.kind) {
    case 'blog':
      return item.data.isExternal ? 'External Post' : 'Blog Post'
    case 'project':
      return item.data.leadershipRole
    case 'engagement':
      return new Date(item.data.eventDate).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
  }
}

function CardLinkWrapper({
  item,
  children,
}: {
  item: FeaturedContentItem
  children: React.ReactNode
}) {
  if (item.kind === 'blog') {
    if (item.data.isExternal && item.data.externalUrl) {
      return (
        <a
          href={item.data.externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackExternalBlogClick(item.data.title, item.data.externalUrl!)}
        >
          {children}
        </a>
      )
    }
    return <Link href={`/blog/${item.data.slug}`}>{children}</Link>
  }
  if (item.kind === 'project') {
    return <Link href={`/case-studies/${item.data.slug}`}>{children}</Link>
  }
  // Engagement — no deep link
  return <>{children}</>
}

interface FeaturedCardProps {
  item: FeaturedContentItem
}

export function FeaturedCard({ item }: FeaturedCardProps) {
  const { label, color } = KIND_CONFIG[item.kind]

  return (
    <Card className="hover:shadow-lg hover:border-accent/50 transition-all flex flex-col">
      <CardContent className="pt-4 flex flex-col gap-3 flex-1">
        {/* Kind badge */}
        <span
          className={cn(
            'self-start text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full',
            color
          )}
        >
          {label}
        </span>

        {/* Title */}
        <CardLinkWrapper item={item}>
          <h3 className="text-base font-semibold leading-snug hover:text-accent transition-colors line-clamp-2">
            {item.data.title}
          </h3>
        </CardLinkWrapper>

        {/* Descriptor */}
        <p className="text-sm text-muted-foreground mt-auto">{getDescriptor(item)}</p>
      </CardContent>
    </Card>
  )
}
