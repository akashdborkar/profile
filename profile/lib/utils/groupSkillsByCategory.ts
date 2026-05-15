import type { SkillsMatrix, SkillCategory } from '../types'

export function groupSkillsByCategory(
  skills: SkillsMatrix[]
): Partial<Record<SkillCategory, SkillsMatrix[]>> {
  return skills.reduce<Partial<Record<SkillCategory, SkillsMatrix[]>>>(
    (acc, skill) => {
      const cat = skill.category
      if (!acc[cat]) acc[cat] = []
      acc[cat]!.push(skill)
      return acc
    },
    {}
  )
}
