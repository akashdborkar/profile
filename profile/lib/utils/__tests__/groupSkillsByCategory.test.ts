import { describe, it, expect } from 'vitest'
import { groupSkillsByCategory } from '../groupSkillsByCategory'
import type { SkillsMatrix } from '../../types'

const makeSkill = (overrides: Partial<SkillsMatrix>): SkillsMatrix => ({
  id: 1,
  documentId: 'test-doc',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  publishedAt: '2024-01-01T00:00:00.000Z',
  skillName: 'Test Skill',
  category: 'Frontend',
  yearsOfExperience: 2,
  ...overrides,
})

describe('groupSkillsByCategory', () => {
  it('returns empty object for empty input', () => {
    const result = groupSkillsByCategory([])
    expect(result).toEqual({})
  })

  it('groups a single skill into the correct category', () => {
    const skills = [makeSkill({ skillName: 'React', category: 'Frontend' })]
    const result = groupSkillsByCategory(skills)
    expect(result.Frontend).toHaveLength(1)
    expect(result.Frontend![0].skillName).toBe('React')
  })

  it('splits skills from two categories into separate keys', () => {
    const skills = [
      makeSkill({ id: 1, skillName: 'React', category: 'Frontend' }),
      makeSkill({ id: 2, skillName: 'Next.js', category: 'Frontend' }),
      makeSkill({ id: 3, skillName: 'Node.js', category: 'Backend' }),
    ]
    const result = groupSkillsByCategory(skills)
    expect(result.Frontend).toHaveLength(2)
    expect(result.Backend).toHaveLength(1)
    expect(result.Cloud).toBeUndefined()
  })

  it('does not add keys for categories with no skills', () => {
    const skills = [makeSkill({ category: 'AI' })]
    const result = groupSkillsByCategory(skills)
    expect(Object.keys(result)).toEqual(['AI'])
  })

  it('preserves skill data when grouping', () => {
    const skill = makeSkill({ skillName: 'TypeScript', category: 'Frontend', yearsOfExperience: 5 })
    const result = groupSkillsByCategory([skill])
    expect(result.Frontend![0].yearsOfExperience).toBe(5)
  })
})
