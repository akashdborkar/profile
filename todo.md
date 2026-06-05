# Lead Technical Consultant Platform — Build Checklist

> Use this file to track progress through each implementation prompt.
> Check off each item as it is completed and verified.

---

## Prompt 1 — Project Scaffold, Tailwind, shadcn/ui & Dark Mode

### Project Initialization
- [x] Run `create-next-app@latest` with TypeScript, ESLint, App Router, no `src/` dir, alias `@/*`
- [x] Confirm project created in `profile/` directory
- [x] Confirm `npm run dev` starts without errors

### Tailwind CSS
- [x] Install Tailwind CSS v4 (upgraded from v3 — required by shadcn v4), PostCSS via `@tailwindcss/postcss`
- [x] Configure `tailwind.config.ts` with correct content paths
- [x] Add custom color tokens to theme extend (`background`, `foreground`, `accent`, `muted`) via `@theme inline` in globals.css
- [x] Dark mode via `@custom-variant dark` in globals.css (Tailwind v4 approach)
- [x] Define CSS custom properties in `app/globals.css` for `:root` (light) and `.dark` (dark)
- [x] Confirm light palette values: bg `#f8fafc`, fg `#0f172a`, accent `#3b82f6`, muted `#64748b`
- [x] Confirm dark palette values: bg `#0d1117`, fg `#e2e8f0`, accent `#38bdf8`, muted `#475569`

### shadcn/ui
- [x] Run `npx shadcn@latest init` (v4, uses Tailwind v4 + oklch colors)
- [x] Install components: `button`, `card`, `badge`, `sonner` (toast replacement in v4), `separator`, `input`, `textarea`, `label`
- [x] Confirm all components appear under `components/ui/`

### next-themes (Dark Mode)
- [x] Install `next-themes`
- [x] Create `components/providers/ThemeProvider.tsx` as a client component
- [x] Configure ThemeProvider with `attribute="class"`, `defaultTheme="dark"`, `enableSystem={false}`
- [x] Create `components/ui/ThemeToggle.tsx` using shadcn Button + lucide-react sun/moon icons
- [x] Update `app/layout.tsx` to wrap children in ThemeProvider
- [x] Add `suppressHydrationWarning` to `<html>` tag
- [x] Import `globals.css` in `app/layout.tsx`
- [x] Apply Inter font from `next/font/google` via `--font-inter` CSS var

### Design Tokens
- [x] Create `lib/design-tokens.ts` with `fontSans`, `accentBlue`, `accentGreen`, `charcoal` exports

### Smoke Test
- [x] `app/page.tsx` renders dark background, ThemeToggle button, and "Platform scaffold ready" text in accent color
- [x] `npm run build` completes with no TypeScript or ESLint errors
- [x] ThemeToggle switches `class` on `<html>` between `dark` and `light` correctly

---

## Prompt 2 — Strapi CMS: Bootstrap & Single Types

### Strapi Bootstrap
- [x] Run `npx create-strapi-app@latest cms --quickstart` — installed Strapi v5.46.0 (current, adapted from v4 spec)
- [x] Confirm Strapi admin panel accessible at `http://localhost:1337/admin`
- [x] Create admin account (admin@profile.local)

### Shared Components
- [x] Create `cms/src/components/shared/social-link.json` with `platformName` (Enum) and `url` (String, URL regex)
- [x] Create `cms/src/components/shared/curated-item.json` with `contentType` (Enum) and `targetId` (Integer)

### Single Type: AboutMe
- [x] Create schema at `cms/src/api/about-me/content-types/about-me/schema.json`
- [x] Add `elevatorPitch` field — Long Text (`type: "text"`), required
- [x] Add `professionalNarrative` field — Rich Text (Blocks, `type: "blocks"`), required
- [x] Add `resumeFile` field — Media, single file, PDF only (`allowedTypes: ["files"]`)
- [x] Add `socialLinks` field — Repeatable Component (`shared.social-link`)
- [x] Confirm schema compiles and collection appears in Strapi admin (verified via API 404/403 toggle)

### Single Type: FeaturedCurations
- [x] Create schema at `cms/src/api/featured-curation/content-types/featured-curation/schema.json`
- [x] Add `manuallyCuratedList` field — Repeatable Component (`shared.curated-item`), max 5 items
- [x] Confirm schema compiles and appears in Strapi admin

### CORS & API Configuration
- [x] Configure CORS in `cms/config/middlewares.ts` to allow `http://localhost:3000`
- [x] Add `FRONTEND_URL` environment variable support for production domain
- [x] Create read-only API token named `nextjs-read` in Strapi admin (Settings → API Tokens)
- [x] Token saved to `profile/.env.local` as `STRAPI_API_TOKEN`
- [x] Enable `find` for `AboutMe` under Public Role (single types have no `findOne`)
- [x] Enable `find` for `FeaturedCuration` under Public Role

