# Lead Technical Consultant Platform — Build Checklist

> Use this file to track progress through each implementation prompt.
> Check off each item as it is completed and verified.

---

## Prompt 1 — Project Scaffold, Tailwind, shadcn/ui & Dark Mode

### Project Initialization
- [ ] Run `create-next-app@latest` with TypeScript, ESLint, App Router, no `src/` dir, alias `@/*`
- [ ] Confirm project created in `profile/` directory
- [ ] Confirm `npm run dev` starts without errors

### Tailwind CSS
- [ ] Install Tailwind CSS v3, PostCSS, and Autoprefixer
- [ ] Configure `tailwind.config.ts` with correct content paths
- [ ] Add custom color tokens to theme extend (`background`, `foreground`, `accent`, `muted`)
- [ ] Set `darkMode: 'class'` strategy in Tailwind config
- [ ] Define CSS custom properties in `app/globals.css` for `:root` (light) and `.dark` (dark)
- [ ] Confirm light palette values: bg `#f8fafc`, fg `#0f172a`, accent `#3b82f6`, muted `#64748b`
- [ ] Confirm dark palette values: bg `#0d1117`, fg `#e2e8f0`, accent `#38bdf8`, muted `#475569`

### shadcn/ui
- [ ] Run `npx shadcn-ui@latest init` with Default style, Slate base color, CSS variables enabled
- [ ] Install components: `button`, `card`, `badge`, `toast`, `separator`, `input`, `textarea`, `label`
- [ ] Confirm all components appear under `components/ui/`

### next-themes (Dark Mode)
- [ ] Install `next-themes`
- [ ] Create `components/providers/ThemeProvider.tsx` as a client component
- [ ] Configure ThemeProvider with `attribute="class"`, `defaultTheme="dark"`, `enableSystem={false}`
- [ ] Create `components/ui/ThemeToggle.tsx` using shadcn Button + lucide-react sun/moon icons
- [ ] Update `app/layout.tsx` to wrap children in ThemeProvider
- [ ] Add `suppressHydrationWarning` to `<html>` tag
- [ ] Import `globals.css` in `app/layout.tsx`
- [ ] Apply Inter font from `next/font/google` on `<body>`

### Design Tokens
- [ ] Create `lib/design-tokens.ts` with `fontSans`, `accentBlue`, `accentGreen`, `charcoal` exports

### Smoke Test
- [ ] `app/page.tsx` renders dark background, ThemeToggle button, and "Platform scaffold ready" text in accent color
- [ ] `npm run build` completes with no TypeScript or ESLint errors
- [ ] ThemeToggle switches `class` on `<html>` between `dark` and `light` correctly

---

## Prompt 2 — Strapi CMS: Bootstrap & Single Types

### Strapi Bootstrap
- [ ] Run `npx create-strapi-app@latest cms --quickstart` in sibling `cms/` directory
- [ ] Confirm Strapi admin panel accessible at `http://localhost:1337/admin`
- [ ] Create admin account

### Shared Components
- [ ] Create `cms/src/components/shared/social-link.json` with `platformName` (Enum) and `url` (String)
- [ ] Create `cms/src/components/shared/curated-item.json` with `contentType` (Enum) and `targetId` (Integer)

### Single Type: AboutMe
- [ ] Create schema at `cms/src/api/about-me/content-types/about-me/schema.json`
- [ ] Add `elevatorPitch` field — Long Text, required
- [ ] Add `professionalNarrative` field — Rich Text (Blocks), required
- [ ] Add `resumeFile` field — Media, single file, PDF only
- [ ] Add `socialLinks` field — Repeatable Component (`shared.social-link`)
- [ ] Confirm schema compiles and collection appears in Strapi admin

### Single Type: FeaturedCurations
- [ ] Create schema at `cms/src/api/featured-curation/content-types/featured-curation/schema.json`
- [ ] Add `manuallyCuratedList` field — Repeatable Component (`shared.curated-item`), max 5 items
- [ ] Confirm schema compiles and appears in Strapi admin

### CORS & API Configuration
- [ ] Configure CORS in `cms/config/middlewares.ts` to allow `http://localhost:3000`
- [ ] Add `FRONTEND_URL` environment variable support for production domain
- [ ] Create read-only API token named `nextjs-read` in Strapi admin (Settings → API Tokens)
- [ ] Copy token value — will be used as `STRAPI_API_TOKEN` in Next.js `.env.local`
- [ ] Enable `find` and `findOne` permissions for `AboutMe` under Public Role
- [ ] Enable `find` and `findOne` permissions for `FeaturedCuration` under Public Role

### Seed Data
- [ ] Enter seed `AboutMe` data: elevator pitch text + at least one LinkedIn social link
- [ ] Confirm `http://localhost:1337/api/about-me?populate=*` returns valid JSON
- [ ] Confirm unauthorized request behaviour is as expected (public vs. token-gated)

---

## Prompt 3 — Strapi CMS: Collection Type Schemas

### SkillsMatrix
- [ ] Create schema at `cms/src/api/skills-matrix/content-types/skills-matrix/schema.json`
- [ ] Add `skillName` — String, required, unique
- [ ] Add `category` — Enumeration (9 values: Frontend, Backend, Cloud, DevOps, Database, CMS, AI, Architecture, Management), required
- [ ] Add `yearsOfExperience` — Integer, required, min 0, max 50

