import type { Metadata } from 'next'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { fetchBlogs } from '@/lib/api'
import type { Blog } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Writing on software engineering, leadership, and technology.',
}

function BlogCard({ blog }: { blog: Blog }) {
  const date = blog.publishedAt
    ? new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(
        new Date(blog.publishedAt)
      )
    : null

  return (
    <Link
      href={`/blog/${blog.slug}`}
      className="group block py-6 border-b border-border last:border-0"
    >
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-2">
            {blog.isExternal && (
              <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full text-sky-400 bg-sky-500/15">
                External
              </span>
            )}
            {blog.isFeatured && (
              <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full text-violet-400 bg-violet-500/15">
                Featured
              </span>
            )}
          </div>
          <h2 className="text-lg font-semibold leading-snug group-hover:text-accent transition-colors">
            {blog.title}
          </h2>
        </div>
        {date && (
          <span className="shrink-0 text-sm text-muted-foreground pt-0.5">{date}</span>
        )}
      </div>
    </Link>
  )
}

export default async function BlogIndexPage() {
  let blogs: Blog[] = []
  try {
    blogs = await fetchBlogs()
  } catch {
    // render empty state
  }

  return (
    <>
      <Navbar />
      <main>
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-12">
          <div className="mb-10">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-accent transition-colors mb-6 inline-block"
            >
              ← Back
            </Link>
            <h1 className="text-4xl font-bold">Blog</h1>
            <p className="mt-2 text-muted-foreground">
              {blogs.length} post{blogs.length !== 1 ? 's' : ''}
            </p>
          </div>

          {blogs.length === 0 ? (
            <p className="text-muted-foreground">No posts published yet.</p>
          ) : (
            <div>
              {blogs.map((blog) => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
