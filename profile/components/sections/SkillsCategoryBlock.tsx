import { Card, CardContent } from '@/components/ui/card'
import { SkillBadge } from '@/components/ui/SkillBadge'
import type { SkillCategory, SkillsMatrix } from '@/lib/types'

interface SkillsCategoryBlockProps {
  category: SkillCategory
  skills: SkillsMatrix[]
}

export function SkillsCategoryBlock({ category, skills }: SkillsCategoryBlockProps) {
  return (
    <Card>
      <CardContent className="py-4">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3 font-medium">
          {category}
        </p>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <SkillBadge
              key={skill.id}
              skillName={skill.skillName}
              yearsOfExperience={skill.yearsOfExperience}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