### Project (Case Studies)
- [ ] Create schema at `cms/src/api/project/content-types/project/schema.json`
- [ ] Add `title` — String, required
- [ ] Add `slug` — UID bound to `title`, required
- [ ] Add `leadershipRole` — String, required
- [ ] Add `challenge` — Rich Text (Blocks), required
- [ ] Add `solution` — Rich Text (Blocks), required
- [ ] Add `skills_matrices` — Many-to-Many relation with SkillsMatrix
- [ ] Add `isFeatured` — Boolean, default false
- [ ] Confirm `draftAndPublish: true` is set

### Blog
- [ ] Create schema at `cms/src/api/blog/content-types/blog/schema.json`
- [ ] Add `title` — String, required
- [ ] Add `slug` — UID bound to `title`, required
- [ ] Add `isExternal` — Boolean, default false
- [ ] Add `externalUrl` — String, optional, URL validation
- [ ] Add `isFeatured` — Boolean, default false
- [ ] Confirm `draftAndPublish: true` is set
- [ ] Add `contentBlocks` — Dynamic Zone with all 4 components

### Dynamic Zone Components (Blog)
- [ ] Create `cms/src/components/content/hero-block.json` with `image` (Media) and `headingText` (String)
- [ ] Create `cms/src/components/content/text-block.json` with `body` (Rich Text / Blocks)
- [ ] Create `cms/src/components/content/code-block.json` with `code` (Long Text) and `language` (String)
- [ ] Create `cms/src/components/content/callout-box.json` with `variant` (Enum: Info, Warning, Success) and `content` (Text)

### Gallery
- [ ] Create schema at `cms/src/api/gallery/content-types/gallery/schema.json`
- [ ] Add `title` — String, required
- [ ] Add `imageAsset` — Media, single image, jpeg/png/webp only, required
- [ ] Add `categoryTag` — Enumeration (SpeakingEvents, Offices, TeamWork, Certifications), required

### Certification
- [ ] Create schema at `cms/src/api/certification/content-types/certification/schema.json`
- [ ] Add `title` — String, required
- [ ] Add `issuingBody` — String, required
- [ ] Add `badgeImage` — Media, single image, required
- [ ] Add `verificationUrl` — String, URL validation, required
- [ ] Add `expiryDate` — Date, optional

### EngagementAndActivity
- [ ] Create schema at `cms/src/api/engagement-and-activity/content-types/engagement-and-activity/schema.json`
- [ ] Add `title` — String, required
- [ ] Add `description` — Rich Text (Blocks), required
- [ ] Add `eventDate` — Date, required
- [ ] Add `isFeatured` — Boolean, default false
- [ ] Add `gallery_items` — Many-to-Many relation with Gallery

### Permissions (All New Collection Types)
- [ ] Enable `find` and `findOne` for SkillsMatrix (Public Role or API Token Role)
- [ ] Enable `find` and `findOne` for Project
- [ ] Enable `find` and `findOne` for Blog
- [ ] Enable `find` and `findOne` for Gallery
- [ ] Enable `find` and `findOne` for Certification
- [ ] Enable `find` and `findOne` for EngagementAndActivity

### Verification
- [ ] Strapi starts with no schema compilation errors
- [ ] All 6 collection types visible in Strapi admin content manager
- [ ] Test SkillsMatrix entry created (Next.js, Frontend, 3yr) and returned via API
- [ ] Test Blog entry with TextBlock contentBlock created and returned via API with `populate[contentBlocks]=*`

---

## Prompt 4 — TypeScript API Client & Data Layer

### Environment Variables
- [ ] Create `.env.local.example` with all 5 variable keys documented
- [ ] Create `.env.local` with real values filled in
- [ ] Create `lib/env.ts` with typed accessors for all env vars

### TypeScript Interfaces (`lib/types.ts`)
- [ ] `StrapiResponse<T>` generic wrapper
- [ ] `StrapiItem<T>` with id and attributes
- [ ] `SocialLink` interface
- [ ] `CuratedItem` interface
- [ ] `AboutMe` interface
- [ ] `FeaturedCurations` interface
- [ ] `SkillCategory` union type (all 9 values)
- [ ] `SkillsMatrix` interface
- [ ] `Project` interface (with nested skills_matrices relation)
- [ ] `ContentBlock` discriminated union (4 variants using `__component`)
- [ ] `Blog` interface (with contentBlocks as ContentBlock[])
- [ ] `GalleryCategoryTag` union type
- [ ] `Gallery` interface
- [ ] `Certification` interface
- [ ] `EngagementAndActivity` interface

### Base API Client (`lib/strapi.ts`)
- [ ] `strapiRequest<T>` function constructed
- [ ] Full URL built from `env.strapiUrl + path`
- [ ] `Authorization: Bearer` header applied
- [ ] `next: { tags }` passed for cache tagging
- [ ] Error thrown with descriptive message on non-ok response
- [ ] Response returned as parsed JSON

