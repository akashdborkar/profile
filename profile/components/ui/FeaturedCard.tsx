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

function getHref(item: FeaturedContentItem): string | null {
  if (item.kind === 'blog') {
    return item.data.isExternal ? (item.data.externalUrl ?? null) : `/blog/${item.data.slug}`
  }
  if (item.kind === 'project') {
    return `/case-studies/${item.data.slug}`
  }
  // engagement
  return item.data.postUrl ?? null
}

interface FeaturedCardProps {
  item: FeaturedContentItem
}

export function FeaturedCard({ item }: FeaturedCardProps) {
  const { label, color } = KIND_CONFIG[item.kind]
  const href = getHref(item)
  const isExternal =
    (item.kind === 'blog' && item.data.isExternal && !!item.data.externalUrl) ||
    item.kind === 'engagement'

  const card = (
    <Card className={cn(
      'hover:shadow-lg hover:border-accent/50 transition-all flex flex-col h-full',
      href && 'cursor-pointer'
    )}>
      <CardContent className="pt-4 flex flex-col gap-3 flex-1">
        <span className={cn(
          'self-start text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full',
          color
        )}>
          {label}
        </span>
        <h3 className="text-base font-semibold leading-snug line-clamp-2">
          {item.data.title}
        </h3>
        <p className="text-sm text-muted-foreground mt-auto">{getDescriptor(item)}</p>
      </CardContent>
    </Card>
  )

  if (!href) return card

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackExternalBlogClick(item.data.title, href)}
      >
        {card}
      </a>
    )
  }

  return <Link href={href}>{card}</Link>
}
