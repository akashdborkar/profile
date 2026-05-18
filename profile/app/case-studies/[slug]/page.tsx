import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { CaseStudyLayout } from '@/components/sections/CaseStudyLayout'
import { fetchProjects, fetchProjectBySlug } from '@/lib/api'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  try {
    const projects = await fetchProjects()
    return projects.map((p) => ({ slug: p.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  try {
    const project = await fetchProjectBySlug(slug)
    if (!project) return {}
    return {
      title: `${project.title} | Case Study`,
      description: project.leadershipRole,
    }
  } catch {
    return {}
  }
}

export default async function CaseStudySlugPage({ params }: Props) {
  const { slug } = await params

  let project
  try {
    project = await fetchProjectBySlug(slug)
  } catch {
    notFound()
  }

  if (!project) notFound()

  return (
    <>
      <Navbar />
      <main>
        <CaseStudyLayout project={project} />
      </main>
      <Footer />
    </>
  )
}