### Fetch Helpers (`lib/api.ts`)
- [ ] `fetchAboutMe()` — tag: `['about-me']`
- [ ] `fetchFeaturedCurations()` — tag: `['featured-curations']`
- [ ] `fetchSkillsMatrix()` — sorted, paginated, tag: `['skills-matrix']`
- [ ] `fetchProjects(featured?)` — optional filter, tag: `['projects']`
- [ ] `fetchProjectBySlug(slug)` — full populate, tag: `['projects', slug]`
- [ ] `fetchBlogs(featured?)` — tag: `['blogs']`
- [ ] `fetchBlogBySlug(slug)` — populate contentBlocks, tag: `['blogs', slug]`
- [ ] `fetchGallery(tag?)` — tag: `['gallery']`
- [ ] `fetchCertifications()` — tag: `['certifications']`
- [ ] `fetchEngagements(featured?)` — populate gallery_items, tag: `['engagements']`

### Utility: Expiry Filter (`lib/utils/filterExpiredCertifications.ts`)
- [ ] Pure function, no side effects
- [ ] Filters certs where `expiryDate` is present AND before today
- [ ] Certs with no `expiryDate` are always included

### Utility: Skills Grouper (`lib/utils/groupSkillsByCategory.ts`)
- [ ] Returns `Record<SkillCategory, StrapiItem<SkillsMatrix>[]>`
- [ ] Flat array correctly split by category key

### Tests
- [ ] `filterExpiredCertifications.test.ts` — no expiry → included
- [ ] `filterExpiredCertifications.test.ts` — future expiry → included
- [ ] `filterExpiredCertifications.test.ts` — past expiry → excluded
- [ ] `filterExpiredCertifications.test.ts` — empty array → empty array
- [ ] `groupSkillsByCategory.test.ts` — two categories correctly split
- [ ] `groupSkillsByCategory.test.ts` — empty array → empty object
- [ ] `npm test` — all tests pass

---

## Prompt 5 — Root Layout, Navigation & SPA Page Shell

### Root Layout (`app/layout.tsx`)
- [ ] ThemeProvider wraps all children
- [ ] Inter font applied via className on `<body>`
- [ ] `<Toaster />` rendered inside `<body>`
- [ ] Metadata export: title, description set

### Navbar (`components/layout/Navbar.tsx`)
- [ ] Marked `'use client'`
- [ ] Sticky top, z-index 50
- [ ] Semi-transparent background with backdrop blur
- [ ] Name/logo text in accent color on left
- [ ] Anchor links: About, Skills, Featured, Certifications, Engagements
- [ ] Contact link uses Next.js `<Link>` (navigates to `/contact`)
- [ ] ThemeToggle on far right
- [ ] Mobile hamburger menu with useState open/close
- [ ] Mobile menu shows/hides nav links correctly

### Globals CSS
- [ ] `html { scroll-behavior: smooth; }` added to `globals.css`

### Footer (`components/layout/Footer.tsx`)
- [ ] Centered copyright text
- [ ] Muted text color, small font, `py-8` padding

### SectionWrapper (`components/layout/SectionWrapper.tsx`)
- [ ] Accepts `id`, `className?`, `children` props
- [ ] Renders `<section id={id}>` with inner max-width div and consistent padding

### SPA Page Shell (`app/page.tsx`)
- [ ] React Server Component
- [ ] Imports Navbar and Footer
- [ ] All 6 section placeholders rendered with correct IDs: `hero`, `about`, `skills`, `featured`, `certifications`, `engagements`
- [ ] Each placeholder uses SectionWrapper
- [ ] Placeholder text visible for each section

### Manual Verification
- [ ] `npm run dev` — sticky navbar visible and fixed on scroll
- [ ] Each anchor link smoothly scrolls to correct section
- [ ] `/contact` link triggers navigation (404 is acceptable at this stage)
- [ ] ThemeToggle works
- [ ] `npm run build` — no TypeScript errors

---

## Prompt 6 — Hero & About Preview Sections

### Rich Text Helper (`lib/utils/richTextHelpers.ts`)
- [ ] `extractFirstParagraph(blocks)` function exported
- [ ] Walks Strapi Blocks JSON, finds first `type === 'paragraph'` node
- [ ] Concatenates children text values
- [ ] Returns empty string for empty array or no paragraph

### Hero Section (`components/sections/HeroSection.tsx`)
- [ ] React Server Component
- [ ] Props: `aboutMe: AboutMe`
- [ ] Min-height full viewport, centered column layout
- [ ] Pre-heading label "Lead Technical Consultant" in muted small caps
- [ ] `<h1>` renders `elevatorPitch` — large, bold, leading-tight
- [ ] shadcn `<Separator />` below heading
- [ ] Social links row with icons from lucide-react (fallback icon for StackOverflow)
- [ ] `getSocialIcon()` helper returns correct icon per platform
- [ ] "View My Work" CTA button (outline variant) links to `#featured`
- [ ] "Download CV" button (ghost variant) only renders when `resumeFile` is not null
- [ ] CV button links to Strapi media URL
- [ ] Decorative background gradient element (CSS only)

### About Preview Section (`components/sections/AboutPreviewSection.tsx`)
- [ ] React Server Component
- [ ] Props: `aboutMe: AboutMe`
- [ ] Two-column grid desktop, single column mobile
- [ ] Left: "About" label, "Who I Am" heading, first-paragraph excerpt, "Read Full Story →" link to `/about`
- [ ] Right: decorative shadcn Card with 3 stat items (hardcoded display values)

