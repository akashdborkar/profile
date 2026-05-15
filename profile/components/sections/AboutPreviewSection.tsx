import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { SectionUnavailable } from '@/components/ui/SectionUnavailable'
import { extractFirstParagraph } from '@/lib/utils/richTextHelpers'
import type { AboutMe } from '@/lib/types'

const STATS = [
  { value: '10+', label: 'Years Experience' },
  { value: '50+', label: 'Projects Delivered' },
  { value: '15+', label: 'Technologies' },
] as const

interface AboutPreviewSectionProps {
  aboutMe: AboutMe | null
}

export function AboutPreviewSection({ aboutMe }: AboutPreviewSectionProps) {
  if (!aboutMe) return <SectionUnavailable sectionName="About" />

  const excerpt = extractFirstParagraph(aboutMe.professionalNarrative)

  return (
    <div className="grid md:grid-cols-2 gap-12 items-center">
      {/* Left — text */}
      <div>
        <p className="text-xs uppercase tracking-widest text-accent font-semibold mb-3">
          About
        </p>
        <h2 className="text-3xl font-bold text-foreground mb-4">Who I Am</h2>
        {excerpt && (
          <p className="text-foreground/70 leading-relaxed mb-6">
            {excerpt}
          </p>
        )}
        <Link
          href="/about"
          className="text-sm text-accent hover:underline underline-offset-4 transition-colors font-medium"
        >
          Read Full Story →
        </Link>
      </div>

      {/* Right — stats card */}
      <Card>
        <CardContent className="grid grid-cols-3 gap-4 py-8">
          {STATS.map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center text-center gap-1">
              <span className="text-4xl font-bold text-accent">{value}</span>
              <span className="text-xs text-muted-foreground leading-tight">{label}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