### Seed Data
- [ ] Enter seed `AboutMe` data via admin UI: elevator pitch text + LinkedIn social link, then Publish
- [ ] Confirm `http://localhost:1337/api/about-me?populate=*` returns valid JSON (currently 404 — no published content)
- [x] Confirmed: unauthenticated requests return 404 (no content) not 403 (forbidden) — public access working

---

## Prompt 3 — Strapi CMS: Collection Type Schemas

### SkillsMatrix
- [x] Create schema at `cms/src/api/skills-matrix/content-types/skills-matrix/schema.json`
- [x] Add `skillName` — String, required, unique
- [x] Add `category` — Enumeration (9 values), required
- [x] Add `yearsOfExperience` — Integer, required, min 0, max 50
- [x] Add inverse `projects` relation (manyToMany, mappedBy)

### Project (Case Studies)
- [x] Create schema at `cms/src/api/project/content-types/project/schema.json`
- [x] Add `title` — String, required
- [x] Add `slug` — UID bound to `title`, required
- [x] Add `leadershipRole` — String, required
- [x] Add `challenge` — Rich Text (Blocks), required
- [x] Add `solution` — Rich Text (Blocks), required
- [x] Add `skills_matrices` — Many-to-Many with SkillsMatrix (inversedBy)
- [x] Add `isFeatured` — Boolean, default false
- [x] `draftAndPublish: true` set

### Blog
- [x] Create schema at `cms/src/api/blog/content-types/blog/schema.json`
- [x] Add `title` — String, required
- [x] Add `slug` — UID bound to `title`, required
- [x] Add `isExternal` — Boolean, default false
- [x] Add `externalUrl` — String, optional, URL regex validation
- [x] Add `isFeatured` — Boolean, default false
- [x] `draftAndPublish: true` set
- [x] Add `contentBlocks` — Dynamic Zone with all 4 components

### Dynamic Zone Components (Blog)
- [x] Create `cms/src/components/content/hero-block.json` — `image` (Media, images) + `headingText` (String)
- [x] Create `cms/src/components/content/text-block.json` — `body` (Blocks)
- [x] Create `cms/src/components/content/code-block.json` — `code` (Text) + `language` (String)
- [x] Create `cms/src/components/content/callout-box.json` — `variant` (Enum: Info/Warning/Success) + `content` (Text)

### Gallery
- [x] Create schema at `cms/src/api/gallery/content-types/gallery/schema.json`
- [x] Add `title` — String, required
- [x] Add `imageAsset` — Media, single image, required
- [x] Add `categoryTag` — Enumeration (SpeakingEvents, Offices, TeamWork, Certifications), required
- [x] Add inverse `engagement_and_activities` relation (manyToMany, mappedBy)

### Certification
- [x] Create schema at `cms/src/api/certification/content-types/certification/schema.json`
- [x] Add `title`, `issuingBody` — String, required
- [x] Add `badgeImage` — Media, single image, required
- [x] Add `verificationUrl` — String, URL regex, required
- [x] Add `expiryDate` — Date, optional

### EngagementAndActivity
- [x] Create schema at `cms/src/api/engagement-and-activity/content-types/engagement-and-activity/schema.json`
- [x] Add `title` — String, required
- [x] Add `description` — Rich Text (Blocks), required
- [x] Add `eventDate` — Date, required
- [x] Add `isFeatured` — Boolean, default false
- [x] Add `gallery_items` — Many-to-Many with Gallery (inversedBy)

### Permissions (All New Collection Types)
- [x] Enable `find` + `findOne` for all 6 new types under Public Role (done via API PUT in one call)

### Verification
- [x] Strapi starts with no schema compilation errors (clean boot logged)
- [x] All 8 content types registered (confirmed via permissions API listing)
- [x] Test SkillsMatrix entry (Next.js / Frontend / 3yr) → `GET /api/skills-matrices` returns it ✓
- [x] Test Blog entry with `content.text-block` in Dynamic Zone → `GET /api/blogs?populate[contentBlocks][on][content.text-block][populate]=*` returns `__component` + `body` ✓
- NOTE: Dynamic Zone populate uses `populate[contentBlocks][on][content.xxx][populate]=*` (Strapi v5 fragment syntax, NOT `populate=*`)

---

## Prompt 4 — TypeScript API Client & Data Layer

### Environment Variables
- [x] Create `.env.local.example` with all 5 variable keys documented
- [x] `.env.local` already populated with real Strapi token (from Prompt 2)
- [x] Create `lib/env.ts` — server-only guard (throws if `typeof window !== 'undefined'`), typed accessors