### Wired into Page (`app/page.tsx`)
- [ ] `fetchAboutMe()` called at top of server component
- [ ] Hero placeholder replaced with `<HeroSection aboutMe={aboutMe} />`
- [ ] About placeholder replaced with `<AboutPreviewSection aboutMe={aboutMe} />`
- [ ] try/catch wraps data fetch with fallback UI on failure

### Tests
- [ ] `richTextHelpers.test.ts` — valid blocks → correct text returned
- [ ] `richTextHelpers.test.ts` — empty array → empty string
- [ ] `richTextHelpers.test.ts` — no paragraph type → empty string
- [ ] With Strapi running: Hero displays elevator pitch from CMS
- [ ] Social links render with correct hrefs
- [ ] "Download CV" appears only when resume file is uploaded
- [ ] Removing AboutMe content → fallback UI renders without crash
- [ ] `npm run build` — no errors

---

## Prompt 7 — Skills Matrix Section

### Skill Badge (`components/ui/SkillBadge.tsx`)
- [ ] React Server Component
- [ ] Props: `skillName`, `yearsOfExperience`
- [ ] shadcn Badge (secondary variant) with skill name + years display
- [ ] `border border-transparent` base with `hover:border-accent` transition

### Skills Category Block (`components/sections/SkillsCategoryBlock.tsx`)
- [ ] React Server Component
- [ ] Props: `category`, `skills`
- [ ] Category heading in muted uppercase text
- [ ] Flex-wrap row of SkillBadge components
- [ ] Wrapped in shadcn Card

### Skills Matrix Section (`components/sections/SkillsMatrixSection.tsx`)
- [ ] React Server Component
- [ ] Props: `skills`
- [ ] Uses `groupSkillsByCategory` utility
- [ ] "Technical Expertise" heading, "Skills" label in accent
- [ ] Responsive grid: 1 col → 2 col → 3 col
- [ ] Only renders categories with at least 1 skill
- [ ] Categories sorted alphabetically

### Wired into Page (`app/page.tsx`)
- [ ] `fetchSkillsMatrix()` called
- [ ] Skills placeholder replaced with `<SkillsMatrixSection skills={skills} />`
- [ ] Fallback on empty or failed fetch

### Manual Verification
- [ ] At least 6 skills across 3+ categories in Strapi
- [ ] Skills render grouped by category
- [ ] Badge shows name and years
- [ ] Empty categories not rendered
- [ ] `npm run build` — no errors

---

## Prompt 8 — Featured Content Hybrid Engine & Section

### Types Update (`lib/types.ts`)
- [ ] `FeaturedContentItem` discriminated union added with `kind` + `data` for blog, project, engagement

### Fetch By ID Helpers (`lib/api.ts`)
- [ ] `fetchBlogById(id)` added
- [ ] `fetchProjectById(id)` added
- [ ] `fetchEngagementById(id)` added

### Hybrid Engine (`lib/utils/buildFeaturedList.ts`)
- [ ] Calls `fetchFeaturedCurations()` first
- [ ] If curated list has items: fetches each by ID, returns as FeaturedContentItem[] (max 5)
- [ ] If curated list is empty: calls all three featured fetches in parallel via `Promise.all`
- [ ] Merges and sorts by publishedAt/eventDate descending
- [ ] Slices to max 5 items

### Featured Card (`components/ui/FeaturedCard.tsx`)
- [ ] React Server Component
- [ ] Props: `item: FeaturedContentItem`
- [ ] Kind badge (Blog / Project / Engagement) with distinct color variants
- [ ] Title rendered polymorphically
- [ ] Descriptor rendered per kind (external flag / leadership role / eventDate)
- [ ] CTA link logic: external blog → `<a target="_blank">`, internal blog → `<Link href="/blog/slug">`, project → `<Link href="/case-studies/slug">`, engagement → non-clickable
- [ ] Hover effect: `hover:shadow-lg hover:border-accent/50 transition-all`

### Featured Section (`components/sections/FeaturedSection.tsx`)
- [ ] React Server Component
- [ ] Props: `items: FeaturedContentItem[]`
- [ ] "Featured" label, "Selected Work & Insights" heading
- [ ] Responsive 3-column grid
- [ ] Empty state message when array is empty

### Wired into Page (`app/page.tsx`)
- [ ] `buildFeaturedList()` called
- [ ] Featured placeholder replaced with `<FeaturedSection items={featuredItems} />`
- [ ] try/catch with fallback

### Tests
- [ ] `buildFeaturedList.test.ts` — empty curation → fallback path triggered
- [ ] `buildFeaturedList.test.ts` — 2 curated items → explicit fetch path with correct IDs
- [ ] `buildFeaturedList.test.ts` — merged result sorted by date, capped at 5
- [ ] In Strapi: 3 featured blogs + 2 featured projects → only 5 appear on page
- [ ] Manual curation override → specific items appear instead
- [ ] `npm run build` — no errors

---

## Prompt 9 — Certifications & Engagements Sections

### Certification Card (`components/ui/CertificationCard.tsx`)
- [ ] React Server Component
- [ ] Badge image via Next.js `<Image>` (64×64, objectFit contain)
- [ ] Relative Strapi URL prefixed with `env.strapiUrl` if needed
- [ ] Title bold, issuing body muted
- [ ] "Verify Credential →" anchor (target `_blank`) to `verificationUrl`
- [ ] Expiry date shown if present, formatted as "Jan 2026" via `Intl.DateTimeFormat`

