'use client'

import { trackResumeDownloadClick } from '@/lib/utils/analytics'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

interface Props {
  href: string
  label?: string
  variant?: 'outline' | 'ghost'
}

export function ResumeDownloadLink({ href, label = 'Download Full CV (PDF)', variant = 'outline' }: Props) {
  return (
    <a
      href={href}
      download
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackResumeDownloadClick(href)}
      className={cn(buttonVariants({ variant }))}
    >
      {label}
    </a>
  )
}
