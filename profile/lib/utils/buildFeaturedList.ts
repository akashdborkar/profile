import {
  fetchFeaturedCurations,
  fetchBlogs,
  fetchProjects,
  fetchEngagements,
  fetchBlogById,
  fetchProjectById,
  fetchEngagementById,
} from '@/lib/api'
import type { FeaturedContentItem, CuratedItem } from '@/lib/types'

function getItemDate(item: FeaturedContentItem): number {
  const raw = item.kind === 'engagement'
    ? item.data.eventDate
    : (item.data.publishedAt ?? '')
  return raw ? new Date(raw).getTime() : 0
}

async function resolveCuratedItem(
  curated: CuratedItem
): Promise<FeaturedContentItem | null> {
  switch (curated.contentType) {
    case 'Blogs': {
      const data = await fetchBlogById(curated.targetId)
      return data ? { kind: 'blog', data } : null
    }
    case 'Projects': {
      const data = await fetchProjectById(curated.targetId)
      return data ? { kind: 'project', data } : null
    }
    case 'Engagements': {
      const data = await fetchEngagementById(curated.targetId)
      return data ? { kind: 'engagement', data } : null
    }
    default:
      return null
  }
}

export async function buildFeaturedList(): Promise<FeaturedContentItem[]> {
  const curations = await fetchFeaturedCurations()
  const curatedList = curations?.manuallyCuratedList ?? []
  // Manual curation path — explicit IDs take priority
  if (curatedList.length > 0) {
    const resolved = await Promise.all(
      curatedList.slice(0, 5).map(resolveCuratedItem)
    )
    return resolved.filter((item): item is FeaturedContentItem => item !== null)
  }

  // Fallback — aggregate isFeatured items across all collections
  const [blogs, projects, engagements] = await Promise.all([
    fetchBlogs(true),
    fetchProjects(true),
    fetchEngagements(true),
  ])

  const merged: FeaturedContentItem[] = [
    ...blogs.map((data) => ({ kind: 'blog' as const, data })),
    ...projects.map((data) => ({ kind: 'project' as const, data })),
    ...engagements.map((data) => ({ kind: 'engagement' as const, data })),
  ]

  return merged
    .sort((a, b) => getItemDate(b) - getItemDate(a))
    .slice(0, 5)
}