### Certifications Section (`components/sections/CertificationsSection.tsx`)
- [ ] React Server Component
- [ ] Applies `filterExpiredCertifications` to incoming array before rendering
- [ ] "Credentials" label, "Active Certifications" heading
- [ ] Responsive grid: 1 col → 2 col → 4 col
- [ ] Empty state: "No active certifications on record."

### Engagement Card (`components/ui/EngagementCard.tsx`)
- [ ] React Server Component
- [ ] Formatted `eventDate` in accent color as header label
- [ ] Title bold
- [ ] First paragraph of description via `extractFirstParagraph`
- [ ] Photo count badge shown if `gallery_items.data` has entries

### Engagements Section (`components/sections/EngagementsSection.tsx`)
- [ ] React Server Component
- [ ] "Activities" label, "Speaking & Engagements" heading
- [ ] Vertical stacked layout with `space-y-6`
- [ ] Sorted by `eventDate` descending
- [ ] Empty state: "No engagements recorded yet."

### Parallel Fetch Refactor (`app/page.tsx`)
- [ ] All 5 data fetches wrapped in a single `Promise.all`
- [ ] `fetchCertifications()` added
- [ ] `fetchEngagements()` added
- [ ] Certifications placeholder replaced with `<CertificationsSection />`
- [ ] Engagements placeholder replaced with `<EngagementsSection />`

### Manual Verification
- [ ] 3 Certifications in Strapi: 1 past expiry, 1 future expiry, 1 no expiry → only 2 render
- [ ] 2 Engagements render in reverse chronological order
- [ ] Engagement with gallery items shows photo count badge
- [ ] `npm run build` — no errors

---

## Prompt 10 — About Page & Contact Page

### Tailwind Typography Plugin
- [ ] Install `@tailwindcss/typography`
- [ ] Add to `tailwind.config.ts` plugins array
- [ ] Confirm `prose` classes are available

### Rich Text Renderer (`components/ui/RichTextRenderer.tsx`)
- [ ] React Server Component
- [ ] Handles `paragraph` → `<p>`
- [ ] Handles `heading` (levels 1–3) → `<h1>`, `<h2>`, `<h3>`
- [ ] Handles `list` (ordered/unordered) → `<ol>` / `<ul>` with `<li>`
- [ ] Handles `quote` → `<blockquote>` with left accent border
- [ ] Handles `code` → `<pre><code>` with monospace dark background
- [ ] Handles inline: `bold` → `<strong>`, `italic` → `<em>`, `underline` → `<u>`
- [ ] Wrapped in `<div className="prose prose-invert max-w-none">`

### Social Links Component (`components/ui/SocialLinks.tsx`)
- [ ] Extracted from HeroSection into reusable server component
- [ ] Props: `links: SocialLink[]`
- [ ] HeroSection updated to use this component

### About Page (`app/about/page.tsx`)
- [ ] React Server Component
- [ ] `fetchAboutMe()` called
- [ ] `generateMetadata` uses elevatorPitch as description
- [ ] Navbar at top
- [ ] Back link: "← Back to Home" to `/`
- [ ] "About Me" heading, elevator pitch as subtitle
- [ ] Full `professionalNarrative` rendered with `<RichTextRenderer>`
- [ ] "Download Full CV (PDF)" button only shown when `resumeFile` is not null
- [ ] CV button uses `download` attribute on anchor
- [ ] Social links row rendered
- [ ] Footer at bottom

### Contact Server Action (`lib/actions/sendContactEmail.ts`)
- [ ] Marked `'use server'`
- [ ] Accepts `prevState` and `formData`
- [ ] Extracts `name`, `email`, `message`
- [ ] Validates: all fields non-empty, email matches regex
- [ ] Returns `{ success: false, error: '...' }` on validation failure
- [ ] Sends email via Resend SDK with correct from/to/subject/body
- [ ] Catches HTTP 429 → returns LinkedIn fallback message
- [ ] Catches other errors → returns generic retry message
- [ ] Returns `{ success: true, error: null }` on success

### Contact Form (`components/sections/ContactForm.tsx`)
- [ ] Marked `'use client'`
- [ ] Uses `useActionState` / `useFormState` with server action
- [ ] Name, Email, Message fields with Labels
- [ ] Submit button disables + shows "Sending..." during submission
- [ ] Success toast shown on success
- [ ] Error toast shown on failure

### Contact Page (`app/contact/page.tsx`)
- [ ] React Server Component shell
- [ ] Metadata: `{ title: 'Contact | Lead Technical Consultant' }`
- [ ] Navbar, centered column, heading, sub-text, ContactForm, Footer

### Tests
- [ ] `sendContactEmail.test.ts` — empty fields → validation error
- [ ] `sendContactEmail.test.ts` — invalid email → validation error
- [ ] `sendContactEmail.test.ts` — Resend 429 → LinkedIn fallback message
- [ ] Rich text renderer renders paragraphs, headings, and lists correctly
- [ ] `npm run build` — no errors

---

## Prompt 11 — Blog Dynamic Route & Dynamic Zone Renderer

