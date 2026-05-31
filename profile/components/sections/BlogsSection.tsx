import Link from 'next/link'
import { SectionUnavailable } from '@/components/ui/SectionUnavailable'
import type { Blog } from '@/lib/types'

interface Props {
  blogs: Blog[] | null
}

function BlogRow({ blog }: { blog: Blog }) {
  const date = blog.publishedAt
    ? new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(
        new Date(blog.publishedAt)
      )
    : null

  const isExternalLink = blog.isExternal && !!blog.externalUrl
  const className = 'group flex items-start justify-between gap-4 py-4 border-b border-border last:border-0 hover:text-accent transition-colors'

  const content = (
    <>
      <div className="flex items-center gap-3 min-w-0">
        {blog.isExternal && (
          <span className="shrink-0 text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full text-sky-400 bg-sky-500/15">
            External
          </span>
        )}
        <span className="font-medium leading-snug group-hover:text-accent transition-colors truncate">
          {blog.title}
        </span>
      </div>
      {date && (
        <span className="shrink-0 text-sm text-muted-foreground">{date}</span>
      )}
    </>
  )

  if (isExternalLink) {
    return (
      <a href={blog.externalUrl} target="_blank" rel="noopener noreferrer" className={className}>
        {content}
      </a>
    )
  }

  return (
    <Link href={`/blog/${blog.slug}`} className={className}>
      {content}
    </Link>
  )
}

export function BlogsSection({ blogs }: Props) {
  if (!blogs) return <SectionUnavailable sectionName="Blogs" />

  const recent = blogs.slice(0, 3)

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <Link href="/blog" className="text-3xl font-bold text-foreground hover:text-accent transition-colors">
            Blogs
          </Link>
        {blogs.length > 3 && (
          <Link
            href="/blog"
            className="text-sm text-accent hover:underline transition-colors"
          >
            View all →
          </Link>
        )}
      </div>

      {recent.length === 0 ? (
        <p className="text-muted-foreground text-sm">No posts published yet.</p>
      ) : (
        <div>
          {recent.map((blog) => (
            <BlogRow key={blog.id} blog={blog} />
          ))}
        </div>
      )}
    </div>
  )
}