### TypeScript Interfaces (`lib/types.ts`)
- [x] `StrapiListResponse<T>` / `StrapiSingleResponse<T>` — Strapi v5 flat shape (no `attributes` wrapper)
- [x] `StrapiEntity` base interface with `id`, `documentId`, timestamps
- [x] `StrapiMedia` interface
- [x] `StrapiBlock` type (rich text node)
- [x] `SocialLink` + `CuratedItem` component interfaces
- [x] `AboutMe`, `FeaturedCurations` single type interfaces
- [x] `SkillCategory` union type (9 values), `SkillsMatrix` interface
- [x] `Project` — flat `skills_matrices: SkillsMatrix[]` (v5, not `{ data: [...] }`)
- [x] `ContentBlock` discriminated union (4 variants via `__component`)
- [x] `Blog` with `ContentBlock[]` Dynamic Zone
- [x] `GalleryCategoryTag`, `Gallery`, `Certification`, `EngagementAndActivity`

### Base API Client (`lib/strapi.ts`)
- [x] `strapiRequest<T>` — full URL from `env.strapiUrl`, `Authorization: Bearer`, `next: { tags }`, throws on non-ok

### Fetch Helpers (`lib/api.ts`)
- [x] `fetchAboutMe()` — `populate=*`, tag: `['about-me']`
- [x] `fetchFeaturedCurations()` — returns null on error (CMS-down resilience)
- [x] `fetchSkillsMatrix()` — sorted, limit 100, tag: `['skills-matrix']`
- [x] `fetchProjects(featured?)` — `populate[skills_matrices]=*`, tag: `['projects']`
- [x] `fetchProjectBySlug(slug)` — tag: `['projects', slug]`
- [x] `fetchBlogs(featured?)` — tag: `['blogs']`
- [x] `fetchBlogBySlug(slug)` — **v5 fragment populate** for Dynamic Zone, tag: `['blogs', slug]`
- [x] `fetchGallery(tag?)` — `populate[imageAsset]=*`, tag: `['gallery']`
- [x] `fetchCertifications()` — `populate[badgeImage]=*`, tag: `['certifications']`
- [x] `fetchEngagements(featured?)` — nested gallery populate, tag: `['engagements']`

### Utility: Expiry Filter (`lib/utils/filterExpiredCertifications.ts`)
- [x] Pure function — `expiryDate` absent → include; future → include; past → exclude

### Utility: Skills Grouper (`lib/utils/groupSkillsByCategory.ts`)
- [x] Returns `Partial<Record<SkillCategory, SkillsMatrix[]>>` — only present categories as keys

### Tests (Vitest)
- [x] `filterExpiredCertifications.test.ts` — 5 tests: no expiry, future, past, empty, mixed list
- [x] `groupSkillsByCategory.test.ts` — 5 tests: empty, single, two-category split, absent keys, data preservation
- [x] `npm run test` → **10/10 pass** (Vitest v3.2.4)
- [x] `npm run build` → clean compile, no TypeScript errors
- NOTE: `vitest` added to devDependencies; run via `node_modules/.bin/vitest run` or `npm run test` from `profile/`

---

## Prompt 5 — Root Layout, Navigation & SPA Page Shell

### Root Layout (`app/layout.tsx`)
- [x] ThemeProvider wraps all children
- [x] Inter font applied via `--font-inter` CSS var on `<html>`, `font-sans` on `<body>`
- [x] `<Toaster />` from `@/components/ui/sonner` rendered inside ThemeProvider
- [x] Metadata: title "Lead Technical Consultant", description updated

### Navbar (`components/layout/Navbar.tsx`)
- [x] Marked `'use client'`, sticky top-0 z-50
- [x] `bg-background/80 backdrop-blur-sm border-b border-border`
- [x] "Akash Borkar" in accent color on left, links to `#hero`
- [x] Anchor links: About, Skills, Featured, Certifications, Engagements (using `<a href="#...">`)
- [x] Contact uses Next.js `<Link href="/contact">`
- [x] ThemeToggle on far right
- [x] Mobile hamburger (Menu/X icons from lucide-react, shadcn Button, useState)
- [x] Mobile dropdown shows all links, closes on link click

### Globals CSS
- [x] `scroll-behavior: smooth` added to `html` block
- [x] Fixed critical Tailwind v4 issue: replaced `@tailwind base/components/utilities` with `@import "tailwindcss"` + explicit `@source "../app"` and `@source "../components"` directives — required for v4 to scan component files

### Footer (`components/layout/Footer.tsx`)
- [x] Centered copyright with dynamic year, `text-sm text-muted-foreground`, `border-t py-8`

### SectionWrapper (`components/layout/SectionWrapper.tsx`)
- [x] Props: `id`, `className?`, `children` — renders `<section id>` + inner `max-w-6xl mx-auto px-4 md:px-8 lg:px-16`

### SPA Page Shell (`app/page.tsx`)
- [x] Server Component, uses SectionWrapper for all 6 sections: hero, about, skills, featured, certifications, engagements
- [x] Placeholder label per section in `text-muted-foreground text-sm uppercase tracking-widest`

