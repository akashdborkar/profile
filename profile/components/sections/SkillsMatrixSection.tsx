import { groupSkillsByCategory } from '@/lib/utils/groupSkillsByCategory'
import { SkillsCategoryBlock } from './SkillsCategoryBlock'
import { SectionUnavailable } from '@/components/ui/SectionUnavailable'
import type { SkillsMatrix } from '@/lib/types'

interface SkillsMatrixSectionProps {
  skills: SkillsMatrix[] | null
}

export function SkillsMatrixSection({ skills }: SkillsMatrixSectionProps) {
  if (skills === null) return <SectionUnavailable sectionName="Skills" />

  const grouped = groupSkillsByCategory(skills)
  const sortedCategories = (Object.keys(grouped) as Array<keyof typeof grouped>).sort()

  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-accent font-semibold mb-3">
        Skills
      </p>
      <h2 className="text-3xl font-bold text-foreground mb-8">Technical Expertise</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedCategories.map((category) => {
          const categorySkills = grouped[category]
          if (!categorySkills?.length) return null
          return (
            <SkillsCategoryBlock
              key={category}
              category={category}
              skills={categorySkills}
            />
          )
        })}
      </div>
    </div>
  )
}