### HeroBlock (`components/blocks/HeroBlock.tsx`)
- [ ] React Server Component
- [ ] Renders full-width Next.js `<Image>` with `priority`
- [ ] Strapi relative URLs prefixed with `STRAPI_API_URL`
- [ ] `<h1>` heading below image

### TextBlock (`components/blocks/TextBlock.tsx`)
- [ ] React Server Component
- [ ] Renders `<RichTextRenderer blocks={block.body} />`

### CodeBlock (`components/blocks/CodeBlock.tsx`)
- [ ] React Server Component
- [ ] `<pre><code>` with dark background, overflow-x-auto
- [ ] Language label badge in top-right corner
- [ ] Raw code as `font-mono text-sm whitespace-pre`
- [ ] CopyButton rendered inside CodeBlock

### CopyButton (`components/blocks/CopyButton.tsx`)
- [ ] Marked `'use client'`
- [ ] Uses `navigator.clipboard.writeText`
- [ ] Label toggles from "Copy" to "Copied!" for 2 seconds

### CalloutBox (`components/blocks/CalloutBox.tsx`)
- [ ] React Server Component
- [ ] Info variant: blue border, blue-tinted background, ℹ️ icon
- [ ] Warning variant: yellow border, yellow-tinted background, ⚠️ icon
- [ ] Success variant: green border, green-tinted background, ✅ icon
- [ ] Displays `block.content` as text

### Block Error Boundary (`components/blocks/BlockErrorBoundary.tsx`)
- [ ] Marked `'use client'`
- [ ] Class component implementing React ErrorBoundary pattern
- [ ] On error: renders dashed border fallback div with "Content block unavailable."

### Dynamic Zone Renderer (`components/blocks/DynamicZoneRenderer.tsx`)
- [ ] React Server Component
- [ ] Maps over blocks, renders correct component per `__component` value
- [ ] Each block wrapped in `<BlockErrorBoundary>`
- [ ] Unknown `__component` values silently skipped

### Blog Slug Page (`app/blog/[slug]/page.tsx`)
- [ ] `generateStaticParams` fetches all blogs and returns slugs
- [ ] `generateMetadata` returns title + description per blog
- [ ] Fetches blog by slug
- [ ] Returns `notFound()` if blog not found
- [ ] External blog with `externalUrl` → `redirect(externalUrl)` at server level
- [ ] Internal blog: Navbar, `<h1>` title, formatted date, `<DynamicZoneRenderer>`, Footer
- [ ] Content container: `max-w-3xl mx-auto px-4 py-12`

### Manual Verification
- [ ] Internal blog with all 4 block types renders correctly
- [ ] External blog redirects to external URL
- [ ] `/blog/non-existent-slug` shows 404 page
- [ ] Temporarily throw error in TextBlock → rest of page still renders (BlockErrorBoundary)
- [ ] `npm run build` — static params generate correctly, no errors

---

## Prompt 12 — Case Study Dynamic Route

### Skills Reference List (`components/ui/SkillsReferenceList.tsx`)
- [ ] React Server Component
- [ ] Props: `skills: StrapiItem<SkillsMatrix>[]`
- [ ] Horizontal flex-wrap list of outline Badge components
- [ ] "Technologies Used" label above in muted uppercase

### Case Study Layout (`components/sections/CaseStudyLayout.tsx`)
- [ ] React Server Component
- [ ] Back link to `/#featured`
- [ ] Leadership role Badge
- [ ] `<h1>` title, formatted publishedAt date
- [ ] 5-column grid: 3 left (content) + 2 right (sidebar)
- [ ] Left: "The Challenge" heading + RichTextRenderer, "The Solution" heading + RichTextRenderer
- [ ] Right: sticky sidebar at `top-24` with SkillsReferenceList, Separator, leadership detail card

### Case Study Slug Page (`app/case-studies/[slug]/page.tsx`)
- [ ] `generateStaticParams` fetches all projects and returns slugs
- [ ] `generateMetadata` returns `{project.title} | Case Study` title
- [ ] Fetches project by slug
- [ ] Returns `notFound()` if project not found
- [ ] Renders Navbar, CaseStudyLayout, Footer

### Populate Fix (`lib/api.ts`)
- [ ] `fetchProjectBySlug` confirmed to include populate params for `skills_matrices` fields
- [ ] Nested skill data (skillName, category, yearsOfExperience) arrives correctly in response

### Manual Verification
- [ ] 2 projects with rich text content and linked skills in Strapi
- [ ] Challenge + Solution sections render with prose styling
- [ ] Linked skills display in sidebar
- [ ] Back link works correctly
- [ ] `/case-studies/non-existent` shows 404
- [ ] `npm run build` — `generateStaticParams` generates correct paths, no errors

---

## Prompt 13 — On-Demand Revalidation Webhook

### Route Handler (`app/api/revalidate/route.ts`)
- [ ] `MODEL_TO_TAG_MAP` covers all 8 model names
- [ ] Auth check: validates `Authorization: Bearer <TOKEN>` header
- [ ] Returns 401 for missing or incorrect token
- [ ] Parses request body JSON, returns 400 on malformed JSON
- [ ] Returns 400 for missing or unknown model
- [ ] Calls `revalidateTag` for each tag in the model's tag array
- [ ] Returns `{ revalidated: true, tags, now }` on success
- [ ] Optional: also calls `revalidateTag(slug)` if slug provided in body

