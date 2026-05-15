import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SkillBadge } from '../SkillBadge'

describe('SkillBadge', () => {
  it('renders the skill name', () => {
    render(<SkillBadge skillName="TypeScript" yearsOfExperience={5} />)
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
  })

  it('renders years of experience with "yr" suffix', () => {
    render(<SkillBadge skillName="React" yearsOfExperience={3} />)
    expect(screen.getByText('3yr')).toBeInTheDocument()
  })

  it('matches snapshot', () => {
    const { container } = render(<SkillBadge skillName="Next.js" yearsOfExperience={2} />)
    expect(container.firstChild).toMatchSnapshot()
  })
})