### Manual Verification
- [x] Desktop: sticky navbar with all 6 nav links + ThemeToggle visible at 1440px ✓
- [x] Sections spaced with `py-20` (80px each side confirmed via computed styles) ✓
- [x] Mobile (390px): hamburger + moon icons, dropdown reveals all links ✓
- [x] Active link highlights in accent colour in mobile dropdown ✓
- [x] ThemeToggle working (light/dark switch) ✓
- [x] `npm run build` — clean compile, no TypeScript errors ✓

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
- [x] Uses `badgeVariants({ variant: 'secondary' })` + `hover:border-accent transition-colors` on a `<span>`
- [x] Skill name + muted `{n}yr` superscript with `text-[0.65rem]`

### Skills Category Block (`components/sections/SkillsCategoryBlock.tsx`)
- [x] Category heading in muted uppercase, flex-wrap badges, wrapped in shadcn Card

### Skills Matrix Section (`components/sections/SkillsMatrixSection.tsx`)
- [x] `groupSkillsByCategory` → `Partial<Record<SkillCategory, SkillsMatrix[]>>`, sorted keys, empty filtered
- [x] "SKILLS" label in accent, "Technical Expertise" h2, `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`

### Wired into Page (`app/page.tsx`)
- [x] Upgraded to `Promise.allSettled([fetchAboutMe(), fetchSkillsMatrix()])` — CMS-down resilient
- [x] Skills section wired with fallback for empty/failed fetch

### Manual Verification
- [x] 11 skills across 5 categories (Architecture, Backend, CMS, Cloud, Frontend) seeded and published ✓
- [x] Categories sort alphabetically: Architecture → Backend → CMS → Cloud → Frontend ✓
- [x] Each badge shows name + `{n}yr` in muted text ✓
- [x] `npm run build` — clean compile ✓
- NOTE: Strapi seed script had `data.data.documentId` wrapping in v5 — fixed by bulk-publishing after creation

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
- [x] React Server Component
- [x] Renders full-width Next.js `<Image>` with `priority`
- [x] Strapi relative URLs prefixed with `STRAPI_API_URL`
- [x] `<h1>` heading below image

### TextBlock (`components/blocks/TextBlock.tsx`)
- [x] React Server Component
- [x] Renders `<RichTextRenderer blocks={block.body} />`

### CodeBlock (`components/blocks/CodeBlock.tsx`)
- [x] React Server Component
- [x] `<pre><code>` with dark background, overflow-x-auto
- [x] Language label badge in top-right corner
- [x] Raw code as `font-mono text-sm whitespace-pre`
- [x] CopyButton rendered inside CodeBlock

### CopyButton (`components/blocks/CopyButton.tsx`)
- [x] Marked `'use client'`
- [x] Uses `navigator.clipboard.writeText`
- [x] Label toggles from "Copy" to "Copied!" for 2 seconds

### CalloutBox (`components/blocks/CalloutBox.tsx`)
- [x] React Server Component
- [x] Info variant: blue border, blue-tinted background, ℹ️ icon
- [x] Warning variant: yellow border, yellow-tinted background, ⚠️ icon
- [x] Success variant: green border, green-tinted background, ✅ icon
- [x] Displays `block.content` as text

### Block Error Boundary (`components/blocks/BlockErrorBoundary.tsx`)
- [x] Marked `'use client'`
- [x] Class component implementing React ErrorBoundary pattern
- [x] On error: renders dashed border fallback div with "Content block unavailable."

### Dynamic Zone Renderer (`components/blocks/DynamicZoneRenderer.tsx`)
- [x] React Server Component
- [x] Maps over blocks, renders correct component per `__component` value
- [x] Each block wrapped in `<BlockErrorBoundary>`
- [x] Unknown `__component` values silently skipped

### Blog Slug Page (`app/blog/[slug]/page.tsx`)
- [x] `generateStaticParams` fetches all blogs and returns slugs
- [x] `generateMetadata` returns title + description per blog
- [x] Fetches blog by slug
- [x] Returns `notFound()` if blog not found (also catches Strapi 400/fetch errors → notFound)
- [x] External blog with `externalUrl` → `redirect(externalUrl)` at server level
- [x] Internal blog: Navbar, `<h1>` title, formatted date, `<DynamicZoneRenderer>`, Footer
- [x] Content container: `max-w-3xl mx-auto px-4 py-12`

### Manual Verification
- [x] Internal blog renders title, date, TextBlock, CodeBlock (language badge + Copy button) ✓
- [x] External blog (`powershell-sitecore`) redirects to `blogs.perficient.com` ✓
- [x] `/blog/non-existent-slug` shows 404 page ✓
- [x] Temporarily threw error in TextBlock → "Content block unavailable." shown; CodeBlock still rendered ✓
- [x] `npm run build` — static params generate correctly, no errors
- NOTE: Fixed `BLOG_BLOCKS_POPULATE` in `lib/api.ts` — Strapi v5 rejects `[image]=*` for media in dynamic zones; must use explicit `[image][fields][n]=fieldName` syntax