### Environment Variable
- [ ] `REVALIDATION_SECRET_TOKEN` confirmed in `.env.local`

### Strapi Webhook Configuration (Steps Completed)
- [ ] Webhook created in Strapi admin: Settings → Webhooks → Add new
- [ ] URL set to Next.js revalidate endpoint
- [ ] All `Entry` events checked (Create, Update, Delete, Publish, Unpublish)
- [ ] `Authorization: Bearer YOUR_TOKEN` header added
- [ ] Webhook saved and test trigger confirmed working

### Tests (`app/api/revalidate/__tests__/route.test.ts`)
- [ ] POST with no auth header → 401
- [ ] POST with wrong token → 401
- [ ] POST with correct token, no model → 400
- [ ] POST with correct token, `model: 'blog'` → 200, `revalidateTag` called with 'blogs'
- [ ] POST with unknown model → 400
- [ ] `revalidateTag` mocked from `next/cache`

### Manual curl Test
- [ ] Valid POST returns `{"revalidated": true}`
- [ ] `npm run build` — no errors

---

## Prompt 14 — Google Analytics 4 & Custom Event Tracking

### GA4 Base Setup
- [ ] `@next/third-parties` confirmed installed
- [ ] `<GoogleAnalytics gaId={...} />` added to `app/layout.tsx`
- [ ] GA script only loads in `NODE_ENV === 'production'`
- [ ] `NEXT_PUBLIC_GA_MEASUREMENT_ID` in `.env.local`

### Analytics Utility (`lib/utils/analytics.ts`)
- [ ] `trackExternalBlogClick(blogTitle, externalUrl)` exported
- [ ] `trackCertificationVerificationClick(certTitle, verificationUrl)` exported
- [ ] Both functions guard with `typeof window !== 'undefined' && window.gtag`
- [ ] `window.gtag` TypeScript declaration added

### External Blog Click Tracking
- [ ] `FeaturedCard.tsx` converted to `'use client'`
- [ ] `onClick` handler calls `trackExternalBlogClick` on external blog anchors

### Certification Verification Click Tracking
- [ ] `CertificationCard.tsx` converted to `'use client'`
- [ ] `onClick` handler calls `trackCertificationVerificationClick` on verify anchor

### Verification
- [ ] Production guard temporarily removed, console.log added → events fire in dev browser console
- [ ] GA script tag absent in `npm run dev` page source
- [ ] GA script tag present after `npm run build && npm run start`
- [ ] `npm run build` — no errors

---

## Prompt 15 — Error Handling, Fallbacks & Production Hardening

### Global Error Page (`app/error.tsx`)
- [ ] Marked `'use client'`
- [ ] Props: `error`, `reset` destructured
- [ ] "Something went wrong" heading
- [ ] "Try Again" Button calls `reset()` on click
- [ ] "Return Home" Link to `/`
- [ ] Error message NOT exposed to user in production

### Not Found Page (`app/not-found.tsx`)
- [ ] Large "404" display text in muted color
- [ ] "Page Not Found" heading
- [ ] "Return Home" shadcn Button as Link
- [ ] Includes Navbar and Footer

### Section Unavailable Component (`components/ui/SectionUnavailable.tsx`)
- [ ] Props: `sectionName: string`
- [ ] Renders warning message with section name

### CMS Down Fallback (`app/page.tsx`)
- [ ] `Promise.all` replaced with `Promise.allSettled`
- [ ] Each result checked for `status === 'fulfilled'` before use
- [ ] Null passed to section components on failed fetches

### Nullable Props Updates
- [ ] `HeroSection` accepts `aboutMe: AboutMe | null`
- [ ] `AboutPreviewSection` accepts `aboutMe: AboutMe | null`
- [ ] `SkillsMatrixSection` accepts `skills: StrapiItem<SkillsMatrix>[] | null`
- [ ] `FeaturedSection` accepts `items: FeaturedContentItem[] | null`
- [ ] `CertificationsSection` accepts `certifications: StrapiItem<Certification>[] | null`
- [ ] `EngagementsSection` accepts `engagements: StrapiItem<EngagementAndActivity>[] | null`
- [ ] Each component renders `<SectionUnavailable>` when prop is null

### Server-Only Guard (`lib/env.ts`)
- [ ] Runtime check throws error if `typeof window !== 'undefined'`

### Image Domain Configuration (`next.config.ts`)
- [ ] `http://localhost:1337/uploads/**` added to `remotePatterns`
- [ ] Production Strapi domain added to `remotePatterns`

### Manual Verification
- [ ] Stop Strapi → home page loads with per-section unavailable messages
- [ ] Navigate to non-existent route → custom 404 page appears
- [ ] Temporarily throw in a server component → custom error page appears
- [ ] `npm run build` — no warnings about secret env vars in client bundle
- [ ] All existing tests still pass after nullable prop changes

---

## Prompt 16 — Final Testing, Sitemap, Robots & Lighthouse

### New Component Tests
- [ ] `components/ui/__tests__/SkillBadge.test.tsx` — renders skill name and years
- [ ] `components/ui/__tests__/SkillBadge.test.tsx` — snapshot test passes
- [ ] `components/sections/__tests__/CertificationsSection.test.tsx` — mixed expired/valid certs → only valid rendered
- [ ] `components/sections/__tests__/CertificationsSection.test.tsx` — empty filtered list → empty state message shown

