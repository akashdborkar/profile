import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Blog, Project, EngagementAndActivity, FeaturedCurations } from '../../types'

vi.mock('@/lib/api', () => ({
  fetchFeaturedCurations: vi.fn(),
  fetchBlogs: vi.fn(),
  fetchProjects: vi.fn(),
  fetchEngagements: vi.fn(),
  fetchBlogById: vi.fn(),
  fetchProjectById: vi.fn(),
  fetchEngagementById: vi.fn(),
}))

// Import after mock registration so module resolves to mocked version
const { buildFeaturedList } = await import('../buildFeaturedList')
const api = await import('@/lib/api')

// ---------------------------------------------------------------------------
// Minimal fixtures
// ---------------------------------------------------------------------------

const makeBlog = (id: number, publishedAt: string, isFeatured = true): Blog => ({
  id, documentId: `blog-${id}`, title: `Blog ${id}`, slug: `blog-${id}`,
  isExternal: false, isFeatured, contentBlocks: [],
  createdAt: publishedAt, updatedAt: publishedAt, publishedAt,
})

const makeProject = (id: number, publishedAt: string, isFeatured = true): Project => ({
  id, documentId: `proj-${id}`, title: `Project ${id}`, slug: `project-${id}`,
  leadershipRole: 'Lead', challenge: [], solution: [], skills_matrices: [], isFeatured,
  createdAt: publishedAt, updatedAt: publishedAt, publishedAt,
})

const makeEngagement = (id: number, eventDate: string, isFeatured = true): EngagementAndActivity => ({
  id, documentId: `eng-${id}`, title: `Engagement ${id}`,
  description: [], eventDate, isFeatured, gallery_items: [],
  createdAt: eventDate, updatedAt: eventDate, publishedAt: eventDate,
})

const emptyCurations: FeaturedCurations = {
  id: 1, documentId: 'fc1', manuallyCuratedList: [],
  createdAt: '', updatedAt: '', publishedAt: '',
}

beforeEach(() => { vi.clearAllMocks() })

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('buildFeaturedList', () => {
  it('uses fallback path when manuallyCuratedList is empty', async () => {
    vi.mocked(api.fetchFeaturedCurations).mockResolvedValue(emptyCurations)
    vi.mocked(api.fetchBlogs).mockResolvedValue([makeBlog(1, '2024-03-01')])
    vi.mocked(api.fetchProjects).mockResolvedValue([])
    vi.mocked(api.fetchEngagements).mockResolvedValue([])

    const result = await buildFeaturedList()

    expect(api.fetchBlogs).toHaveBeenCalledWith(true)
    expect(api.fetchProjects).toHaveBeenCalledWith(true)
    expect(api.fetchEngagements).toHaveBeenCalledWith(true)
    expect(result).toHaveLength(1)
    expect(result[0].kind).toBe('blog')
  })

  it('uses manual curation path when curated items exist', async () => {
    const curations: FeaturedCurations = {
      ...emptyCurations,
      manuallyCuratedList: [
        { id: 1, contentType: 'Blogs', targetId: 10 },
        { id: 2, contentType: 'Projects', targetId: 20 },
      ],
    }
    vi.mocked(api.fetchFeaturedCurations).mockResolvedValue(curations)
    vi.mocked(api.fetchBlogById).mockResolvedValue(makeBlog(10, '2024-01-01'))
    vi.mocked(api.fetchProjectById).mockResolvedValue(makeProject(20, '2024-02-01'))

    const result = await buildFeaturedList()

    expect(api.fetchBlogById).toHaveBeenCalledWith(10)
    expect(api.fetchProjectById).toHaveBeenCalledWith(20)
    expect(api.fetchBlogs).not.toHaveBeenCalled()
    expect(result).toHaveLength(2)
    expect(result[0].kind).toBe('blog')
    expect(result[1].kind).toBe('project')
  })

  it('sorts merged results by date descending and caps at 5', async () => {
    vi.mocked(api.fetchFeaturedCurations).mockResolvedValue(emptyCurations)
    vi.mocked(api.fetchBlogs).mockResolvedValue([
      makeBlog(1, '2024-01-01'),
      makeBlog(2, '2024-06-01'),
      makeBlog(3, '2024-03-01'),
    ])
    vi.mocked(api.fetchProjects).mockResolvedValue([
      makeProject(4, '2024-05-01'),
      makeProject(5, '2024-04-01'),
    ])
    vi.mocked(api.fetchEngagements).mockResolvedValue([
      makeEngagement(6, '2024-07-01'),
    ])

    const result = await buildFeaturedList()

    expect(result).toHaveLength(5)
    // Most recent first
    expect(result[0].data.id).toBe(6)  // engagement Jul
    expect(result[1].data.id).toBe(2)  // blog Jun
    expect(result[2].data.id).toBe(4)  // project May
  })

  it('skips curated items that 404 from their fetch', async () => {
    const curations: FeaturedCurations = {
      ...emptyCurations,
      manuallyCuratedList: [
        { id: 1, contentType: 'Blogs', targetId: 99 },
        { id: 2, contentType: 'Projects', targetId: 20 },
      ],
    }
    vi.mocked(api.fetchFeaturedCurations).mockResolvedValue(curations)
    vi.mocked(api.fetchBlogById).mockResolvedValue(null)
    vi.mocked(api.fetchProjectById).mockResolvedValue(makeProject(20, '2024-01-01'))

    const result = await buildFeaturedList()
    expect(result).toHaveLength(1)
    expect(result[0].kind).toBe('project')
  })

  it('returns empty array when CMS returns null curations and no featured content', async () => {
    vi.mocked(api.fetchFeaturedCurations).mockResolvedValue(null)
    vi.mocked(api.fetchBlogs).mockResolvedValue([])
    vi.mocked(api.fetchProjects).mockResolvedValue([])
    vi.mocked(api.fetchEngagements).mockResolvedValue([])

    const result = await buildFeaturedList()
    expect(result).toHaveLength(0)
  })
})
