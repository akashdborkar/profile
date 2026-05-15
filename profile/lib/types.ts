// ---------------------------------------------------------------------------
// Strapi v5 base — responses are flat (no `attributes` wrapper)
// ---------------------------------------------------------------------------

export interface StrapiEntity {
  id: number
  documentId: string
  createdAt: string
  updatedAt: string
  publishedAt?: string | null
}

export interface StrapiListResponse<T> {
  data: T[]
  meta: {
    pagination?: {
      page: number
      pageSize: number
      pageCount: number
      total: number
    }
  }
}

export interface StrapiSingleResponse<T> {
  data: T | null
  meta: Record<string, unknown>
}

// ---------------------------------------------------------------------------
// Media
// ---------------------------------------------------------------------------

export interface StrapiMedia extends StrapiEntity {
  name: string
  alternativeText: string | null
  caption: string | null
  width: number | null
  height: number | null
  formats: Record<string, unknown> | null
  hash: string
  ext: string
  mime: string
  size: number
  url: string
  previewUrl: string | null
  provider: string
}

// ---------------------------------------------------------------------------
// Strapi Blocks rich text node
// ---------------------------------------------------------------------------

export type StrapiBlock = {
  type: string
  children: Array<{ type: string; text?: string; [key: string]: unknown }>
  [key: string]: unknown
}

// ---------------------------------------------------------------------------
// Shared components
// ---------------------------------------------------------------------------

export interface SocialLink {
  id: number
  platformName: 'LinkedIn' | 'GitHub' | 'X' | 'StackOverflow'
  url: string
}

export interface CuratedItem {
  id: number
  contentType: 'Blogs' | 'Projects' | 'Engagements'
  targetId: number
}

// ---------------------------------------------------------------------------
// Single Types
// ---------------------------------------------------------------------------

export interface AboutMe extends StrapiEntity {
  elevatorPitch: string
  professionalNarrative: StrapiBlock[]
  resumeFile: StrapiMedia | null
  socialLinks: SocialLink[]
}

export interface FeaturedCurations extends StrapiEntity {
  manuallyCuratedList: CuratedItem[]
}

// ---------------------------------------------------------------------------
// Collection Types
// ---------------------------------------------------------------------------

export type SkillCategory =
  | 'Frontend'
  | 'Backend'
  | 'Cloud'
  | 'DevOps'
  | 'Database'
  | 'CMS'
  | 'AI'
  | 'Architecture'
  | 'Management'

export interface SkillsMatrix extends StrapiEntity {
  skillName: string
  category: SkillCategory
  yearsOfExperience: number
}

export interface Project extends StrapiEntity {
  title: string
  slug: string
  leadershipRole: string
  challenge: StrapiBlock[]
  solution: StrapiBlock[]
  skills_matrices: SkillsMatrix[]
  isFeatured: boolean
}

// ---------------------------------------------------------------------------
// Blog + Dynamic Zone blocks
// ---------------------------------------------------------------------------

export type HeroBlock = {
  __component: 'content.hero-block'
  id: number
  image: StrapiMedia | null
  headingText: string
}

export type TextBlock = {
  __component: 'content.text-block'
  id: number
  body: StrapiBlock[]
}

export type CodeBlock = {
  __component: 'content.code-block'
  id: number
  code: string
  language: string
}

export type CalloutBox = {
  __component: 'content.callout-box'
  id: number
  variant: 'Info' | 'Warning' | 'Success'
  content: string
}

export type ContentBlock = HeroBlock | TextBlock | CodeBlock | CalloutBox

export interface Blog extends StrapiEntity {
  title: string
  slug: string
  isExternal: boolean
  externalUrl?: string
  isFeatured: boolean
  contentBlocks: ContentBlock[]
}

// ---------------------------------------------------------------------------
// Gallery, Certification, EngagementAndActivity
// ---------------------------------------------------------------------------

export type GalleryCategoryTag =
  | 'SpeakingEvents'
  | 'Offices'
  | 'TeamWork'
  | 'Certifications'

export interface Gallery extends StrapiEntity {
  title: string
  imageAsset: StrapiMedia
  categoryTag: GalleryCategoryTag
}

export interface Certification extends StrapiEntity {
  title: string
  issuingBody: string
  badgeImage: StrapiMedia | null
  verificationUrl: string
  expiryDate?: string
}

export interface EngagementAndActivity extends StrapiEntity {
  title: string
  description: StrapiBlock[]
  eventDate: string
  isFeatured: boolean
  gallery_items: Gallery[]
}

// ---------------------------------------------------------------------------
// Featured content hybrid engine — discriminated union (Strapi v5 flat types)
// ---------------------------------------------------------------------------

export type FeaturedContentItem =
  | { kind: 'blog';       data: Blog }
  | { kind: 'project';    data: Project }
  | { kind: 'engagement'; data: EngagementAndActivity }