### Full Test Suite Audit
- [ ] `filterExpiredCertifications` — all 4 cases passing
- [ ] `groupSkillsByCategory` — all 2 cases passing
- [ ] `richTextHelpers` (extractFirstParagraph) — all 3 cases passing
- [ ] `buildFeaturedList` — curated + fallback paths passing
- [ ] `sendContactEmail` — validation + 429 cases passing
- [ ] `/api/revalidate` route — all 5 cases passing
- [ ] `npm test` — entire suite passes with no failures

### Sitemap (`app/sitemap.ts`)
- [ ] Static routes included: `/`, `/about`, `/contact`
- [ ] Dynamic blog routes included (filtered to internal only)
- [ ] Dynamic case study routes included
- [ ] `lastModified` set from `publishedAt` for dynamic routes

### Robots (`app/robots.ts`)
- [ ] `userAgent: '*'`, `allow: '/'`, `disallow: '/api/'`
- [ ] Sitemap URL referenced correctly

### OpenGraph Metadata (`app/layout.tsx`)
- [ ] `title` uses `{ default, template }` pattern
- [ ] `openGraph` configured: type, locale, url, siteName
- [ ] `twitter: { card: 'summary_large_image' }` added

### Package.json Scripts
- [ ] `"type-check": "tsc --noEmit"` added to scripts
- [ ] `npm run type-check` passes with no errors

### Final Build Checks
- [ ] `npm run lint` — no ESLint warnings or errors
- [ ] `npm run type-check` — no TypeScript errors
- [ ] `npm test` — all tests pass
- [ ] `npm run build` — no errors, no secret leakage warnings

### Lighthouse Audits (run `npm run build && npm run start` first)
- [ ] Home page (`/`) — Performance ≥ 95
- [ ] Home page (`/`) — Accessibility ≥ 95
- [ ] Home page (`/`) — SEO ≥ 95
- [ ] Home page (`/`) — Best Practices ≥ 95
- [ ] About page (`/about`) — Performance ≥ 95
- [ ] About page (`/about`) — Accessibility ≥ 95
- [ ] About page (`/about`) — SEO ≥ 95
- [ ] About page (`/about`) — Best Practices ≥ 95
- [ ] Blog slug page — Performance ≥ 95
- [ ] Blog slug page — Accessibility ≥ 95
- [ ] Blog slug page — SEO ≥ 95
- [ ] Blog slug page — Best Practices ≥ 95
- [ ] Case study page — Performance ≥ 95
- [ ] Case study page — Accessibility ≥ 95
- [ ] Case study page — SEO ≥ 95
- [ ] Case study page — Best Practices ≥ 95

### Lighthouse Common Fix Checklist
- [ ] All images use `next/image` (not raw `<img>` tags)
- [ ] Above-the-fold images have `priority` prop set
- [ ] All interactive elements without visible text have `aria-label`
- [ ] Color contrast ratios meet WCAG AA on both light and dark themes
- [ ] Every page has a unique `<title>` tag
- [ ] Every page has a `<meta name="description">` tag
- [ ] Sitemap accessible at `/sitemap.xml`
- [ ] No render-blocking resources introduced

---

## Pre-Deployment Checklist

### Environment
- [ ] All `.env.local` values set for production environment (Vercel)
- [ ] `STRAPI_API_URL` points to production Strapi instance
- [ ] `STRAPI_API_TOKEN` is the production read-only token
- [ ] `REVALIDATION_SECRET_TOKEN` is a strong random string (use `openssl rand -base64 32`)
- [ ] `RESEND_API_KEY` is the production Resend key
- [ ] `NEXT_PUBLIC_GA_MEASUREMENT_ID` is the correct GA4 property ID

### Strapi Production
- [ ] Strapi deployed to a hosting platform (e.g., Railway, Render, or VPS)
- [ ] Production database configured (PostgreSQL recommended over SQLite)
- [ ] `FRONTEND_URL` set in Strapi environment to production Vercel domain
- [ ] Webhook URL updated to production Next.js revalidate endpoint
- [ ] All content migrated from dev Strapi to production Strapi
- [ ] API token regenerated for production

### Vercel Deployment
- [ ] Repository connected to Vercel
- [ ] All environment variables added to Vercel project settings
- [ ] Framework preset set to Next.js
- [ ] Build command: `npm run build`
- [ ] Production deployment triggered and successful
- [ ] Custom domain configured (if applicable)
- [ ] `https://yourdomain.com/sitemap.xml` accessible
- [ ] `https://yourdomain.com/robots.txt` accessible
- [ ] `https://yourdomain.com/api/revalidate` reachable by Strapi webhook (test with curl)

### Post-Deployment Smoke Test
- [ ] Home page loads and all sections display content from Strapi
- [ ] About page renders full professional narrative
- [ ] Contact form submits successfully (check email inbox)
- [ ] An internal blog post renders all block types
- [ ] An external blog post redirects correctly
- [ ] A case study renders challenge, solution, and linked skills
- [ ] Expired certifications do not appear
- [ ] ThemeToggle works in production
- [ ] GA4 events firing (check GA4 DebugView in Google Analytics)
- [ ] Revalidation: publish/update content in Strapi → change appears on site within seconds without a full redeploy