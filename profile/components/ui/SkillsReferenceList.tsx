import { Badge } from '@/components/ui/badge'
import type { SkillsMatrix } from '@/lib/types'

interface Props {
  skills: SkillsMatrix[]
}

export function SkillsReferenceList({ skills }: Props) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
        Technologies Used
      </p>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <Badge key={skill.id} variant="outline" className="text-xs">
            {skill.skillName}
          </Badge>
        ))}
      </div>
    </div>
  )
}
