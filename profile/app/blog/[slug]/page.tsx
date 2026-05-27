import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { DynamicZoneRenderer } from '@/components/blocks/DynamicZoneRenderer'
import { fetchBlogs, fetchBlogBySlug } from '@/lib/api'
import { extractFirstParagraph } from '@/lib/utils/richTextHelpers'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  try {
    const blogs = await fetchBlogs()
    return blogs.map((b) => ({ slug: b.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  let blog
  try {
    blog = await fetchBlogBySlug(slug)
  } catch {
    return {}
  }
  if (!blog) return {}

  const description = blog.contentBlocks?.length
    ? extractFirstParagraph(
        blog.contentBlocks
          .filter((b) => b.__component === 'content.text-block')
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .flatMap((b) => (b as any).body ?? [])
      )
    : undefined

  return {
    title: blog.title,
    description: description || undefined,
    alternates: { canonical: `/blog/${blog.slug}` },
    openGraph: {
      type: 'article',
      title: blog.title,
      description: description || undefined,
      publishedTime: blog.publishedAt ?? undefined,
      authors: ['Akash Borkar'],
    },
  }
}

export default async function BlogSlugPage({ params }: Props) {
  const { slug } = await params

  let blog
  try {
    blog = await fetchBlogBySlug(slug)
  } catch {
    notFound()
  }

  if (!blog) notFound()

  if (blog.isExternal && blog.externalUrl) {
    redirect(blog.externalUrl)
  }

  const publishedDate = blog.publishedAt
    ? new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(
        new Date(blog.publishedAt)
      )
    : null

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://akashdborkar.vercel.app'
  const blogJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blog.title,
    author: { '@type': 'Person', name: 'Akash Borkar', url: siteUrl },
    url: `${siteUrl}/blog/${blog.slug}`,
    ...(blog.publishedAt && { datePublished: blog.publishedAt }),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />
      <Navbar />
      <main>
        <div className="max-w-3xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold leading-tight mb-3">{blog.title}</h1>
          {publishedDate && (
            <p className="text-sm text-muted-foreground mb-8">{publishedDate}</p>
          )}
          {blog.contentBlocks?.length > 0 && (
            <DynamicZoneRenderer blocks={blog.contentBlocks} />
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
