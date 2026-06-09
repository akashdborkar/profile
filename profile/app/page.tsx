import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { SectionWrapper } from '@/components/layout/SectionWrapper'
import { HeroSection } from '@/components/sections/HeroSection'
import { AboutPreviewSection } from '@/components/sections/AboutPreviewSection'
import { SkillsMatrixSection } from '@/components/sections/SkillsMatrixSection'
import { FeaturedSection } from '@/components/sections/FeaturedSection'
import { BlogsSection } from '@/components/sections/BlogsSection'
import { CertificationsSection } from '@/components/sections/CertificationsSection'
import { EngagementsSection } from '@/components/sections/EngagementsSection'
import { fetchAboutMe, fetchSkillsMatrix, fetchCertifications, fetchEngagements, fetchBlogs } from '@/lib/api'
import { buildFeaturedList } from '@/lib/utils/buildFeaturedList'

export default async function Home() {
  const [
    aboutMeResult,
    skillsResult,
    featuredResult,
    blogsResult,
    certificationsResult,
    engagementsResult,
  ] = await Promise.allSettled([
    fetchAboutMe(),
    fetchSkillsMatrix(),
    buildFeaturedList(),
    fetchBlogs(),
    fetchCertifications(),
    fetchEngagements(false, true),
  ])

  const aboutMe        = aboutMeResult.status        === 'fulfilled' ? aboutMeResult.value        : null
  const skills         = skillsResult.status         === 'fulfilled' ? skillsResult.value         : null
  const featuredItems  = featuredResult.status       === 'fulfilled' ? featuredResult.value       : null
  const blogs          = blogsResult.status          === 'fulfilled' ? blogsResult.value          : null
  const certifications = certificationsResult.status === 'fulfilled' ? certificationsResult.value : null
  const engagements    = engagementsResult.status    === 'fulfilled' ? engagementsResult.value    : null

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://akashdborkar.vercel.app'

  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Akash Borkar',
    jobTitle: aboutMe?.designation ?? 'Lead Technical Consultant',
    url: siteUrl,
    sameAs: ['https://www.linkedin.com/in/akashdborkar/'],
    description: `${aboutMe?.designation ?? 'Lead Technical Consultant'} with 9+ years of experience in scalable web architecture, cloud delivery, and engineering leadership.`,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <Navbar />
      <main>
        <section id="hero">
          <HeroSection aboutMe={aboutMe} />
        </section>

        <SectionWrapper id="about">
          <AboutPreviewSection aboutMe={aboutMe} />
        </SectionWrapper>

        <SectionWrapper id="skills">
          <SkillsMatrixSection skills={skills} />
        </SectionWrapper>

        <SectionWrapper id="featured">
          <FeaturedSection items={featuredItems} />
        </SectionWrapper>

        <SectionWrapper id="blog">
          <BlogsSection blogs={blogs} />
        </SectionWrapper>

        <SectionWrapper id="certifications">
          <CertificationsSection certifications={certifications} />
        </SectionWrapper>

        <SectionWrapper id="engagements">
          <EngagementsSection engagements={engagements} />
        </SectionWrapper>
      </main>
      <Footer />
    </>
  )
}
