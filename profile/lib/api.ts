import { strapiRequest } from './strapi'
import type {
  AboutMe,
  Contact,
  FeaturedCurations,
  SkillsMatrix,
  Project,
  Blog,
  Gallery,
  GalleryCategoryTag,
  Certification,
  EngagementAndActivity,
  StrapiListResponse,
  StrapiSingleResponse,
} from './types'

// ---------------------------------------------------------------------------
// Strapi v5: Dynamic Zone must use fragment (on) populate syntax.
// Flat populate=* does NOT work for dynamic zones in v5.
// ---------------------------------------------------------------------------
const BLOG_BLOCKS_POPULATE = [
  'populate[contentBlocks][on][content.hero-block][populate][image][fields][0]=url',
  'populate[contentBlocks][on][content.hero-block][populate][image][fields][1]=alternativeText',
  'populate[contentBlocks][on][content.hero-block][populate][image][fields][2]=width',
  'populate[contentBlocks][on][content.hero-block][populate][image][fields][3]=height',
  'populate[contentBlocks][on][content.text-block][populate]=*',
  'populate[contentBlocks][on][content.code-block][populate]=*',
  'populate[contentBlocks][on][content.callout-box][populate]=*',
].join('&')

// ---------------------------------------------------------------------------
// Single Types
// ---------------------------------------------------------------------------

export async function fetchAboutMe(): Promise<AboutMe> {
  const res = await strapiRequest<StrapiSingleResponse<AboutMe>>(
    '/api/about-me?populate=*',
    { tags: ['about-me'] }
  )
  if (!res.data) throw new Error('AboutMe content not found in Strapi')
  return res.data
}

export async function fetchContact(): Promise<Contact | null> {
  try {
    const res = await strapiRequest<StrapiSingleResponse<Contact>>(
      '/api/contact',
      { tags: ['contact'] }
    )
    return res.data
  } catch {
    return null
  }
}