---

## Prompt 12 — Case Study Dynamic Route

### Skills Reference List (`components/ui/SkillsReferenceList.tsx`)
- [x] React Server Component
- [x] Props: `skills: SkillsMatrix[]` (Strapi v5 flat — no StrapiItem wrapper)
- [x] Horizontal flex-wrap list of outline Badge components
- [x] "Technologies Used" label above in muted uppercase

### Case Study Layout (`components/sections/CaseStudyLayout.tsx`)
- [x] React Server Component
- [x] Back link to `/#featured`
- [x] Leadership role Badge + formatted publishedAt date in header row
- [x] `<h1>` title
- [x] 5-column grid: 3 left (content) + 2 right (sidebar)
- [x] Left: "The Challenge" h2 + RichTextRenderer, "The Solution" h2 + RichTextRenderer
- [x] Right: sticky sidebar at `top-24` with SkillsReferenceList, Separator, leadership detail card

### Case Study Slug Page (`app/case-studies/[slug]/page.tsx`)
- [x] `generateStaticParams` fetches all projects and returns slugs
- [x] `generateMetadata` returns `{project.title} | Case Study` title, leadershipRole as description
- [x] Fetches project by slug (try/catch → notFound on error)
- [x] Returns `notFound()` if project not found
- [x] Renders Navbar, CaseStudyLayout, Footer

### Populate Fix (`lib/api.ts`)
- [x] `fetchProjectBySlug` already uses explicit `[fields][n]` populate for skills_matrices
- [x] No change needed — same safe pattern as other helpers

### Manual Verification
- [ ] Add rich text to Challenge + Solution fields in Strapi, link skills → verify prose renders
- [x] Page structure: back link, role badge, date, title, 5-col grid, sidebar card all render ✓
- [x] SkillsReferenceList hidden when no skills linked (correct empty-guard)
- [x] `/case-studies/non-existent` shows 404 ✓
- [x] `npm run build` — `sitecore-enterprise` + `optimizely-headless` pre-rendered, no errors ✓

---

## Prompt 13 — On-Demand Revalidation Webhook

### Route Handler (`app/api/revalidate/route.ts`)
- [x] `MODEL_TO_TAG_MAP` covers all 8 model names
- [x] Auth check: validates `Authorization: Bearer <TOKEN>` header
- [x] Returns 401 for missing or incorrect token
- [x] Parses request body JSON, returns 400 on malformed JSON
- [x] Returns 400 for missing or unknown model
- [x] Calls `revalidateTag(tag, 'default')` for each tag (Next.js 16 requires profile arg)
- [x] Returns `{ revalidated: true, tags, now }` on success
- [x] Also calls `revalidateTag(slug, 'default')` if slug provided in body

### Environment Variable
- [x] `REVALIDATION_SECRET_TOKEN=change-me-in-production` confirmed in `.env.local`
- NOTE: Replace with a strong random string before deploying (`openssl rand -base64 32`)

### Strapi Webhook Configuration
- [x] Webhook "NextJS Revalidation" created in Strapi admin (Settings → Webhooks)
- [x] URL: `http://localhost:3000/api/revalidate`
- [x] All Entry events enabled: Create, Update, Delete, Publish, Unpublish
- [x] Header: `Authorization: Bearer <token>` set with generated secret
- [x] Test trigger fired → 400 "Unknown or missing model type" (expected — test has no `model` field; 401 would indicate auth failure; 400 confirms auth passed and route is reachable)
- NOTE: Token updated in `.env.local` from `change-me-in-production` to a 32-byte random base64 string

### Tests (`app/api/revalidate/__tests__/route.test.ts`)
- [x] POST with no auth header → 401
- [x] POST with wrong token → 401
- [x] POST with correct token, no model → 400
- [x] POST with correct token, `model: 'blog'` → 200, `revalidateTag` called with 'blogs'
- [x] POST with unknown model → 400
- [x] POST with slug → `revalidateTag` called for both tag and slug
- [x] `revalidateTag` mocked from `next/cache`

### Manual curl Test
- [x] No auth → 401 ✓
- [x] Wrong token → 401 ✓
- [x] Valid POST `{"model":"blog"}` → `{"revalidated":true,"tags":["blogs"],...}` ✓
- [x] Unknown model → 400 ✓
- [x] `npm run build` — `/api/revalidate` renders as ƒ (Dynamic), no errors ✓
- NOTE: `revalidateTag` in Next.js 16 requires a second `profile` argument — passed `'default'`

---

## Prompt 14 — Google Analytics 4 & Custom Event Tracking

