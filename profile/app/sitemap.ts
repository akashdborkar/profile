import type { MetadataRoute } from 'next'
import { fetchBlogs, fetchProjects } from '@/lib/api'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://akashborkar.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [blogs, projects] = await Promise.all([
    fetchBlogs().catch(() => []),
    fetchProjects().catch(() => []),
  ])

  const blogUrls = blogs
    .filter((b) => !b.isExternal)
    .map((b) => ({
      url: `${BASE_URL}/blog/${b.slug}`,
      lastModified: b.publishedAt ? new Date(b.publishedAt) : new Date(),
    }))

  const projectUrls = projects.map((p) => ({
    url: `${BASE_URL}/case-studies/${p.slug}`,
    lastModified: p.publishedAt ? new Date(p.publishedAt) : new Date(),
  }))

  return [
    { url: BASE_URL,              lastModified: new Date() },
    { url: `${BASE_URL}/about`,   lastModified: new Date() },
    { url: `${BASE_URL}/contact`, lastModified: new Date() },
    ...blogUrls,
    ...projectUrls,
  ]
}