export async function fetchFeaturedCurations(): Promise<FeaturedCurations | null> {
  try {
    const res = await strapiRequest<StrapiSingleResponse<FeaturedCurations>>(
      '/api/featured-curation?populate=*',
      { tags: ['featured-curations'] }
    )
    return res.data
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// SkillsMatrix
// ---------------------------------------------------------------------------

export async function fetchSkillsMatrix(): Promise<SkillsMatrix[]> {
  const res = await strapiRequest<StrapiListResponse<SkillsMatrix>>(
    '/api/skills-matrices?sort=category:asc&pagination[limit]=100',
    { tags: ['skills-matrix'] }
  )
  return res.data
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export async function fetchProjects(featured?: boolean): Promise<Project[]> {
  const filter = featured ? '&filters[isFeatured][$eq]=true' : ''
  const res = await strapiRequest<StrapiListResponse<Project>>(
    `/api/projects?populate[skills_matrices][fields][0]=skillName&populate[skills_matrices][fields][1]=category&populate[skills_matrices][fields][2]=yearsOfExperience&sort=publishedAt:desc${filter}`,
    { tags: ['projects'] }
  )
  return res.data
}

export async function fetchProjectBySlug(slug: string): Promise<Project | null> {
  const res = await strapiRequest<StrapiListResponse<Project>>(
    `/api/projects?filters[slug][$eq]=${encodeURIComponent(slug)}&populate[skills_matrices][fields][0]=skillName&populate[skills_matrices][fields][1]=category&populate[skills_matrices][fields][2]=yearsOfExperience`,
    { tags: ['projects', slug] }
  )
  return res.data[0] ?? null
}

// ---------------------------------------------------------------------------
// Blogs
// ---------------------------------------------------------------------------

export async function fetchBlogs(featured?: boolean): Promise<Blog[]> {
  const filter = featured ? '&filters[isFeatured][$eq]=true' : ''
  const res = await strapiRequest<StrapiListResponse<Blog>>(
    `/api/blogs?sort=publishedAt:desc${filter}`,
    { tags: ['blogs'] }
  )
  return res.data
}

export async function fetchBlogBySlug(slug: string): Promise<Blog | null> {
  const res = await strapiRequest<StrapiListResponse<Blog>>(
    `/api/blogs?filters[slug][$eq]=${encodeURIComponent(slug)}&${BLOG_BLOCKS_POPULATE}`,
    { tags: ['blogs', slug] }
  )
  return res.data[0] ?? null
}

// ---------------------------------------------------------------------------
// Gallery
// ---------------------------------------------------------------------------

export async function fetchGallery(tag?: GalleryCategoryTag): Promise<Gallery[]> {
  const filter = tag ? `&filters[categoryTag][$eq]=${encodeURIComponent(tag)}` : ''
  const res = await strapiRequest<StrapiListResponse<Gallery>>(
    `/api/galleries?populate[imageAsset][fields][0]=url&populate[imageAsset][fields][1]=alternativeText&pagination[limit]=100${filter}`,
    { tags: ['gallery'] }
  )
  return res.data
}

// ---------------------------------------------------------------------------
// Certifications
// ---------------------------------------------------------------------------

export async function fetchCertifications(): Promise<Certification[]> {
  const res = await strapiRequest<StrapiListResponse<Certification>>(
    '/api/certifications?populate[badgeImage][fields][0]=url&populate[badgeImage][fields][1]=alternativeText&populate[badgeImage][fields][2]=name&pagination[limit]=100',
    { tags: ['certifications'] }
  )
  return res.data
}

// ---------------------------------------------------------------------------
// Engagements
// ---------------------------------------------------------------------------

export async function fetchEngagements(
  featured?: boolean,
  withGallery = false
): Promise<EngagementAndActivity[]> {
  const filter = featured ? '&filters[isFeatured][$eq]=true' : ''
  // Avoid circular reference (gallery_items → engagement_and_activities) with explicit fields
  const galleryPopulate = withGallery
    ? '&populate[gallery_items][fields][0]=title&populate[gallery_items][fields][1]=categoryTag&populate[gallery_items][populate][imageAsset][fields][0]=url&populate[gallery_items][populate][imageAsset][fields][1]=alternativeText'
    : ''
  const res = await strapiRequest<StrapiListResponse<EngagementAndActivity>>(
    `/api/engagement-and-activities?sort=eventDate:desc${galleryPopulate}${filter}`,
    { tags: ['engagements'] }
  )
  return res.data
}

// ---------------------------------------------------------------------------
// Fetch by numeric id — used by buildFeaturedList hybrid engine
// ---------------------------------------------------------------------------

export async function fetchBlogById(id: number): Promise<Blog | null> {
  const res = await strapiRequest<StrapiListResponse<Blog>>(
    `/api/blogs?filters[id][$eq]=${id}&${BLOG_BLOCKS_POPULATE}`,
    { tags: ['blogs'] }
  )
  return res.data[0] ?? null
}

export async function fetchProjectById(id: number): Promise<Project | null> {
  const res = await strapiRequest<StrapiListResponse<Project>>(
    `/api/projects?filters[id][$eq]=${id}&populate[skills_matrices][fields][0]=skillName&populate[skills_matrices][fields][1]=category&populate[skills_matrices][fields][2]=yearsOfExperience`,
    { tags: ['projects'] }
  )
  return res.data[0] ?? null
}

export async function fetchEngagementById(id: number): Promise<EngagementAndActivity | null> {
  const res = await strapiRequest<StrapiListResponse<EngagementAndActivity>>(
    `/api/engagement-and-activities?filters[id][$eq]=${id}&populate[gallery_items][fields][0]=title&populate[gallery_items][fields][1]=categoryTag&populate[gallery_items][populate][imageAsset][fields][0]=url&populate[gallery_items][populate][imageAsset][fields][1]=alternativeText`,
    { tags: ['engagements'] }
  )
  return res.data[0] ?? null
}
