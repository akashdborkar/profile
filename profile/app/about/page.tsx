import type { Metadata } from 'next'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { RichTextRenderer } from '@/components/ui/RichTextRenderer'
import { SocialLinks } from '@/components/ui/SocialLinks'
import { fetchAboutMe } from '@/lib/api'
import { ResumeDownloadLink } from '@/components/ui/ResumeDownloadLink'

export async function generateMetadata(): Promise<Metadata> {
  try {
    const aboutMe = await fetchAboutMe()
    return {
      title: 'About Akash Borkar | Lead Technical Consultant',
      description: aboutMe.elevatorPitch.replace(/\n/g, ' ').substring(0, 160),
      alternates: { canonical: '/about' },
      keywords: ['Akash Borkar', 'about Akash Borkar', 'Lead Technical Consultant', 'Technical Consultant'],
    }
  } catch {
    return { title: 'About | Lead Technical Consultant' }
  }
}

export default async function AboutPage() {
  let aboutMe = null
  try {
    aboutMe = await fetchAboutMe()
  } catch {
    // CMS unavailable
  }

  const cvUrl = '/Akash_Borkar_CV.pdf'

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 md:px-8 lg:px-16 py-16">
        {/* Back link */}
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-accent transition-colors mb-8 inline-block"
        >
          ← Back to Home
        </Link>

        {/* Page header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-foreground mb-4">About Me</h1>
          {aboutMe && (
            <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
              {aboutMe.elevatorPitch}
            </p>
          )}
        </div>

        {/* Professional narrative */}
        {aboutMe ? (
          <RichTextRenderer blocks={aboutMe.professionalNarrative} />
        ) : (
          <p className="text-muted-foreground">Content temporarily unavailable.</p>
        )}

        {/* Social links */}
        {aboutMe && (
          <div className="mt-10 pt-8 border-t border-border">
            <SocialLinks links={aboutMe.socialLinks} />
          </div>
        )}

        {/* CV download */}
        {cvUrl && (
          <div className="mt-8">
            <ResumeDownloadLink href={cvUrl} />
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
