import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { RichTextRenderer } from '@/components/ui/RichTextRenderer'
import { SkillsReferenceList } from '@/components/ui/SkillsReferenceList'
import type { Project } from '@/lib/types'

interface Props {
  project: Project
}

export function CaseStudyLayout({ project }: Props) {
  const publishedDate = project.publishedAt
    ? new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(
        new Date(project.publishedAt)
      )
    : null

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-16 py-12">
      {/* Page header */}
      <div className="mb-10">
        <Link
          href="/#featured"
          className="text-sm text-muted-foreground hover:text-accent transition-colors mb-6 inline-block"
        >
          ← Back
        </Link>
        <div className="flex items-center gap-3 mb-4">
          <Badge variant="secondary">{project.leadershipRole}</Badge>
          {publishedDate && (
            <span className="text-sm text-muted-foreground">{publishedDate}</span>
          )}
        </div>
        <h1 className="text-4xl font-bold leading-tight">
          {project.projectUrl ? (
            <a
              href={project.projectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent transition-colors"
            >
              {project.title}
            </a>
          ) : (
            project.title
          )}
        </h1>
      </div>

      {/* Content grid */}
      <div className="grid md:grid-cols-5 gap-12">
        {/* Left: rich text content (3/5) */}
        <div className="md:col-span-3 space-y-10">
          <section>
            <h2 className="text-2xl font-semibold mb-4">The Challenge</h2>
            <RichTextRenderer blocks={project.challenge} />
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-4">The Solution</h2>
            <RichTextRenderer blocks={project.solution} />
          </section>
        </div>

        {/* Right: sticky sidebar (2/5) */}
        <div className="md:col-span-2">
          <div className="sticky top-24 space-y-6">
            {project.skills_matrices.length > 0 && (
              <SkillsReferenceList skills={project.skills_matrices} />
            )}
            <Separator />
            <Card className="bg-muted/30">
              <CardContent className="pt-5 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Leadership Role
                </p>
                <p className="font-medium">{project.leadershipRole}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