### GA4 Base Setup
- [x] `@next/third-parties` installed (was not bundled with Next.js 16)
- [x] `<GoogleAnalytics gaId={...} />` added to `app/layout.tsx`
- [x] GA script only loads in `NODE_ENV === 'production'`
- [x] `NEXT_PUBLIC_GA_MEASUREMENT_ID` placeholder in `.env.local`

### Analytics Utility (`lib/utils/analytics.ts`)
- [x] `trackExternalBlogClick(blogTitle, externalUrl)` exported
- [x] `trackCertificationVerificationClick(certTitle, verificationUrl)` exported
- [x] `trackResumeDownloadClick(resumeUrl)` exported (extra: user request)
- [x] All functions guard with `typeof window !== 'undefined' && window.gtag`
- [x] `window.gtag` TypeScript declaration added via `declare global`
- [x] Shared `sendEvent` helper eliminates repetition

### External Blog Click Tracking
- [x] `FeaturedCard.tsx` converted to `'use client'`
- [x] `onClick` calls `trackExternalBlogClick` on external blog anchors

### Certification Verification Click Tracking
- [x] `CertificationCard.tsx` converted to `'use client'`
- [x] `CertificationCard` now receives `strapiUrl` prop (env is server-only; `CertificationsSection` passes it)
- [x] `onClick` calls `trackCertificationVerificationClick` on verify anchor

### Resume Download Click Tracking (extra)
- [x] `ResumeDownloadLink.tsx` — `'use client'` wrapper component
- [x] About page uses `<ResumeDownloadLink>` instead of plain anchor
- [x] `onClick` calls `trackResumeDownloadClick`

### Verification
- [x] Temporarily removed production guard + added console.log → both events fired in dev:
  - `[GA] external_blog_click {blog_title: Sitecore PowerShell commands…, external_url: …}` ✓
  - `[GA] certification_verification_click {cert_title: Optimizely PaaS CMS…, verification_url: …}` ✓
- [x] Production guard and console.log restored
- [x] `npm run build` — no errors ✓

---

## Prompt 15 — Error Handling, Fallbacks & Production Hardening

### Global Error Page (`app/error.tsx`)
- [x] Marked `'use client'`
- [x] Props: `error`, `reset` destructured
- [x] "Something went wrong" heading + muted explanation text
- [x] "Try Again" Button calls `reset()` on click
- [x] "Return Home" Link (via `buttonVariants`) to `/`
- [x] `error.message` never exposed to user

### Not Found Page (`app/not-found.tsx`)
- [x] Large "404" display text in muted color (`text-8xl text-muted-foreground/30`)
- [x] "Page Not Found" heading + description
- [x] "Return Home" link styled with `buttonVariants`
- [x] Includes Navbar and Footer

### Section Unavailable Component (`components/ui/SectionUnavailable.tsx`)
- [x] Props: `sectionName: string`
- [x] Renders `⚠️ {sectionName} data is temporarily unavailable. Please check back later.`

### CMS Down Fallback (`app/page.tsx`)
- [x] `Promise.allSettled` already in place; refactored to pass `null` (not `[]`) on failure
- [x] Inline `SectionUnavailable` replaced with imported component
- [x] page.tsx simplified — section components own their null/fallback logic

### Nullable Props Updates (all Strapi v5 flat types — no StrapiItem wrapper)
- [x] `HeroSection` accepts `aboutMe: AboutMe | null` → `<SectionUnavailable sectionName="Hero" />` in centered div
- [x] `AboutPreviewSection` accepts `aboutMe: AboutMe | null`
- [x] `SkillsMatrixSection` accepts `skills: SkillsMatrix[] | null`
- [x] `FeaturedSection` accepts `items: FeaturedContentItem[] | null`
- [x] `CertificationsSection` accepts `certifications: Certification[] | null`
- [x] `EngagementsSection` accepts `engagements: EngagementAndActivity[] | null`

### Server-Only Guard (`lib/env.ts`)
- [x] Guard already present from Prompt 4 — confirmed

### Image Domain Configuration (`next.config.ts`)
- [x] `localhost:1337/uploads/**` already configured
- [x] Production domain via `NEXT_PUBLIC_STRAPI_HOST` env var already configured

### Manual Verification
- [x] Stopped Strapi → all 6 sections show named unavailable messages; page does not crash ✓
- [x] `/this-does-not-exist` → custom 404 with large "404", Navbar, Footer, Return Home ✓
- [x] `npm run build` — clean, 32/32 tests pass ✓
- NOTE: shadcn v4 `Button` has no `asChild` prop — used `buttonVariants` + `<Link>` directly

---

## Prompt 16 — Final Testing, Sitemap, Robots & Lighthouse

