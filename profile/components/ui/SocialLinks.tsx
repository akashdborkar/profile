import { Link2, Code2, X, HelpCircle, type LucideProps } from 'lucide-react'
import type { SocialLink } from '@/lib/types'

type SocialPlatform = SocialLink['platformName']

function getSocialIcon(platform: SocialPlatform): React.ComponentType<LucideProps> {
  switch (platform) {
    case 'LinkedIn':      return Link2
    case 'GitHub':        return Code2
    case 'X':             return X
    case 'StackOverflow': return HelpCircle
    default:              return Link2
  }
}

interface SocialLinksProps {
  links: SocialLink[]
  className?: string
}

export function SocialLinks({ links, className = '' }: SocialLinksProps) {
  if (!links.length) return null
  return (
    <div className={`flex flex-wrap gap-5 ${className}`}>
      {links.map((link) => {
        const Icon = getSocialIcon(link.platformName)
        return (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-foreground/70 hover:text-accent transition-colors"
          >
            <Icon className="h-4 w-4" />
            {link.platformName}
          </a>
        )
      })}
    </div>
  )
}
