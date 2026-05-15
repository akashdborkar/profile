import { cn } from '@/lib/utils'
import { badgeVariants } from '@/components/ui/badge'

interface SkillBadgeProps {
  skillName: string
  yearsOfExperience: number
}

export function SkillBadge({ skillName, yearsOfExperience }: SkillBadgeProps) {
  return (
    <span
      className={cn(
        badgeVariants({ variant: 'secondary' }),
        'hover:border-accent transition-colors cursor-default gap-1.5 h-auto py-1 px-2.5'
      )}
    >
      {skillName}
      <span className="text-muted-foreground font-normal text-[0.65rem]">
        {yearsOfExperience}yr
      </span>
    </span>
  )
}