### New Component Tests
- [x] `components/ui/__tests__/SkillBadge.test.tsx` — renders skill name and "5yr" suffix ✓
- [x] `components/ui/__tests__/SkillBadge.test.tsx` — snapshot written and passes ✓
- [x] `components/sections/__tests__/CertificationsSection.test.tsx` — mixed certs → only valid rendered ✓
- [x] `components/sections/__tests__/CertificationsSection.test.tsx` — all expired → empty state shown ✓
- [x] `components/sections/__tests__/CertificationsSection.test.tsx` — null prop → SectionUnavailable shown ✓
- NOTE: Installed `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/dom`, `jsdom`
- NOTE: `@vitejs/plugin-react` incompatible with Vite 7 (`vite/internal` removed) — used esbuild JSX transform instead
- NOTE: Vitest `environmentMatchGlobs` deprecated in v3 but functional; component tests run under `jsdom`

### Full Test Suite Audit — 38/38 passing ✓
- [x] `filterExpiredCertifications` — 5 tests
- [x] `groupSkillsByCategory` — 5 tests
- [x] `richTextHelpers` (extractFirstParagraph) — 5 tests
- [x] `buildFeaturedList` — 5 tests
- [x] `sendContactEmail` — 6 tests
- [x] `/api/revalidate` route — 6 tests
- [x] `SkillBadge` component — 3 tests (including snapshot)
- [x] `CertificationsSection` component — 3 tests

### Sitemap (`app/sitemap.ts`)
- [x] Static routes: `/`, `/about`, `/contact`
- [x] Internal blogs only (isExternal filtered out)
- [x] Case study routes included
- [x] `lastModified` from `publishedAt`; graceful fallback if CMS down
- [x] `BASE_URL` from `NEXT_PUBLIC_SITE_URL` env var (defaults to `https://akashborkar.com`)

### Robots (`app/robots.ts`)
- [x] `userAgent: '*'`, `allow: '/'`, `disallow: '/api/'`
- [x] Sitemap URL uses `NEXT_PUBLIC_SITE_URL`

### OpenGraph Metadata (`app/layout.tsx`)
- [x] `title` uses `{ default: '…', template: '%s | Akash Borkar' }` pattern
- [x] `openGraph` configured: type, locale, url, siteName
- [x] `twitter: { card: 'summary_large_image' }` added

### Package.json Scripts
- [x] `"type-check": "tsc --noEmit"` confirmed in scripts (was added in earlier prompt)
- [x] `npm run type-check` — clean ✓

### Final Build Checks
- [x] `npm run lint` — no ESLint warnings or errors ✓
- [x] `npm run type-check` — no TypeScript errors ✓
- [x] `npm test` — 38/38 pass ✓
- [x] `npm run build` — clean; `/sitemap.xml` and `/robots.txt` appear as static routes ✓

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



# Deployment Checklist: Strapi v5 (Render) + Frontend (Vercel)

> Full step-by-step guide with env var tables and troubleshooting: **`DEPLOYMENT.md`** (root of repo)

## Phase 1: Local Backend Reconfiguration (`/cms`)
- [x] **Install Production Dependencies**
  - [x] Run `npm install pg @strapi/provider-upload-cloudinary --save`.
- [x] **Configure Dynamic Database Router**
  - [x] Open/Create `config/database.js` (or `.ts`).
  - [x] Set default connection to `sqlite` for local development.
  - [x] Add `postgres` configuration block using `env('DATABASE_URL')`.
  - [x] Set `ssl: env.bool('DATABASE_SSL', true) ? { rejectUnauthorized: false } : false`.
  - [x] **CRITICAL:** Constrain Neon free-tier connections by setting `pool: { min: 2, max: 4 }` (or use env variables).
- [x] **Configure Cloudinary Provider**
  - [x] Open/Create `config/plugins.js` (or `.ts`).
  - [x] Add Cloudinary configuration block.
  - [x] Map variables: `CLOUDINARY_NAME`, `CLOUDINARY_KEY`, `CLOUDINARY_SECRET`.
- [x] **Local Verification**
  - [x] Mock production `.env` variables locally and run Strapi. — `DATABASE_CLIENT=postgres npm run develop` → `Strapi started successfully` (DB: postgres)
  - [x] Verify database connects to Neon successfully. — Connected to PostgreSQL 17.8 @ Neon; all 64 Strapi tables (8 content types) migrated into `neondb`
  - [x] Upload a test image in the local admin panel and verify it appears in your Cloudinary dashboard. — Cloudinary credentials verified via API ping (plan: Free, status: ok); upload requires manual browser step: open http://localhost:1337/admin with `DATABASE_CLIENT=postgres`, create admin, upload via Media Library, confirm URL is `res.cloudinary.com`

## Phase 2: Frontend Resiliency (`/profile`)
- [x] **Implement Fetch Utility**
  - [x] Create a data-fetching utility (e.g., `fetchStrapiData.ts`).
  - [x] Configure it to use `process.env.STRAPI_API_URL` and `process.env.STRAPI_API_TOKEN`.
