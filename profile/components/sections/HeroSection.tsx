import Image from 'next/image'
import { Separator } from '@/components/ui/separator'
import { buttonVariants } from '@/components/ui/button'
import { SocialLinks } from '@/components/ui/SocialLinks'
import { ResumeDownloadLink } from '@/components/ui/ResumeDownloadLink'
import { SectionUnavailable } from '@/components/ui/SectionUnavailable'
import { cn } from '@/lib/utils'
import { env } from '@/lib/env'
import type { AboutMe } from '@/lib/types'

interface HeroSectionProps {
  aboutMe: AboutMe | null
}

export function HeroSection({ aboutMe }: HeroSectionProps) {
  if (!aboutMe) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <SectionUnavailable sectionName="Hero" />
      </div>
    )
  }

  const cvUrl = aboutMe.resumeFile
    ? `${env.strapiUrl}${aboutMe.resumeFile.url}`
    : null

  const profileImageUrl = aboutMe.profileImage?.url ?? null

  return (
    <div className="relative min-h-screen flex flex-col justify-center overflow-hidden">
      {/* Decorative radial gradient orb */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-48 -right-48 w-[600px] h-[600px] rounded-full blur-3xl opacity-15"
        style={{
          background: 'radial-gradient(circle at center, var(--accent), transparent 70%)',
        }}
      />

      <div className="relative max-w-6xl mx-auto px-4 md:px-8 lg:px-16 py-20 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-12">

          {/* Left — text content */}
          <div>
            {/* Pre-heading */}
            <p className="text-sm uppercase tracking-widest text-muted-foreground mb-4 font-medium">
              Lead Technical Consultant
            </p>

            {/* Elevator pitch */}
            <h3 className="text-3xl md:text-4xl font-bold leading-tight text-foreground mb-6 whitespace-pre-line">
              {aboutMe.elevatorPitch}
            </h3>

            <Separator className="my-8" />

            {/* Social links */}
            <SocialLinks links={aboutMe.socialLinks} className="mb-10" />

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <a href="#featured" className={cn(buttonVariants({ variant: 'outline' }))}>
                View My Work
              </a>
              {cvUrl && <ResumeDownloadLink href={cvUrl} label="Download CV" variant="ghost" />}
            </div>
          </div>

          {/* Right — profile image */}
          {profileImageUrl && (
            <div className="flex justify-center md:justify-end">
              <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden ring-4 ring-accent/30 shadow-2xl">
                <Image
                  src={profileImageUrl}
                  alt={aboutMe.profileImage?.alternativeText ?? 'Akash Borkar'}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 256px, 320px"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