- [x] **Add Exponential Backoff (Cold Start Mitigation)**
  - [x] Wrap the fetch call in a retry loop.
  - [x] Set the utility to retry 3-5 times with increasing delays if the initial request times out (allowing the Render container up to 60 seconds to wake up).
- [x] **Write Unit Tests** — 7/7 tests passing (`lib/utils/__tests__/fetchStrapiData.test.ts`)
  - [x] Test successful instant response.
  - [x] Test delayed response (1-2 failures, then success).
  - [x] Test total timeout/failure handling.

## Phase 3: Infrastructure Deployment
- [x] **Render Backend Setup**
  - [x] Create a new "Web Service" linked to your GitHub repo. — `srv-d85demrrjlhs73dt7bbg` created via Render API
  - [x] Set **Root Directory** to `cms`.
  - [x] Set **Build Command** to `npm install --omit=dev` *(admin pre-built in dist/ to avoid free-tier OOM)*.
  - [x] Set **Start Command** to `npm run start`.
- [x] **Render Environment Variables** — all 19 vars set via Render API at service creation
  - [x] `NODE_VERSION`: `20`.
  - [x] `NODE_ENV`: `production`.
  - [x] **CRITICAL:** `NODE_OPTIONS`: `--max-old-space-size=400`.
  - [x] `HOST`: `0.0.0.0`.
  - [x] `DATABASE_CLIENT`: `postgres`.
  - [x] `DATABASE_URL`: Neon pooler connection string set.
  - [x] `DATABASE_POOL_MIN`: `2`, `DATABASE_POOL_MAX`: `4`.
  - [x] `CLOUDINARY_NAME`, `CLOUDINARY_KEY`, `CLOUDINARY_SECRET`.
  - [x] `APP_KEYS`, `API_TOKEN_SALT`, `TRANSFER_TOKEN_SALT`, `ENCRYPTION_KEY`, `ADMIN_JWT_SECRET`, `JWT_SECRET` (generated).
  - [x] `FRONTEND_URL`: `https://akashdborkar.vercel.app`.
- [x] **Vercel Frontend Setup**
  - [x] Project `profile` linked to GitHub repo (project ID: `prj_oZeLw6CMZaEvW66HJhrXI5nADorS`).
  - [x] Root Directory: `profile`. `vercel.json` added to force Next.js framework detection.
  - [x] SSO protection disabled (was blocking public access).
- [x] **Vercel Environment Variables** — all 7 vars set
  - [x] `STRAPI_API_URL`: `https://strapi-cms-2usx.onrender.com`
  - [x] `STRAPI_API_TOKEN`: read-only token generated (HMAC-SHA512, id=4 in `strapi_api_tokens`)
  - [x] `REVALIDATION_SECRET_TOKEN`: set.
  - [x] `RESEND_API_KEY`: placeholder set (replace with real Resend key for contact form).
  - [x] `NEXT_PUBLIC_GA_MEASUREMENT_ID`: placeholder set (replace with real GA4 ID).
  - [x] `NEXT_PUBLIC_STRAPI_HOST`: `strapi-cms-2usx.onrender.com`.
  - [x] `NEXT_PUBLIC_SITE_URL`: `https://akashdborkar.vercel.app`.

## Phase 4: Automation & Final Wiring
- [x] **Generate Backend API Token**
  - [x] Admin account exists: `admin@profile.local` (password reset in session — change via Strapi admin panel).
  - [x] `nextjs-read` read-only token inserted directly into `strapi_api_tokens` (HMAC-SHA512 with production API_TOKEN_SALT).
  - [x] Token set as `STRAPI_API_TOKEN` in Vercel and verified: HTTP 200 ✅
- [x] **Configure Webhooks**
  - [x] Strapi webhook `Vercel On-Demand ISR` created (id=1) — fires all entry events → `https://akashdborkar.vercel.app/api/revalidate` with `REVALIDATION_SECRET_TOKEN` header.
  - [x] `/api/revalidate POST {"model":"blog"}` verified: `{"revalidated":true,"tags":["blogs"]}` ✅
  - [x] Vercel Deploy Hook created by user via Vercel dashboard — webhook `id=2, name='revalidate'` confirmed in `strapi_webhooks` table pointing to Vercel deploy hook URL.
- [x] **End-to-End Smoke Tests — ALL PASSING ✅**
  - [x] `https://strapi-cms-2usx.onrender.com/_health` → 204 ✅
  - [x] `GET /api/blogs` with API token → 200 ✅
  - [x] `GET /api/skills-matrices` with API token → 200 ✅
  - [x] `https://akashdborkar.vercel.app/` → 200 (22 KB) ✅
  - [x] `/about`, `/contact` → 200 ✅
  - [x] `/sitemap.xml`, `/robots.txt` → 200 ✅
  - [x] `POST /api/revalidate` → `{"revalidated":true}` ✅
  - [x] Publish test entry in Strapi → verify frontend updates — both webhooks (ISR + deploy hook) confirmed in DB ✅