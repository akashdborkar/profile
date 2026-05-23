# Blueprint & Implementation Prompts: Lead Technical Consultant Platform

## Phase 1: High-Level Blueprint

Before breaking into prompts, here's the architectural roadmap:

1. **Foundation** — monorepo setup, Next.js App Router, Tailwind + shadcn/ui, theme system
2. **Strapi CMS** — schema definitions for all content types
3. **Data Layer** — typed API client, fetch utilities, cache tagging
4. **Core Pages** — SPA home with all sections, About, Contact
5. **Dynamic Routes** — Blog `[slug]`, Case Study `[slug]`
6. **Integrations** — Revalidation webhook, Resend contact form, GA4
7. **Error Handling** — boundaries, fallbacks, expired cert filter
8. **Testing** — unit, integration, performance

---

## Phase 2: Iterative Chunks

| Chunk | Scope |
|---|---|
| A | Next.js project scaffold + Tailwind + shadcn/ui + dark mode |
| B | Strapi instance + all schema definitions |
| C | Typed API client + fetch helpers + cache tags |
| D | Home page SPA layout shell + navigation |
| E | Hero + About preview sections (data-connected) |
| F | Skills Matrix section |
| G | Featured Content hybrid engine + section |
| H | Certifications section (with expiry filter) |
| I | Engagements section |
| J | Gallery component |
| K | About page (full narrative) |
| L | Contact page + Server Action + Resend |
| M | Blog dynamic route + Dynamic Zone renderer |
| N | Case Study dynamic route |
| O | Revalidation webhook endpoint |
| P | GA4 + custom event tracking |
| Q | Error boundaries + fallbacks |
| R | Testing suite |

---

## Phase 3: Step-Sized Breakdown

Each chunk is broken into steps sized for safe, testable implementation:

**A — Scaffold**
- A1: Init Next.js 15 App Router project with TypeScript
- A2: Install and configure Tailwind CSS
- A3: Install and configure shadcn/ui
- A4: Implement next-themes dark/light toggle with dark-first default
- A5: Define CSS design tokens (palette, typography scale)

**B — Strapi**
- B1: Bootstrap Strapi instance, configure SQLite for dev
- B2: Define Single Types: `AboutMe`, `FeaturedCurations`
- B3: Define Collection Type: `SkillsMatrix`
- B4: Define Collection Type: `Projects`
- B5: Define Collection Type: `Blogs` with Dynamic Zone
- B6: Define Collection Types: `Gallery`, `Certifications`, `EngagementsAndActivities`
- B7: Configure API tokens and CORS for Next.js consumption

**C — Data Layer**
- C1: Environment variable setup + typed Strapi API client base
- C2: Fetch helper for `AboutMe` with cache tag
- C3: Fetch helpers for all collection types with cache tags
- C4: TypeScript interfaces for all content types

**D — Layout Shell**
- D1: Root `layout.tsx` with ThemeProvider and font config
- D2: SPA scroll layout `page.tsx` shell with section anchors
- D3: Sticky navigation bar component with anchor links

**E — Hero + About Preview**
- E1: Hero section component (elevator pitch, social links)
- E2: About preview section component
- E3: Wire both to live Strapi data

**F — Skills Matrix**
- F1: Skills badge component
- F2: Skills Matrix section with server-side category grouping

**G — Featured Content**
- G1: Featured content card component (polymorphic)
- G2: Hybrid filter engine logic
- G3: Featured section wired to engine

**H — Certifications**
- H1: Certification card component
- H2: Server-side expiry filter utility
- H3: Certifications section wired with filter

**I — Engagements**
- I1: Engagement card component
- I2: Engagements section wired to data

**J — Gallery**
- J1: Gallery image component with Next.js Image optimization
- J2: Gallery grid with category tag filter

**K — About Page**
- K1: Full professional narrative renderer (Rich Text)
- K2: Resume download button wired to Strapi media asset

**L — Contact**
- L1: Contact form UI component
- L2: Server Action with validation
- L3: Resend integration + error toast handling

**M — Blog Route**
- M1: Blog list (used for sitemap/linking)
- M2: Dynamic Zone block components (Hero, Text, Code, Callout)
- M3: `[slug]` page wired to Dynamic Zone renderer
- M4: External blog redirect handling

**N — Case Study Route**
- N1: Case study detail layout component
- N2: Skills cross-reference renderer
- N3: `[slug]` page wired to data

**O — Revalidation**
- O1: `/api/revalidate` route handler with auth middleware

**P — Analytics**
- P1: GA4 setup via `@next/third-parties/google`
- P2: Custom event: external blog click
- P3: Custom event: certification verification click

**Q — Error Handling**
- Q1: Global error boundary for Dynamic Zone blocks
- Q2: CMS-down static fallback behavior
- Q3: Contact form 429 error handling

**R — Testing**
- R1: Unit tests for utilities (expiry filter, hybrid engine)
- R2: Component tests for key UI pieces
- R3: Integration test for revalidation endpoint
- R4: Integration test for contact Server Action
- R5: Lighthouse/Web Vitals baseline check

---

## Phase 4: Code-Generation Prompts

---

### Prompt 1 — Project Scaffold & Tailwind

```text
You are a senior Next.js engineer bootstrapping a new production application.

TASK:
Initialize a Next.js 15 project using the App Router with the following configuration, then install and configure Tailwind CSS and shadcn/ui. Finally, implement a dark-mode-first theme system using next-themes.

REQUIREMENTS:

1. PROJECT INIT
   - Use `create-next-app@latest` settings:
     - TypeScript: yes
     - ESLint: yes
     - App Router: yes
     - src/ directory: no
     - Import alias: `@/*`
   - Target directory: `profile/`

2. TAILWIND CSS
   - Install Tailwind CSS v3 with PostCSS and Autoprefixer
   - Configure `tailwind.config.ts`:
     - Content paths: `./app/**/*.{ts,tsx}`, `./components/**/*.{ts,tsx}`
     - Extend the theme with a custom color palette:
       - `background`: maps to CSS var `--background`
       - `foreground`: maps to CSS var `--foreground`
       - `accent`: maps to CSS var `--accent`
       - `muted`: maps to CSS var `--muted`
     - Enable the `darkMode: 'class'` strategy
   - In `app/globals.css`, define CSS custom properties for both `:root` (light) and `.dark` (dark):
     - Light: background `#f8fafc`, foreground `#0f172a`, accent `#3b82f6`, muted `#64748b`
     - Dark (default experience): background `#0d1117`, foreground `#e2e8f0`, accent `#38bdf8`, muted `#475569`

3. SHADCN/UI
   - Run `npx shadcn-ui@latest init` with:
     - Style: Default
     - Base color: Slate
     - CSS variables: yes
   - Install these components upfront: `button`, `card`, `badge`, `toast`, `separator`, `input`, `textarea`, `label`

4. NEXT-THEMES (dark mode)
   - Install `next-themes`
   - Create `components/providers/ThemeProvider.tsx` — a client component that wraps `ThemeProvider` from next-themes, configured with:
     - `attribute="class"`
     - `defaultTheme="dark"`
     - `enableSystem={false}`
   - Create `components/ui/ThemeToggle.tsx` — a client component using shadcn `Button` that toggles between light and dark themes, displaying a sun/moon icon (use lucide-react icons already bundled with shadcn)
   - Update `app/layout.tsx` to:
     - Wrap children in `ThemeProvider`
     - Set `<html lang="en" suppressHydrationWarning>`
     - Import and apply `globals.css`
     - Use the Inter font from `next/font/google`

5. DESIGN TOKENS FILE
   - Create `lib/design-tokens.ts` that exports a plain object `tokens` containing:
     - `fontSans`: `'Inter, system-ui, sans-serif'`
     - `accentBlue`: `'#38bdf8'`
     - `accentGreen`: `'#34d399'`
     - `charcoal`: `'#0d1117'`
   - This file is documentation and import source for any hardcoded references needed outside Tailwind.

TESTING:
- After setup, add a temporary test in `app/page.tsx` that renders: a dark background page, the ThemeToggle button, and the text "Platform scaffold ready" in accent color.
- Verify the page renders without TypeScript or ESLint errors by running `npm run build`.
- Confirm that clicking the ThemeToggle successfully switches the `class` on `<html>` between `dark` and `light`.

OUTPUT:
Provide all configuration files in full. Show the complete file content for:
- `tailwind.config.ts`
- `app/globals.css`
- `app/layout.tsx`
- `components/providers/ThemeProvider.tsx`
- `components/ui/ThemeToggle.tsx`
- `lib/design-tokens.ts`
- `app/page.tsx` (temporary smoke test version)
```

> **⚠️ Version Adaptations (implemented May 2026)**
>
> | Spec assumed | Actual (current) | Impact |
> |---|---|---|
> | Tailwind CSS v3 (`tailwind.config.ts` color extensions, `darkMode: 'class'`) | **Tailwind CSS v4.3** — required by shadcn v4.7; config moves to CSS-based `@theme inline {}` in `globals.css` | `tailwind.config.ts` kept for content paths only; dark mode via `@custom-variant dark` in CSS |
> | `npx shadcn-ui@latest init` (deprecated package) | **`npx shadcn@latest init`** v4.7 — uses `oklch()` color format, `@import "shadcn/tailwind.css"`, `tw-animate-css` | `globals.css` structure updated; brand hex vars override shadcn's oklch token vars |
> | `toast` shadcn component | **`sonner`** — `toast` removed from shadcn v4 registry | Install `sonner` instead; `<Toaster>` from `sonner` component |
> | shadcn Default/Slate style | **base-nova/neutral** — only style available in v4.7 `-d` flag | Irrelevant to final design; brand color vars override the base palette entirely |
> | Next.js 15 | **Next.js 16.2.6** — installed by `create-next-app@latest` | No breaking changes for App Router usage in these prompts |

---

### Prompt 2 — Strapi CMS: Bootstrap & Single Types

```text
You are a senior backend engineer setting up a Strapi v4 Headless CMS instance for a profile portfolio.

TASK:
Bootstrap a Strapi v4 instance and define all Single Type content schemas. This CMS will serve as the content engine consumed by a Next.js frontend via REST API.

REQUIREMENTS:

1. STRAPI BOOTSTRAP
   - Create a new Strapi v4 project using:
     `npx create-strapi-app@latest cms --quickstart`
   - This uses SQLite for development. Place it in a sibling directory `cms/` next to the Next.js project.
   - Confirm the admin panel runs at `http://localhost:1337/admin`

2. SINGLE TYPE: `AboutMe`
   Define the following fields in the Strapi schema builder (provide the JSON schema file at `cms/src/api/about-me/content-types/about-me/schema.json`):
   - `elevatorPitch` — Long Text, required
   - `professionalNarrative` — Rich Text (Blocks), required
   - `resumeFile` — Media (single file, allowed types: files/pdf)
   - `socialLinks` — Repeatable Component named `shared.social-link` with:
     - `platformName` — Enumeration: `LinkedIn, GitHub, X, StackOverflow`, required
     - `url` — String with URL regex validation, required

3. SINGLE TYPE: `FeaturedCurations`
   Define at `cms/src/api/featured-curation/content-types/featured-curation/schema.json`:
   - `manuallyCuratedList` — Repeatable Component named `shared.curated-item`, max 5 items, with:
     - `contentType` — Enumeration: `Blogs, Projects, Engagements`, required
     - `targetId` — Integer, required

4. SHARED COMPONENTS
   Create component schema files:
   - `cms/src/components/shared/social-link.json`:
     - `platformName`: Enumeration (LinkedIn, GitHub, X, StackOverflow)
     - `url`: String
   - `cms/src/components/shared/curated-item.json`:
     - `contentType`: Enumeration (Blogs, Projects, Engagements)
     - `targetId`: Integer

5. API ACCESS CONFIGURATION
   - In Strapi admin (document with steps), navigate to Settings > API Tokens and create a read-only API token named `nextjs-read`. Note the token value for use in Next.js environment variables.
   - In Settings > Users & Permissions > Public Role, enable `find` and `findOne` for `AboutMe` and `FeaturedCuration`.
   - Configure CORS in `cms/config/middlewares.ts` to allow requests from `http://localhost:3000` (development) and the production Vercel domain (use an environment variable `FRONTEND_URL`).

6. SEED DATA
   - After confirming schemas compile, manually enter seed data via the Strapi admin UI for `AboutMe`:
     - `elevatorPitch`: "Senior technical consultant specializing in scalable web architecture, cloud delivery, and engineering leadership."
     - One social link: LinkedIn with a placeholder URL.
   - Document these steps rather than automating them (seed scripts are out of scope for this step).

TESTING:
- Start the Strapi server: `npm run develop` from `cms/`
- Confirm `http://localhost:1337/api/about-me?populate=*` returns valid JSON including `elevatorPitch` and `socialLinks`
- Confirm unauthorized requests (no token) to the API return 403 if the public role does not have access, or 200 if public access is intentionally granted
- Validate that the schema JSON files are syntactically correct JSON

OUTPUT:
Provide complete file contents for:
- `cms/src/api/about-me/content-types/about-me/schema.json`
- `cms/src/api/featured-curation/content-types/featured-curation/schema.json`
- `cms/src/components/shared/social-link.json`
- `cms/src/components/shared/curated-item.json`
- `cms/config/middlewares.ts`
- Step-by-step instructions for API token creation and public role permissions
```

> **⚠️ Version Adaptations (implemented May 2026)**
>
> | Spec assumed | Actual (current) | Impact |
> |---|---|---|
> | Strapi v4 | **Strapi v5.46.0** — installed by `create-strapi-app@latest` | Schema JSON format identical; `pluginsOptions` key renamed to `pluginOptions` (linter-corrected); `factories.createCoreController/Service/Router` API unchanged |
> | `npx create-strapi-app@latest cms --quickstart` auto-starts server | `--no-run` flag added | Prevents auto-launch; run `npm run develop` manually from `cms/` |
> | `findOne` permission for single types | **Single types only have `find`** (no `findOne` route in v5) | Enable only `find` under Public Role for `AboutMe` and `FeaturedCuration` |
> | `PUT /admin/users-permissions/roles/:id` API path | **`PUT /users-permissions/roles/:id`** (no `/admin` prefix, uses `jwtToken` cookie) | Use browser session or cookie-based auth for programmatic permission updates |
> | `hsl(var(--xxx))` pattern in middlewares | No change needed — v5 CORS config format identical to v4 | `config/middlewares.ts` structure unchanged |
> | Seed via script | **Seed via admin UI** at `/admin/content-manager` — enter content, upload PDF, add social links, click Publish | Verified: `GET /api/about-me?populate=*` returns full JSON with `elevatorPitch`, `professionalNarrative` (Blocks), `resumeFile`, and `socialLinks` |

---

### Prompt 3 — Strapi CMS: Collection Type Schemas

```text
You are a senior backend engineer extending a Strapi v4 CMS instance. The CMS already has Single Types (AboutMe, FeaturedCurations) and shared components defined.

TASK:
Define all Collection Type schemas required by the profile portfolio. Each schema must be production-ready with correct field types, validations, and relations.

REQUIREMENTS:

1. COLLECTION TYPE: `SkillsMatrix`
   File: `cms/src/api/skills-matrix/content-types/skills-matrix/schema.json`
   Fields:
   - `skillName` — String, required, unique
   - `category` — Enumeration: `Frontend, Backend, Cloud, DevOps, Database, CMS, AI, Architecture, Management`, required
   - `yearsOfExperience` — Integer, required, min: 0, max: 50

2. COLLECTION TYPE: `Project`
   File: `cms/src/api/project/content-types/project/schema.json`
   Fields:
   - `title` — String, required
   - `slug` — UID, targetField: `title`, required
   - `leadershipRole` — String, required (e.g., "Lead Architect")
   - `challenge` — Rich Text (Blocks), required
   - `solution` — Rich Text (Blocks), required
   - `skills_matrices` — Relation: many-to-many with SkillsMatrix
   - `isFeatured` — Boolean, default: false
   - `publishedAt` — DateTime (this is the Strapi draft/publish field, confirm it is enabled via draftAndPublish: true)

3. COLLECTION TYPE: `Blog`
   File: `cms/src/api/blog/content-types/blog/schema.json`
   Fields:
   - `title` — String, required
   - `slug` — UID, targetField: `title`, required
   - `isExternal` — Boolean, default: false
   - `externalUrl` — String, optional (URL validation)
   - `isFeatured` — Boolean, default: false
   - `publishedAt` — DateTime (draftAndPublish: true)
   - `contentBlocks` — Dynamic Zone with these components:
     - `content.hero-block`: fields `image` (Media, single image), `headingText` (String)
     - `content.text-block`: fields `body` (Rich Text / Blocks)
     - `content.code-block`: fields `code` (Text, long), `language` (String, e.g., "typescript")
     - `content.callout-box`: fields `variant` (Enumeration: Info, Warning, Success), `content` (Text)

4. COLLECTION TYPE: `Gallery`
   File: `cms/src/api/gallery/content-types/gallery/schema.json`
   Fields:
   - `title` — String, required
   - `imageAsset` — Media (single image), required, allowed formats: jpeg, png, webp
   - `categoryTag` — Enumeration: `SpeakingEvents, Offices, TeamWork, Certifications`, required

5. COLLECTION TYPE: `Certification`
   File: `cms/src/api/certification/content-types/certification/schema.json`
   Fields:
   - `title` — String, required
   - `issuingBody` — String, required
   - `badgeImage` — Media (single image), required
   - `verificationUrl` — String, URL validation, required
   - `expiryDate` — Date, optional

6. COLLECTION TYPE: `EngagementAndActivity`
   File: `cms/src/api/engagement-and-activity/content-types/engagement-and-activity/schema.json`
   Fields:
   - `title` — String, required
   - `description` — Rich Text (Blocks), required
   - `eventDate` — Date, required
   - `isFeatured` — Boolean, default: false
   - `gallery_items` — Relation: many-to-many with Gallery

7. DYNAMIC ZONE COMPONENTS
   Create component JSON files for Blog contentBlocks:
   - `cms/src/components/content/hero-block.json`
   - `cms/src/components/content/text-block.json`
   - `cms/src/components/content/code-block.json`
   - `cms/src/components/content/callout-box.json`

8. PERMISSIONS
   In Strapi admin, enable `find` and `findOne` for all new collection types under the public role (or the API token role if using token-based auth). Document the steps.

TESTING:
- Run `npm run develop` in `cms/` and confirm no schema compilation errors appear in the terminal.
- Navigate to the Strapi admin content manager and confirm all six collection types appear.
- Create one test entry for `SkillsMatrix` (e.g., skillName: "Next.js", category: "Frontend", yearsOfExperience: 3).
- Hit `http://localhost:1337/api/skills-matrices` and confirm the entry is returned in the JSON response.
- Create one test `Blog` entry with one `TextBlock` component in `contentBlocks` and confirm it populates correctly via `http://localhost:1337/api/blogs?populate[contentBlocks]=*`

OUTPUT:
Provide complete file contents for all 7 schema JSON files and all 4 component JSON files. Include the exact Strapi admin steps for setting permissions.
```

---

### Prompt 4 — TypeScript API Client & Data Layer

```text
You are a senior TypeScript engineer building the data access layer for a Next.js 15 App Router application. The application consumes a Strapi v5 REST API.

TASK:
Build a fully typed Strapi API client, TypeScript interfaces for all content types, and fetch helper functions with Next.js cache tagging. No UI is involved in this step.

REQUIREMENTS:

1. ENVIRONMENT VARIABLES
   Create `.env.local` template (`.env.local.example`):
   ```
   STRAPI_API_URL=http://localhost:1337
   STRAPI_API_TOKEN=your_read_only_token_here
   REVALIDATION_SECRET_TOKEN=your_secret_here
   RESEND_API_KEY=your_resend_key_here
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```
   In `lib/env.ts`, export validated environment variable accessors:
   ```ts
   export const env = {
     strapiUrl: process.env.STRAPI_API_URL!,
     strapiToken: process.env.STRAPI_API_TOKEN!,
     revalidationToken: process.env.REVALIDATION_SECRET_TOKEN!,
     resendKey: process.env.RESEND_API_KEY!,
     gaId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!,
   };
   ```

2. TYPESCRIPT INTERFACES
   Create `lib/types.ts` with interfaces matching Strapi's response shape (include the `data` wrapper and `attributes` pattern for collection types):

   - `StrapiResponse<T>` — generic wrapper: `{ data: T; meta: {...} }`
   - `StrapiItem<T>` — `{ id: number; attributes: T }`
   - `SocialLink`: `{ platformName: 'LinkedIn'|'GitHub'|'X'|'StackOverflow'; url: string }`
   - `CuratedItem`: `{ contentType: 'Blogs'|'Projects'|'Engagements'; targetId: number }`
   - `AboutMe`: `{ elevatorPitch: string; professionalNarrative: any; resumeFile: {...}|null; socialLinks: SocialLink[] }`
   - `FeaturedCurations`: `{ manuallyCuratedList: CuratedItem[] }`
   - `SkillsMatrix`: `{ skillName: string; category: SkillCategory; yearsOfExperience: number }`
   - `SkillCategory`: Union type of all 9 category enum values
   - `Project`: `{ title: string; slug: string; leadershipRole: string; challenge: any; solution: any; skills_matrices: { data: StrapiItem<SkillsMatrix>[] }; isFeatured: boolean; publishedAt: string }`
   - `Blog`: `{ title: string; slug: string; isExternal: boolean; externalUrl?: string; isFeatured: boolean; publishedAt: string; contentBlocks: ContentBlock[] }`
   - `ContentBlock`: A discriminated union type using `__component` field:
     - `'content.hero-block'`: `{ image: any; headingText: string }`
     - `'content.text-block'`: `{ body: any }`
     - `'content.code-block'`: `{ code: string; language: string }`
     - `'content.callout-box'`: `{ variant: 'Info'|'Warning'|'Success'; content: string }`
   - `Gallery`: `{ title: string; imageAsset: any; categoryTag: GalleryCategoryTag }`
   - `GalleryCategoryTag`: `'SpeakingEvents'|'Offices'|'TeamWork'|'Certifications'`
   - `Certification`: `{ title: string; issuingBody: string; badgeImage: any; verificationUrl: string; expiryDate?: string }`
   - `EngagementAndActivity`: `{ title: string; description: any; eventDate: string; isFeatured: boolean; gallery_items: { data: StrapiItem<Gallery>[] } }`

3. BASE API CLIENT
   Create `lib/strapi.ts`:
   - Export an async function `strapiRequest<T>(path: string, options?: RequestInit & { tags?: string[]; next?: any }): Promise<T>`
   - Internally, it constructs the full URL from `env.strapiUrl + path`
   - Sets `Authorization: Bearer ${env.strapiToken}` header
   - Passes `next: { tags: options?.tags ?? [] }` for Next.js cache tagging
   - Throws a descriptive error if the response is not `ok`
   - Returns `response.json()`

4. FETCH HELPERS
   Create `lib/api.ts` with the following exported async functions, each using `strapiRequest` with appropriate populate params and cache tags:

   - `fetchAboutMe(): Promise<AboutMe>` — GET `/api/about-me?populate=*`, tag: `['about-me']`
   - `fetchFeaturedCurations(): Promise<FeaturedCurations>` — GET `/api/featured-curation?populate=*`, tag: `['featured-curations']`
   - `fetchSkillsMatrix(): Promise<StrapiItem<SkillsMatrix>[]>` — GET `/api/skills-matrices?sort=category:asc&pagination[limit]=100`, tag: `['skills-matrix']`
   - `fetchProjects(featured?: boolean): Promise<StrapiItem<Project>[]>` — GET with optional `filters[isFeatured][$eq]=true`, populate skills_matrices, tag: `['projects']`
   - `fetchProjectBySlug(slug: string): Promise<StrapiItem<Project> | null>` — GET with slug filter and full populate, tag: `['projects', slug]`
   - `fetchBlogs(featured?: boolean): Promise<StrapiItem<Blog>[]>` — tag: `['blogs']`
   - `fetchBlogBySlug(slug: string): Promise<StrapiItem<Blog> | null>` — populate contentBlocks, tag: `['blogs', slug]`
   - `fetchGallery(tag?: GalleryCategoryTag): Promise<StrapiItem<Gallery>[]>` — tag: `['gallery']`
   - `fetchCertifications(): Promise<StrapiItem<Certification>[]>` — tag: `['certifications']`
   - `fetchEngagements(featured?: boolean): Promise<StrapiItem<EngagementAndActivity>[]>` — populate gallery_items, tag: `['engagements']`

5. UTILITY: EXPIRY FILTER
   Create `lib/utils/filterExpiredCertifications.ts`:
   - Export function `filterExpiredCertifications(certs: StrapiItem<Certification>[]): StrapiItem<Certification>[]`
   - Filters out any certification where `expiryDate` is present AND is before `new Date()` (today)
   - Write this as a pure function with no side effects

6. UTILITY: SKILLS GROUPER
   Create `lib/utils/groupSkillsByCategory.ts`:
   - Export function `groupSkillsByCategory(skills: StrapiItem<SkillsMatrix>[]): Record<SkillCategory, StrapiItem<SkillsMatrix>[]>`
   - Groups the flat array into an object keyed by `category`

TESTING:
- Create `lib/utils/__tests__/filterExpiredCertifications.test.ts` using Jest (or Vitest — whichever is configured by create-next-app):
  - Test: cert with no expiryDate → included
  - Test: cert with future expiryDate → included
  - Test: cert with past expiryDate → excluded
  - Test: empty array → empty array returned
- Create `lib/utils/__tests__/groupSkillsByCategory.test.ts`:
  - Test: skills from two categories are correctly split into separate keys
  - Test: empty array returns empty object
- Run tests: `npm test` and confirm all pass

OUTPUT:
Provide complete file contents for:
- `.env.local.example`
- `lib/env.ts`
- `lib/types.ts`
- `lib/strapi.ts`
- `lib/api.ts`
- `lib/utils/filterExpiredCertifications.ts`
- `lib/utils/groupSkillsByCategory.ts`
- `lib/utils/__tests__/filterExpiredCertifications.test.ts`
- `lib/utils/__tests__/groupSkillsByCategory.test.ts`
```

---

### Prompt 5 — Root Layout, Navigation & SPA Page Shell

```text
You are a senior Next.js engineer building the presentation layer for a consultant portfolio. The data layer (lib/api.ts, lib/types.ts) is complete. Tailwind and shadcn/ui are configured.

TASK:
Build the root layout with a sticky navigation bar and the SPA scroll page shell (app/page.tsx). No section content yet — only the skeleton with correctly anchored section containers.

REQUIREMENTS:

1. ROOT LAYOUT (`app/layout.tsx`)
   Update to include:
   - `ThemeProvider` wrapping all children (already created)
   - Inter font from `next/font/google` applied via `className` on `<body>`
   - A `<Toaster />` component from shadcn/ui for global toast notifications, rendered inside `<body>` but outside page content
   - Metadata export:
     ```ts
     export const metadata: Metadata = {
       title: 'Lead Technical Consultant',
       description: 'Senior technical consultant specializing in scalable web architecture.',
     };
     ```

2. NAVIGATION COMPONENT (`components/layout/Navbar.tsx`)
   - Mark as `'use client'`
   - Sticky top navigation bar with `position: sticky; top: 0; z-index: 50`
   - Background: semi-transparent dark background with backdrop blur (`bg-background/80 backdrop-blur-sm`)
   - Left side: Name/logo text — "Your Name" styled in accent color, bold
   - Right side: anchor links as `<a href="#section-id">` tags (not Next.js Link, since these are same-page scroll anchors):
     - About (`#about`)
     - Skills (`#skills`)
     - Featured (`#featured`)
     - Certifications (`#certifications`)
     - Engagements (`#engagements`)
     - Contact link → routes to `/contact` using Next.js `<Link>`
   - Include the `ThemeToggle` component on the far right
   - Mobile: hamburger menu that shows/hides the nav links (use shadcn `Button` for the toggle, manage open state with `useState`)
   - Add a smooth scroll CSS rule to `globals.css`: `html { scroll-behavior: smooth; }`

3. FOOTER COMPONENT (`components/layout/Footer.tsx`)
   - Simple footer: centered text "© 2025 Your Name. Built with Next.js & Strapi."
   - Muted text color, small font size, `py-8` padding

4. SPA PAGE SHELL (`app/page.tsx`)
   - This is a React Server Component
   - Import `Navbar` and `Footer`
   - Render a vertically stacked page with these section containers in order, each with its corresponding `id`:
     ```tsx
     <main>
       <Navbar />
       <section id="hero">     {/* Hero section placeholder */}     </section>
       <section id="about">    {/* About preview placeholder */}   </section>
       <section id="skills">   {/* Skills matrix placeholder */}   </section>
       <section id="featured"> {/* Featured content placeholder */}</section>
       <section id="certifications">{/* Certs placeholder */}      </section>
       <section id="engagements">  {/* Engagements placeholder */} </section>
       <Footer />
     </main>
     ```
   - Each placeholder section should render a visually distinct empty block with the section name as temporary text (e.g., `<p className="text-muted">Hero Section</p>`) so layout is verifiable before content is wired
   - Apply consistent section padding: `py-20 px-4 md:px-8 lg:px-16 max-w-6xl mx-auto` as a wrapper inside each section

5. SECTION WRAPPER COMPONENT (`components/layout/SectionWrapper.tsx`)
   - A reusable component accepting props: `id: string`, `className?: string`, `children: React.ReactNode`
   - Renders: `<section id={id} className="py-20"><div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-16 {className}">{children}</div></section>`
   - Use this in `app/page.tsx` instead of raw `<section>` tags

TESTING:
- Run `npm run dev` and navigate to `http://localhost:3000`
- Confirm the sticky navbar appears and remains fixed while scrolling
- Confirm clicking each anchor link smoothly scrolls to the correct section placeholder
- Confirm the `/contact` link navigates away correctly (even though the page doesn't exist yet, Next.js should show a 404 gracefully)
- Confirm ThemeToggle switches theme correctly
- Run `npm run build` and confirm no TypeScript errors

OUTPUT:
Provide complete file contents for:
- `app/layout.tsx`
- `components/layout/Navbar.tsx`
- `components/layout/Footer.tsx`
- `components/layout/SectionWrapper.tsx`
- `app/page.tsx`
- Updated `app/globals.css` (add smooth scroll)
```

---

### Prompt 6 — Hero & About Preview Sections

```text
You are a senior Next.js engineer building content sections for a consultant portfolio. The SPA shell (app/page.tsx), SectionWrapper, Navbar, and Footer are complete. The data layer (lib/api.ts) is fully implemented.

TASK:
Build the Hero section and About preview section as server components, connected to live Strapi data via the existing fetch helpers.

REQUIREMENTS:

1. HERO SECTION COMPONENT (`components/sections/HeroSection.tsx`)
   - React Server Component (no 'use client')
   - Props: `aboutMe: AboutMe` (imported from `lib/types.ts`)
   - Layout: full-viewport-height centered column (`min-h-screen flex flex-col justify-center`)
   - Content:
     - A pre-heading label: "Lead Technical Consultant" in muted text, small caps
     - Main heading: A large, bold `<h1>` rendering `aboutMe.elevatorPitch` — use `text-4xl md:text-6xl font-bold leading-tight`
     - A horizontal `<Separator />` from shadcn/ui below the heading
     - Social links row: map over `aboutMe.socialLinks` and render each as an icon + label anchor tag (`<a href={link.url} target="_blank" rel="noopener noreferrer">`)
       - Use a `getSocialIcon(platformName)` helper function defined in the same file that returns the appropriate lucide-react icon component (Linkedin, Github, Twitter, StackOverflow — note: StackOverflow isn't in lucide, use `ExternalLink` as fallback)
     - A CTA button: "View My Work" using shadcn `Button` (variant: outline) as an anchor tag pointing to `#featured`
     - A "Download CV" button using shadcn `Button` (variant: ghost), only rendered if `aboutMe.resumeFile` is not null, pointing to the Strapi media URL of the file
   - Subtle animated gradient background element (CSS only, no JS animation libraries): a blurred radial gradient orb positioned absolutely in the background using Tailwind's `bg-gradient-radial` equivalent via inline style

2. ABOUT PREVIEW SECTION (`components/sections/AboutPreviewSection.tsx`)
   - React Server Component
   - Props: `aboutMe: AboutMe`
   - Layout: two-column grid on desktop, single column on mobile (`grid md:grid-cols-2 gap-12 items-center`)
   - Left column:
     - Section label: "About" in accent color, small, uppercase tracking-widest
     - Heading: "Who I Am" — `text-3xl font-bold`
     - A 2–3 sentence excerpt from `professionalNarrative` — since this is Strapi Blocks (rich text), for the preview, render only the first paragraph's plain text. Write a helper `extractFirstParagraph(blocks: any[]): string` in `lib/utils/richTextHelpers.ts` that walks the Strapi blocks JSON to find the first paragraph and concatenate its text leaf nodes.
     - A "Read Full Story →" link using Next.js `<Link href="/about">` styled as an accent-colored text link
   - Right column:
     - A decorative card using shadcn `Card` displaying three quick stats as large numbers:
       - "10+ Years Experience"
       - "50+ Projects Delivered"
       - "15+ Technologies"
     - These are hardcoded display values (not from CMS) for this decorative element

3. WIRE INTO PAGE (`app/page.tsx`)
   - Import `fetchAboutMe` from `lib/api.ts`
   - Call `await fetchAboutMe()` at the top of the page server component
   - Replace the Hero placeholder with `<HeroSection aboutMe={aboutMe} />`
   - Replace the About placeholder with `<AboutPreviewSection aboutMe={aboutMe} />`
   - Wrap the data fetch in try/catch; if it fails, render a fallback UI (a simple `<p>Content temporarily unavailable.</p>`) for both sections

4. RICH TEXT HELPER
   Create `lib/utils/richTextHelpers.ts`:
   - Export `extractFirstParagraph(blocks: any[]): string`
   - Walk the Strapi Blocks JSON array, find the first node with `type === 'paragraph'`, and join its `children` text values

TESTING:
- With Strapi running and `AboutMe` seeded with data, run `npm run dev`
- Confirm the Hero section displays the elevator pitch from Strapi
- Confirm social links render with correct hrefs
- Confirm "Download CV" button only appears when a file is uploaded in Strapi
- Temporarily remove the `AboutMe` content in Strapi and confirm the fallback UI renders instead of crashing
- Add a unit test `lib/utils/__tests__/richTextHelpers.test.ts`:
  - Test `extractFirstParagraph` with a valid blocks array → returns correct text
  - Test with empty array → returns empty string
  - Test with no paragraph type → returns empty string
- Run `npm run build` with no errors

OUTPUT:
Provide complete file contents for:
- `components/sections/HeroSection.tsx`
- `components/sections/AboutPreviewSection.tsx`
- `lib/utils/richTextHelpers.ts`
- `lib/utils/__tests__/richTextHelpers.test.ts`
- Updated `app/page.tsx`
```

---

### Prompt 7 — Skills Matrix Section

```text
You are a senior Next.js engineer. The consultant portfolio SPA shell is complete with Hero and About sections wired to Strapi. The data layer, types, and utility functions are in place.

TASK:
Build the Skills Matrix section: a server-rendered component that fetches skills from Strapi, groups them by category, and renders them as styled badge groups.

REQUIREMENTS:

1. SKILL BADGE COMPONENT (`components/ui/SkillBadge.tsx`)
   - React Server Component
   - Props: `skillName: string`, `yearsOfExperience: number`
   - Renders a shadcn `Badge` (variant: secondary) containing:
     - The skill name as the primary text
     - A small superscript or subtle secondary span showing `{yearsOfExperience}yr` in muted text
   - Example output appearance: [ Next.js  3yr ]
   - Apply hover state: slight accent color border on hover using Tailwind `hover:border-accent`
   - Use `border border-transparent` as the base border so the hover transition is smooth

2. SKILLS CATEGORY BLOCK (`components/sections/SkillsCategoryBlock.tsx`)
   - React Server Component
   - Props: `category: SkillCategory`, `skills: StrapiItem<SkillsMatrix>[]`
   - Renders:
     - A category heading in muted uppercase text (`text-xs uppercase tracking-widest text-muted-foreground`)
     - A flex-wrap row of `SkillBadge` components for each skill in the category
   - Wrap in a shadcn `Card` with subtle padding

3. SKILLS MATRIX SECTION (`components/sections/SkillsMatrixSection.tsx`)
   - React Server Component
   - Props: `skills: StrapiItem<SkillsMatrix>[]`
   - Use `groupSkillsByCategory` utility (already implemented in `lib/utils/groupSkillsByCategory.ts`) to group skills
   - Render:
     - Section heading: "Technical Expertise" — `text-3xl font-bold`
     - Section sub-label: "Skills" in accent color, uppercase
     - A responsive grid of `SkillsCategoryBlock` components: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
     - Only render categories that have at least one skill (filter out empty keys)
     - Sort categories alphabetically for consistent rendering order

4. WIRE INTO PAGE (`app/page.tsx`)
   - Add `fetchSkillsMatrix()` call alongside existing data fetches
   - Replace the Skills section placeholder with `<SkillsMatrixSection skills={skills} />`
   - If the fetch fails or returns empty, render a fallback: `<p className="text-muted-foreground">Skills data unavailable.</p>`

TESTING:
- Add at least 6 skill entries in Strapi across at least 3 different categories
- Run `npm run dev` and confirm skills render grouped by category
- Confirm each badge shows the skill name and years of experience
- Confirm empty categories are not rendered (add a category with no skills by using Strapi filters to verify)
- Run `npm run build` with no TypeScript errors

OUTPUT:
Provide complete file contents for:
- `components/ui/SkillBadge.tsx`
- `components/sections/SkillsCategoryBlock.tsx`
- `components/sections/SkillsMatrixSection.tsx`
- Updated `app/page.tsx`
```

---

### Prompt 8 — Featured Content Hybrid Engine & Section

```text
You are a senior Next.js engineer. The consultant portfolio has Hero, About, and Skills sections working. The data layer is complete with all fetch helpers.

TASK:
Implement the Featured Content hybrid filter engine and its corresponding section. This engine checks for manually curated content in Strapi first, then falls back to the 5 newest isFeatured items across Blogs, Projects, and Engagements.

REQUIREMENTS:

1. FEATURED CONTENT TYPES
   Define a discriminated union in `lib/types.ts` (add to existing file):
   ```ts
   export type FeaturedContentItem =
     | { kind: 'blog'; data: StrapiItem<Blog> }
     | { kind: 'project'; data: StrapiItem<Project> }
     | { kind: 'engagement'; data: StrapiItem<EngagementAndActivity> };
   ```

2. HYBRID ENGINE (`lib/utils/buildFeaturedList.ts`)
   Export async function `buildFeaturedList(): Promise<FeaturedContentItem[]>`
   
   Logic:
   - Call `fetchFeaturedCurations()` to get `manuallyCuratedList`
   - If `manuallyCuratedList.length > 0`:
     - For each curated item, fetch the specific record by ID using a new fetch helper `fetchById`
     - Return the fetched items as `FeaturedContentItem[]` (max 5)
   - If `manuallyCuratedList` is empty:
     - Call `fetchBlogs({ featured: true })`, `fetchProjects({ featured: true })`, `fetchEngagements({ featured: true })` in parallel using `Promise.all`
     - Merge the results into a flat array of `FeaturedContentItem[]`
     - Sort by `publishedAt` or `eventDate` descending (most recent first)
     - Slice to max 5 items
   - Return the result
   
   Add to `lib/api.ts`:
   - `fetchBlogById(id: number): Promise<StrapiItem<Blog> | null>`
   - `fetchProjectById(id: number): Promise<StrapiItem<Project> | null>`
   - `fetchEngagementById(id: number): Promise<StrapiItem<EngagementAndActivity> | null>`

3. FEATURED CARD COMPONENT (`components/ui/FeaturedCard.tsx`)
   - React Server Component
   - Props: `item: FeaturedContentItem`
   - Renders a shadcn `Card` with:
     - A top label badge showing the kind: "Blog", "Project", or "Engagement" — each in a distinct accent color variant
     - The item title (extracted polymorphically from `item.data.attributes.title`)
     - A short descriptor: for Blog → "isExternal" flag shown as "External Post" if true; for Project → `leadershipRole`; for Engagement → formatted `eventDate`
     - A CTA link:
       - Blog + isExternal → `<a href={externalUrl} target="_blank">` — will later fire GA event
       - Blog + internal → `<Link href={/blog/${slug}}>`
       - Project → `<Link href={/case-studies/${slug}}>`
       - Engagement → no deep link, render a non-clickable card
   - Card hover effect: `hover:shadow-lg hover:border-accent/50 transition-all`

4. FEATURED SECTION (`components/sections/FeaturedSection.tsx`)
   - React Server Component
   - Props: `items: FeaturedContentItem[]`
   - Renders:
     - Section label: "Featured" in accent color
     - Section heading: "Selected Work & Insights"
     - A responsive grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
     - One `FeaturedCard` per item
     - If items array is empty: render "No featured content available." in muted text

5. WIRE INTO PAGE (`app/page.tsx`)
   - Import and call `buildFeaturedList()` (this is an async utility, call it like a fetch)
   - Replace Featured placeholder with `<FeaturedSection items={featuredItems} />`
   - Wrap in try/catch with fallback

TESTING:
- Create unit tests in `lib/utils/__tests__/buildFeaturedList.test.ts`:
  - Mock `fetchFeaturedCurations` to return an empty list → verify fallback path is triggered
  - Mock `fetchFeaturedCurations` to return 2 curated items → verify explicit fetch path is triggered with correct IDs
  - Mock all fetches to return data → verify merged result is sorted by date and capped at 5
- In Strapi, create 3 featured blogs, 2 featured projects, and verify only 5 appear
- Then add a manual curation override and verify those specific items appear instead
- Run `npm run build` with no errors

OUTPUT:
Provide complete file contents for:
- Updated `lib/types.ts` (FeaturedContentItem addition)
- `lib/utils/buildFeaturedList.ts`
- Updated `lib/api.ts` (fetchById helpers)
- `components/ui/FeaturedCard.tsx`
- `components/sections/FeaturedSection.tsx`
- Updated `app/page.tsx`
- `lib/utils/__tests__/buildFeaturedList.test.ts`
```

---

### Prompt 9 — Certifications & Engagements Sections

```text
You are a senior Next.js engineer. The consultant portfolio SPA has Hero, About, Skills, and Featured sections. Data layer and utilities are complete.

TASK:
Build the Certifications section (with server-side expiry filtering) and the Engagements section. Both connect to Strapi data and integrate into the SPA page.

REQUIREMENTS:

1. CERTIFICATION CARD (`components/ui/CertificationCard.tsx`)
   - React Server Component
   - Props: `cert: StrapiItem<Certification>`
   - Renders a shadcn `Card` containing:
     - Badge image using Next.js `<Image>` (width: 64, height: 64, objectFit: contain) — use `cert.attributes.badgeImage.data?.attributes?.url` prefixed with `env.strapiUrl` if the URL is relative
     - Certification title as bold text
     - Issuing body in muted text
     - A "Verify Credential →" anchor tag linking to `verificationUrl` (target: `_blank`) — this link will later receive a GA click tracking attribute
     - If `expiryDate` is present, show a formatted expiry date below in muted small text: "Expires: Jan 2026" (use `new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(new Date(expiryDate))`)

2. CERTIFICATIONS SECTION (`components/sections/CertificationsSection.tsx`)
   - React Server Component
   - Props: `certifications: StrapiItem<Certification>[]`
   - Uses `filterExpiredCertifications` utility (already in `lib/utils/filterExpiredCertifications.ts`) on the incoming array before rendering
   - Renders:
     - Section label: "Credentials" in accent color
     - Section heading: "Active Certifications"
     - A responsive grid: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`
     - One `CertificationCard` per filtered certification
     - If the filtered list is empty: "No active certifications on record."

3. ENGAGEMENT CARD (`components/ui/EngagementCard.tsx`)
   - React Server Component
   - Props: `engagement: StrapiItem<EngagementAndActivity>`
   - Renders a shadcn `Card`:
     - Formatted `eventDate` as a header label (e.g., "March 2024") in accent color, small text
     - Title as bold text
     - First paragraph of `description` rich text (use `extractFirstParagraph` from `lib/utils/richTextHelpers.ts`)
     - If `gallery_items.data` has items, show a small count badge: "📷 3 Photos" using shadcn `Badge`

4. ENGAGEMENTS SECTION (`components/sections/EngagementsSection.tsx`)
   - React Server Component
   - Props: `engagements: StrapiItem<EngagementAndActivity>[]`
   - Renders:
     - Section label: "Activities" in accent color
     - Section heading: "Speaking & Engagements"
     - A vertical stacked list layout (not grid) with `space-y-6` — engagements are more narrative than grid items
     - One `EngagementCard` per engagement
     - Sort by `eventDate` descending within the component (most recent first)
     - Empty state: "No engagements recorded yet."

5. WIRE INTO PAGE (`app/page.tsx`)
   - Add `fetchCertifications()` and `fetchEngagements()` calls (fetch in parallel with other calls using `Promise.all` where possible to avoid waterfalls)
   - Replace Certifications placeholder with `<CertificationsSection certifications={certifications} />`
   - Replace Engagements placeholder with `<EngagementsSection engagements={engagements} />`
   - Apply try/catch with fallbacks for both

6. PARALLEL FETCH OPTIMIZATION
   Refactor `app/page.tsx` to fetch all data in parallel:
   ```ts
   const [aboutMe, skills, featured, certifications, engagements] = await Promise.all([
     fetchAboutMe(),
     fetchSkillsMatrix(),
     buildFeaturedList(),
     fetchCertifications(),
     fetchEngagements(),
   ]);
   ```

TESTING:
- Add 3 certifications in Strapi: one with a past expiry date, one with a future expiry date, one with no expiry date
- Confirm only 2 appear on the frontend (the expired one is filtered out)
- Add 2 engagements with different event dates and confirm they render in reverse chronological order
- Add gallery items to one engagement and confirm the photo count badge appears
- Run `npm run build` with no errors

OUTPUT:
Provide complete file contents for:
- `components/ui/CertificationCard.tsx`
- `components/sections/CertificationsSection.tsx`
- `components/ui/EngagementCard.tsx`
- `components/sections/EngagementsSection.tsx`
- Updated `app/page.tsx` (parallel fetch refactor + new section wiring)
```

---

### Prompt 10 — About Page & Contact Page

```text
You are a senior Next.js engineer. The SPA home page with all sections is complete. Now build the two standalone route pages: /about and /contact.

TASK:
Build the full About page with rich text narrative and CV download, and the Contact page with a validated Server Action connected to the Resend API.

REQUIREMENTS:

1. RICH TEXT RENDERER (`components/ui/RichTextRenderer.tsx`)
   - React Server Component
   - Props: `blocks: any[]` (Strapi Blocks format)
   - Implement a recursive renderer that handles the following Strapi block types:
     - `paragraph` → `<p>` with appropriate prose classes
     - `heading` (level 1–3) → `<h1>`, `<h2>`, `<h3>` with bold styling
     - `list` (ordered/unordered) → `<ol>` or `<ul>` with `<li>` children
     - `quote` → `<blockquote>` with left accent border style
     - `code` → `<pre><code>` with monospace font and dark background
     - For inline formatting on text nodes: `bold` → `<strong>`, `italic` → `<em>`, `underline` → `<u>`
   - Wrap the entire output in a `<div className="prose prose-invert max-w-none">` (requires `@tailwindcss/typography` plugin — install it and add to tailwind.config.ts plugins)

2. ABOUT PAGE (`app/about/page.tsx`)
   - React Server Component
   - Fetch: `await fetchAboutMe()`
   - Page metadata:
     ```ts
     export async function generateMetadata(): Promise<Metadata> {
       const aboutMe = await fetchAboutMe();
       return { title: 'About | Lead Technical Consultant', description: aboutMe.elevatorPitch };
     }
     ```
   - Layout:
     - Render `<Navbar />` at top
     - A page header section:
       - Back link: `<Link href="/">← Back to Home</Link>` in muted text
       - Page title: "About Me" — `text-4xl font-bold`
       - Elevator pitch as subtitle in muted text
     - Full professional narrative rendered with `<RichTextRenderer blocks={aboutMe.professionalNarrative} />`
     - A "Download CV" button section at the bottom:
       - Only renders if `aboutMe.resumeFile` is not null
       - shadcn `Button` as an anchor tag pointing to the Strapi media URL with `download` attribute
       - Label: "Download Full CV (PDF)"
     - Social links row (reuse the same pattern from HeroSection — extract to a shared component)
     - Render `<Footer />` at the bottom

3. SOCIAL LINKS COMPONENT (`components/ui/SocialLinks.tsx`)
   - Extract the social links rendering logic from `HeroSection.tsx` into this reusable server component
   - Props: `links: SocialLink[]`
   - Update `HeroSection.tsx` to import and use this component instead

4. CONTACT FORM COMPONENT (`components/sections/ContactForm.tsx`)
   - Mark as `'use client'`
   - Uses `useActionState` (React 19 / Next.js 15 pattern) or `useFormState` with the server action
   - Fields:
     - Name: shadcn `Input` with `Label`
     - Email: shadcn `Input` (type="email") with `Label`
     - Message: shadcn `Textarea` with `Label`
     - Submit: shadcn `Button` (type="submit"), label "Send Message"
   - Loading state: disable button and show spinner text "Sending..." while submission is in progress
   - On success: show a success toast via shadcn `useToast`: "Message sent! I'll be in touch soon."
   - On error: show an error toast with the error message returned from the server action

5. CONTACT SERVER ACTION (`lib/actions/sendContactEmail.ts`)
   - Mark with `'use server'`
   - Accept `prevState: any, formData: FormData`
   - Extract `name`, `email`, `message` from formData
   - Validate:
     - All fields must be non-empty strings
     - Email must match a basic regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
     - Return `{ success: false, error: 'Validation message' }` on failure
   - Send email via Resend SDK:
     ```ts
     const resend = new Resend(env.resendKey);
     await resend.emails.send({
       from: 'contact@yourdomain.com',
       to: 'you@yourdomain.com',
       subject: `Portfolio Contact: ${name}`,
       text: `From: ${name} <${email}>\n\n${message}`,
     });
     ```
   - Catch HTTP 429 from Resend → return `{ success: false, error: 'Service busy. Please reach out directly via LinkedIn.' }`
   - Catch other errors → return `{ success: false, error: 'Failed to send. Please try again.' }`
   - On success → return `{ success: true, error: null }`

6. CONTACT PAGE (`app/contact/page.tsx`)
   - React Server Component shell with client ContactForm inside
   - Metadata: `{ title: 'Contact | Lead Technical Consultant' }`
   - Layout:
     - `<Navbar />`
     - Centered content column (`max-w-2xl mx-auto`)
     - Heading: "Get In Touch"
     - Sub-text: "Whether you have a project in mind or just want to connect."
     - `<ContactForm />`
     - `<Footer />`

TESTING:
- Install `@tailwindcss/typography` and confirm prose styling renders correctly on the About page
- Test rich text renderer with a blocks array containing paragraphs, headings, and a list
- Test the Server Action directly:
  - Submit with empty name → confirm validation error returned
  - Submit with invalid email → confirm validation error returned
  - Submit with valid data → confirm Resend is called (mock Resend in test)
- Create `lib/actions/__tests__/sendContactEmail.test.ts`:
  - Test: empty fields → returns validation error
  - Test: invalid email → returns validation error
  - Test: Resend 429 → returns LinkedIn fallback message
- Run `npm run build` with no errors

OUTPUT:
Provide complete file contents for:
- `components/ui/RichTextRenderer.tsx`
- `app/about/page.tsx`
- `components/ui/SocialLinks.tsx`
- Updated `components/sections/HeroSection.tsx` (uses SocialLinks)
- `components/sections/ContactForm.tsx`
- `lib/actions/sendContactEmail.ts`
- `app/contact/page.tsx`
- `lib/actions/__tests__/sendContactEmail.test.ts`
- Updated `tailwind.config.ts` (typography plugin)
```

---

### Prompt 11 — Blog Dynamic Route & Dynamic Zone Renderer

```text
You are a senior Next.js engineer. The consultant portfolio has a complete SPA home page, About page, and Contact page. Now build the Blog dynamic route system.

TASK:
Build the [slug] dynamic route for blogs, including a Dynamic Zone block renderer that handles all four content block types, and external blog redirect logic.

REQUIREMENTS:

1. DYNAMIC ZONE BLOCK COMPONENTS
   Create one component per block type, all in `components/blocks/`:

   a) `HeroBlock.tsx` (Server Component)
      - Props: `block: Extract<ContentBlock, { __component: 'content.hero-block' }>`
      - Renders: a full-width image using Next.js `<Image>` with `priority` (if it's the first block) and an `<h1>` heading below it
      - Image source: construct the URL from block.image.data.attributes.url (prepend STRAPI_API_URL if relative)

   b) `TextBlock.tsx` (Server Component)
      - Props: `block: Extract<ContentBlock, { __component: 'content.text-block' }>`
      - Renders: `<RichTextRenderer blocks={block.body} />`

   c) `CodeBlock.tsx` (Server Component)
      - Props: `block: Extract<ContentBlock, { __component: 'content.code-block' }>`
      - Renders: a `<pre><code>` block with:
        - Dark background: `bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto`
        - A language label badge in the top-right corner of the block showing `block.language`
        - The raw `block.code` content as text (no syntax highlighting library needed in this step — use a `<code>` tag with `font-mono text-sm whitespace-pre`)
        - A "Copy" button (client component) — create `components/blocks/CopyButton.tsx` marked `'use client'` that uses `navigator.clipboard.writeText` on click, toggling its label from "Copy" to "Copied!" for 2 seconds

   d) `CalloutBox.tsx` (Server Component)
      - Props: `block: Extract<ContentBlock, { __component: 'content.callout-box' }>`
      - Renders a styled callout box based on `block.variant`:
        - `Info` → blue left border, blue-tinted background, ℹ️ icon
        - `Warning` → yellow left border, yellow-tinted background, ⚠️ icon
        - `Success` → green left border, green-tinted background, ✅ icon
      - Displays `block.content` as text

2. DYNAMIC ZONE RENDERER (`components/blocks/DynamicZoneRenderer.tsx`)
   - React Server Component
   - Props: `blocks: ContentBlock[]`
   - Maps over each block and renders the correct component based on `block.__component`
   - Wrap each block render in an individual error boundary (`components/blocks/BlockErrorBoundary.tsx` — a client component using React `ErrorBoundary` pattern) so a single block failure does not crash the entire page
   - Unknown `__component` values: render nothing (skip silently)

3. BLOCK ERROR BOUNDARY (`components/blocks/BlockErrorBoundary.tsx`)
   - `'use client'` class component (React error boundaries must be class components)
   - Props: `children: React.ReactNode`
   - On error: render `<div className="text-muted-foreground border border-dashed rounded p-4">Content block unavailable.</div>`

4. BLOG SLUG PAGE (`app/blog/[slug]/page.tsx`)
   - React Server Component
   - `generateStaticParams`: fetch all blogs and return their slugs for static generation
     ```ts
     export async function generateStaticParams() {
       const blogs = await fetchBlogs();
       return blogs.map(b => ({ slug: b.attributes.slug }));
     }
     ```
   - `generateMetadata`: fetch blog by slug, return `{ title, description: first paragraph of contentBlocks }` — use `extractFirstParagraph` from rich text helpers
   - Page logic:
     - Fetch blog by slug: `await fetchBlogBySlug(params.slug)`
     - If blog not found: `notFound()` from `next/navigation`
     - If `blog.attributes.isExternal && blog.attributes.externalUrl`:
       - Use `redirect(blog.attributes.externalUrl)` from `next/navigation` — this handles the external routing at the server level
     - Otherwise render the full internal blog layout:
       - `<Navbar />`
       - Blog title as `<h1>`
       - Published date formatted as "January 15, 2025"
       - `<DynamicZoneRenderer blocks={blog.attributes.contentBlocks} />`
       - `<Footer />`
   - Apply `max-w-3xl mx-auto px-4 py-12` to the content container

TESTING:
- Create two test blogs in Strapi:
  1. An internal blog with at least one of each block type (HeroBlock, TextBlock, CodeBlock, CalloutBox)
  2. An external blog with `isExternal: true` and an `externalUrl` (e.g., a real URL)
- Confirm the internal blog renders all blocks
- Confirm the external blog redirects to the externalUrl
- Confirm navigating to `/blog/non-existent-slug` shows a 404 page
- Test BlockErrorBoundary by temporarily throwing an error inside TextBlock and confirming the rest of the page renders
- Run `npm run build` and confirm static params generate correctly

OUTPUT:
Provide complete file contents for:
- `components/blocks/HeroBlock.tsx`
- `components/blocks/TextBlock.tsx`
- `components/blocks/CodeBlock.tsx`
- `components/blocks/CopyButton.tsx`
- `components/blocks/CalloutBox.tsx`
- `components/blocks/DynamicZoneRenderer.tsx`
- `components/blocks/BlockErrorBoundary.tsx`
- `app/blog/[slug]/page.tsx`
```

---

### Prompt 12 — Case Study Dynamic Route

```text
You are a senior Next.js engineer. Blog dynamic routes are complete. Now build the Case Study ([slug]) dynamic route for project deep-dives.

TASK:
Build the /case-studies/[slug] dynamic route that renders full project case studies with rich text content and linked skills matrix references.

REQUIREMENTS:

1. SKILLS REFERENCE LIST (`components/ui/SkillsReferenceList.tsx`)
   - React Server Component
   - Props: `skills: StrapiItem<SkillsMatrix>[]`
   - Renders a horizontal flex-wrap list of skill names as small `Badge` components (variant: outline)
   - Label above: "Technologies Used" in muted uppercase text
   - This component is used on the case study page to show the linked skills

2. CASE STUDY LAYOUT (`components/sections/CaseStudyLayout.tsx`)
   - React Server Component
   - Props: `project: StrapiItem<Project>`
   - Layout structure:
     - Page header:
       - Back link: `<Link href="/#featured">← Back</Link>`
       - Leadership role badge: shadcn `Badge` with `leadershipRole` text
       - Title: `<h1 className="text-4xl font-bold">`
       - Published date: formatted from `publishedAt`
     - Two content sections side by side on desktop (`grid md:grid-cols-5 gap-12`):
       - Left (3/5 width): full rich text content rendered in two parts:
         - A `<h2>The Challenge</h2>` heading followed by `<RichTextRenderer blocks={project.attributes.challenge} />`
         - A `<h2>The Solution</h2>` heading followed by `<RichTextRenderer blocks={project.attributes.solution} />`
       - Right (2/5 width): a sticky sidebar (`sticky top-24`) containing:
         - `<SkillsReferenceList skills={project.attributes.skills_matrices.data} />`
         - A shadcn `Separator`
         - Leadership role detail card (muted card with key info)

3. CASE STUDY SLUG PAGE (`app/case-studies/[slug]/page.tsx`)
   - React Server Component
   - `generateStaticParams`:
     ```ts
     export async function generateStaticParams() {
       const projects = await fetchProjects();
       return projects.map(p => ({ slug: p.attributes.slug }));
     }
     ```
   - `generateMetadata`: return `{ title: '{project.title} | Case Study', description: project.attributes.leadershipRole }`
   - Page logic:
     - Fetch: `await fetchProjectBySlug(params.slug)` — use the existing helper which populates `skills_matrices`
     - If not found: `notFound()`
     - Render:
       - `<Navbar />`
       - `<CaseStudyLayout project={project} />`
       - `<Footer />`

4. STRAPI POPULATE FIX
   - Verify that `fetchProjectBySlug` in `lib/api.ts` includes `populate[skills_matrices][fields][0]=skillName&populate[skills_matrices][fields][1]=category&populate[skills_matrices][fields][2]=yearsOfExperience` in the query string so nested skill data arrives populated
   - Update the fetch helper if needed

TESTING:
- Create 2 project entries in Strapi with:
  - Full challenge and solution rich text (at least 2 paragraphs each)
  - 3–4 linked SkillsMatrix entries
- Navigate to `/case-studies/[slug]` and confirm:
  - Challenge and Solution sections render with proper typography
  - Linked skills appear in the sidebar list
  - Back link scrolls to the featured section
- Navigate to `/case-studies/non-existent` and confirm 404 page appears
- Run `npm run build` and confirm `generateStaticParams` generates correct paths

OUTPUT:
Provide complete file contents for:
- `components/ui/SkillsReferenceList.tsx`
- `components/sections/CaseStudyLayout.tsx`
- `app/case-studies/[slug]/page.tsx`
- Updated `lib/api.ts` (corrected populate for fetchProjectBySlug if needed)
```

---

### Prompt 13 — On-Demand Revalidation Webhook

```text
You are a senior Next.js engineer. All pages and routes are built. Now implement the on-demand cache revalidation system that allows Strapi to trigger frontend cache clearing on content publish.

TASK:
Build the secure /api/revalidate route handler that accepts POST requests from Strapi webhooks, validates an auth token, and revalidates the appropriate Next.js cache tags.

REQUIREMENTS:

1. REVALIDATION ROUTE HANDLER (`app/api/revalidate/route.ts`)
   Implement the following:

   ```ts
   import { NextRequest, NextResponse } from 'next/server';
   import { revalidateTag } from 'next/cache';

   const MODEL_TO_TAG_MAP: Record<string, string[]> = {
     'about-me': ['about-me'],
     'featured-curation': ['featured-curations'],
     'skills-matrix': ['skills-matrix'],
     project: ['projects'],
     blog: ['blogs'],
     gallery: ['gallery'],
     certification: ['certifications'],
     'engagement-and-activity': ['engagements'],
   };

   export async function POST(request: NextRequest) {
     // 1. Auth check
     const authHeader = request.headers.get('authorization');
     if (authHeader !== `Bearer ${process.env.REVALIDATION_SECRET_TOKEN}`) {
       return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
     }

     // 2. Parse body
     let body: { model?: string };
     try {
       body = await request.json();
     } catch {
       return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
     }

     // 3. Revalidate
     const { model } = body;
     if (!model || !MODEL_TO_TAG_MAP[model]) {
       return NextResponse.json({ message: 'Unknown or missing model type' }, { status: 400 });
     }

     const tags = MODEL_TO_TAG_MAP[model];
     tags.forEach(tag => revalidateTag(tag));

     return NextResponse.json({ revalidated: true, tags, now: Date.now() });
   }
   ```

2. ENVIRONMENT VARIABLE
   - Confirm `REVALIDATION_SECRET_TOKEN` is in `.env.local`
   - Document: this same token value must be pasted into the Strapi webhook Authorization header field

3. STRAPI WEBHOOK CONFIGURATION (Document these steps)
   - In Strapi admin: Settings → Webhooks → Add new webhook
   - Name: "Next.js Revalidation"
   - URL: `https://your-production-domain.com/api/revalidate` (or `http://localhost:3000/api/revalidate` for local dev)
   - Events: check all `Entry` events (Create, Update, Delete, Publish, Unpublish) for each collection type
   - Headers: add `Authorization: Bearer YOUR_TOKEN_VALUE`
   - Save and use "Test webhook" button to verify connectivity

4. SLUG-LEVEL REVALIDATION (Enhancement)
   - Update the route handler to also accept an optional `slug` field in the body
   - If present, additionally call `revalidateTag(slug)` to clear the per-slug cache tags used by `fetchBlogBySlug` and `fetchProjectBySlug`

TESTING:
- Create integration test `app/api/revalidate/__tests__/route.test.ts`:
  - Test: POST with no auth header → 401
  - Test: POST with wrong token → 401
  - Test: POST with correct token but no body model → 400
  - Test: POST with correct token and `model: 'blog'` → 200, revalidateTag called with 'blogs'
  - Test: POST with unknown model → 400
  - Use Jest mocking to mock `revalidateTag` from `next/cache`
- Manual test: With Next.js running, use curl to POST a valid request:
  ```
  curl -X POST http://localhost:3000/api/revalidate \
    -H "Authorization: Bearer your_token" \
    -H "Content-Type: application/json" \
    -d '{"model": "blog"}'
  ```
  Confirm `{"revalidated": true}` is returned
- Run `npm run build` with no errors

OUTPUT:
Provide complete file contents for:
- `app/api/revalidate/route.ts`
- `app/api/revalidate/__tests__/route.test.ts`
- Step-by-step Strapi webhook configuration instructions
```

---

### Prompt 14 — Google Analytics 4 & Custom Event Tracking

```text
You are a senior Next.js engineer. The platform is functionally complete. Now integrate Google Analytics 4 with custom event tracking for external blog clicks and certification verification clicks.

TASK:
Set up GA4 via @next/third-parties and implement custom event tracking for two specific user interactions.

REQUIREMENTS:

1. GA4 BASE SETUP
   - Install `@next/third-parties` if not already present (it ships with Next.js 15+ but confirm)
   - In `app/layout.tsx`, import `GoogleAnalytics` from `@next/third-parties/google` and add it inside `<body>` after the Toaster:
     ```tsx
     import { GoogleAnalytics } from '@next/third-parties/google';
     // ...
     <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!} />
     ```
   - This should only load in production. Add the conditional:
     ```tsx
     {process.env.NODE_ENV === 'production' && (
       <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!} />
     )}
     ```

2. ANALYTICS UTILITY (`lib/utils/analytics.ts`)
   - Mark as client-safe (no 'use server' — this runs in the browser)
   - Export two functions:
   
   ```ts
   export function trackExternalBlogClick(blogTitle: string, externalUrl: string) {
     if (typeof window !== 'undefined' && window.gtag) {
       window.gtag('event', 'external_blog_click', {
         blog_title: blogTitle,
         external_url: externalUrl,
       });
     }
   }

   export function trackCertificationVerificationClick(certTitle: string, verificationUrl: string) {
     if (typeof window !== 'undefined' && window.gtag) {
       window.gtag('event', 'certification_verification_click', {
         cert_title: certTitle,
         verification_url: verificationUrl,
       });
     }
   }
   ```
   - Add a TypeScript declaration to handle `window.gtag`:
     ```ts
     declare global {
       interface Window {
         gtag: (...args: any[]) => void;
       }
     }
     ```

3. EXTERNAL BLOG CLICK TRACKING
   - `FeaturedCard.tsx` currently renders an `<a>` tag for external blogs
   - Convert `FeaturedCard.tsx` to `'use client'` to enable the click handler
   - Add an `onClick` handler to the external blog anchor:
     ```tsx
     onClick={() => trackExternalBlogClick(item.data.attributes.title, item.data.attributes.externalUrl!)}
     ```

4. CERTIFICATION VERIFICATION CLICK TRACKING
   - `CertificationCard.tsx` currently renders a "Verify Credential" anchor
   - Convert `CertificationCard.tsx` to `'use client'`
   - Add an `onClick` handler to the verification anchor:
     ```tsx
     onClick={() => trackCertificationVerificationClick(cert.attributes.title, cert.attributes.verificationUrl)}
     ```

5. GA4 TYPES
   - Note that `window.gtag` typing is declared in `lib/utils/analytics.ts` — confirm this doesn't conflict with any existing type declarations in the project. If `@types/gtag.js` is available, optionally install it for stronger typing.

TESTING:
- Since GA4 only fires in production, test using the browser console in development:
  - Temporarily remove the `NODE_ENV` production guard
  - Click an external blog card and confirm `window.gtag` is called with event `external_blog_click` (add a `console.log` inside `trackExternalBlogClick` for dev verification)
  - Click a "Verify Credential" link and confirm the event fires
  - Re-add the production guard after testing
- Confirm the GA script tag does NOT appear in the page source during `npm run dev`
- Confirm it DOES appear after `npm run build && npm run start`
- Run `npm run build` with no errors

OUTPUT:
Provide complete file contents for:
- Updated `app/layout.tsx` (GA4 integration)
- `lib/utils/analytics.ts`
- Updated `components/ui/FeaturedCard.tsx` (external blog click tracking)
- Updated `components/ui/CertificationCard.tsx` (verification click tracking)
```

---

### Prompt 15 — Error Handling, Fallbacks & Production Hardening

```text
You are a senior Next.js engineer finalizing a production consultant portfolio platform. All features are built. Now add robust error handling, global error boundaries, and production hardening.

TASK:
Implement Next.js error boundaries, global error pages, CMS-down fallbacks, and verify all edge cases from the error handling matrix in the specification.

REQUIREMENTS:

1. GLOBAL ERROR PAGE (`app/error.tsx`)
   - `'use client'` (required by Next.js for error.tsx)
   - Props: `{ error: Error & { digest?: string }; reset: () => void }`
   - Renders a centered error page:
     - Heading: "Something went wrong"
     - Muted text: "An unexpected error occurred. Please try again."
     - A shadcn `Button` that calls `reset()` on click: "Try Again"
     - A `<Link href="/">Return Home</Link>`
   - Do not expose `error.message` to the user in production

2. NOT FOUND PAGE (`app/not-found.tsx`)
   - Renders a friendly 404 page:
     - Large "404" display text in muted color
     - "Page Not Found" heading
     - `<Link href="/">Return Home</Link>` as a shadcn Button
     - Include `<Navbar />` and `<Footer />`

3. CMS DOWN FALLBACK (Update `app/page.tsx`)
   - The existing `Promise.all` fetch in page.tsx will throw if any fetch fails
   - Refactor to use `Promise.allSettled` instead, so one failing fetch doesn't block all sections:
     ```ts
     const [aboutResult, skillsResult, featuredResult, certsResult, engagementsResult] =
       await Promise.allSettled([
         fetchAboutMe(),
         fetchSkillsMatrix(),
         buildFeaturedList(),
         fetchCertifications(),
         fetchEngagements(),
       ]);
     
     const aboutMe = aboutResult.status === 'fulfilled' ? aboutResult.value : null;
     // ...repeat for each
     ```
   - Pass `null` values to section components and update each section component to handle a `null` prop gracefully by rendering a fallback UI
   - Each section component should accept its data prop as `T | null` and render `<SectionUnavailable />` if null

4. SECTION UNAVAILABLE COMPONENT (`components/ui/SectionUnavailable.tsx`)
   - Simple server component
   - Props: `sectionName: string`
   - Renders: `<div className="text-center py-12 text-muted-foreground">⚠️ {sectionName} data is temporarily unavailable. Please check back later.</div>`

5. UPDATE SECTION COMPONENTS
   Update the following components to accept nullable props and use `SectionUnavailable` when null:
   - `HeroSection`: `aboutMe: AboutMe | null`
   - `AboutPreviewSection`: `aboutMe: AboutMe | null`
   - `SkillsMatrixSection`: `skills: StrapiItem<SkillsMatrix>[] | null`
   - `FeaturedSection`: `items: FeaturedContentItem[] | null`
   - `CertificationsSection`: `certifications: StrapiItem<Certification>[] | null`
   - `EngagementsSection`: `engagements: StrapiItem<EngagementAndActivity>[] | null`

6. CONTACT FORM 429 HANDLING (Verify)
   - Confirm the existing `sendContactEmail` server action already handles 429 responses
   - Add test coverage if not already present for the LinkedIn fallback message

7. SECURITY AUDIT
   - Confirm in `lib/env.ts` that `STRAPI_API_TOKEN`, `REVALIDATION_SECRET_TOKEN`, and `RESEND_API_KEY` are all server-only variables (no `NEXT_PUBLIC_` prefix)
   - Add a runtime check at module initialization in `lib/env.ts`:
     ```ts
     if (typeof window !== 'undefined') {
       throw new Error('lib/env.ts must only be used on the server');
     }
     ```
   - Run `npm run build` and check the build output for any warnings about server-only modules leaking to the client bundle

8. IMAGE DOMAIN CONFIGURATION
   - In `next.config.ts`, add Strapi's domain to `images.remotePatterns`:
     ```ts
     images: {
       remotePatterns: [
         { protocol: 'http', hostname: 'localhost', port: '1337', pathname: '/uploads/**' },
         { protocol: 'https', hostname: 'your-strapi-production-domain.com', pathname: '/uploads/**' },
       ],
     }
     ```

TESTING:
- Test CMS-down fallback: stop the Strapi server and load the home page. Confirm sections that fail show the unavailable message while others may still work from cached data.
- Navigate to a non-existent route and confirm the custom 404 page appears
- Trigger the global error page by temporarily throwing in a server component
- Confirm `npm run build` emits no warnings about secret environment variables in the client bundle
- Verify all existing tests still pass after the nullable prop changes

OUTPUT:
Provide complete file contents for:
- `app/error.tsx`
- `app/not-found.tsx`
- `components/ui/SectionUnavailable.tsx`
- Updated `app/page.tsx` (Promise.allSettled refactor)
- Updated section components (nullable props): HeroSection, AboutPreviewSection, SkillsMatrixSection, FeaturedSection, CertificationsSection, EngagementsSection
- Updated `lib/env.ts` (server-only guard)
- `next.config.ts`
```

---

### Prompt 16 — Final Integration Testing & Lighthouse Audit

```text
You are a senior Next.js engineer completing a production consultant portfolio platform. All features, error handling, and integrations are in place. This is the final step: a complete testing pass.

TASK:
Write the remaining integration tests, run a full test suite, and produce a Lighthouse performance checklist. Wire any remaining loose ends.

REQUIREMENTS:

1. COMPLETE TEST SUITE AUDIT
   Ensure tests exist for the following. Implement any that are missing:

   Unit Tests:
   - `filterExpiredCertifications`: all cases (already done in Prompt 4)
   - `groupSkillsByCategory`: all cases (already done in Prompt 4)
   - `extractFirstParagraph` / `richTextHelpers`: all cases (already done in Prompt 6)
   - `buildFeaturedList`: curated path + fallback path (done in Prompt 8)
   - `sendContactEmail` server action: validation and 429 handling (done in Prompt 10)

   Integration Tests:
   - `/api/revalidate` route: all cases (done in Prompt 13)

   NEW — Component Smoke Tests (using React Testing Library):
   Create `components/ui/__tests__/SkillBadge.test.tsx`:
   - Renders skill name and years of experience
   - Snapshot test for badge structure

   Create `components/ui/__tests__/CertificationCard.test.tsx`:
   - Renders title, issuing body, and verification link
   - Does NOT render expired cert (pass a past date — note: filtering is done at the section level, so test the section instead)

   Create `components/sections/__tests__/CertificationsSection.test.tsx`:
   - Given a mix of expired and valid certs, only valid certs are rendered
   - Empty filtered list renders the empty state message

2. SITEMAP GENERATION (`app/sitemap.ts`)
   - Create a Next.js sitemap using the `MetadataRoute.Sitemap` type:
   ```ts
   import { fetchBlogs, fetchProjects } from '@/lib/api';
   import { MetadataRoute } from 'next';

   export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
     const [blogs, projects] = await Promise.all([fetchBlogs(), fetchProjects()]);
     
     const blogUrls = blogs
       .filter(b => !b.attributes.isExternal)
       .map(b => ({
         url: `https://yourdomain.com/blog/${b.attributes.slug}`,
         lastModified: new Date(b.attributes.publishedAt),
       }));
     
     const projectUrls = projects.map(p => ({
       url: `https://yourdomain.com/case-studies/${p.attributes.slug}`,
       lastModified: new Date(p.attributes.publishedAt),
     }));

     return [
       { url: 'https://yourdomain.com', lastModified: new Date() },
       { url: 'https://yourdomain.com/about', lastModified: new Date() },
       { url: 'https://yourdomain.com/contact', lastModified: new Date() },
       ...blogUrls,
       ...projectUrls,
     ];
   }
   ```

3. ROBOTS.TXT (`app/robots.ts`)
   ```ts
   import { MetadataRoute } from 'next';
   export default function robots(): MetadataRoute.Robots {
     return {
       rules: { userAgent: '*', allow: '/', disallow: '/api/' },
       sitemap: 'https://yourdomain.com/sitemap.xml',
     };
   }
   ```

4. OPEN GRAPH METADATA
   Update `app/layout.tsx` metadata export to include OpenGraph fields:
   ```ts
   export const metadata: Metadata = {
     title: { default: 'Lead Technical Consultant', template: '%s | Lead Technical Consultant' },
     description: 'Senior technical consultant specializing in scalable web architecture.',
     openGraph: {
       type: 'website',
       locale: 'en_US',
       url: 'https://yourdomain.com',
       siteName: 'Lead Technical Consultant',
     },
     twitter: { card: 'summary_large_image' },
   };
   ```

5. LIGHTHOUSE CHECKLIST
   After running `npm run build && npm run start`, open Chrome DevTools → Lighthouse and run an audit on:
   - Home page (`/`)
   - About page (`/about`)
   - A blog slug page
   - A case study page

   Document the results and confirm:
   - Performance ≥ 95
   - Accessibility ≥ 95
   - SEO ≥ 95
   - Best Practices ≥ 95

   Common fixes if scores are below target:
   - Performance: Ensure all images use `next/image`, add `priority` to above-the-fold images
   - Accessibility: All interactive elements must have `aria-label` where text is absent; check color contrast ratios
   - SEO: Every page must have a unique `<title>` and `<meta name="description">`; sitemap must be accessible

6. FINAL BUILD VERIFICATION
   - Run `npm run lint` — fix all ESLint warnings
   - Run `npm run type-check` (add to package.json scripts: `"type-check": "tsc --noEmit"`) — fix all TypeScript errors
   - Run `npm test` — all tests must pass
   - Run `npm run build` — build must complete with no errors and no warnings about secret leakage

OUTPUT:
Provide complete file contents for:
- `components/ui/__tests__/SkillBadge.test.tsx`
- `components/sections/__tests__/CertificationsSection.test.tsx`
- `app/sitemap.ts`
- `app/robots.ts`
- Updated `app/layout.tsx` (OpenGraph metadata)
- Updated `package.json` scripts section (add type-check)
- A written Lighthouse audit checklist document (as a markdown section, not a file) confirming what to verify and how to fix common issues
```

---

## Summary: Prompt Sequence Reference

| Prompt | Builds | Tests |
|---|---|---|
| 1 | Scaffold, Tailwind, shadcn/ui, dark mode | Build passes, theme toggle works |
| 2 | Strapi: Single Types + API token | API returns seeded data |
| 3 | Strapi: All Collection Types | Schema compiles, test entries queryable |
| 4 | TypeScript types, API client, fetch helpers, utils | Unit tests: expiry filter, skills grouper |
| 5 | Root layout, Navbar, Footer, SPA shell | Scroll anchors, sticky nav, build passes |
| 6 | Hero + About preview sections, wired to data | Strapi data renders, fallback on CMS down |
| 7 | Skills Matrix section | Category grouping, badge display |
| 8 | Featured hybrid engine + section | Unit tests: curated/fallback logic |
| 9 | Certifications (expiry filter) + Engagements | Expired cert excluded, parallel fetches |
| 10 | About page, Contact page, Server Action, Resend | Action validation tests |
| 11 | Blog [slug], Dynamic Zone renderer | All block types render, external redirect |
| 12 | Case Study [slug], skills sidebar | Rich text, linked skills, 404 handling |
| 13 | /api/revalidate webhook endpoint | Integration tests: auth, model mapping |
| 14 | GA4 setup, custom event tracking | Events fire on click |
| 15 | Error boundaries, fallbacks, security audit | CMS-down resilience, secret audit |
| 16 | Full test suite, sitemap, robots, OG meta, Lighthouse | All tests pass, build clean, scores ≥ 95 |



Deployment Blueprint & Iterative Breakdown

Phase 1: Backend Code Reconfiguration (Local)
Step 1.1: Install production PostgreSQL and Cloudinary dependencies inside the /cms folder. 
Step 1.2: Implement a dynamic database router in config/database.js to switch between SQLite (local) and Neon Postgres (production) based on environment variables. Critically, cap the connection pool at 4 to prevent Neon free-tier crashes.
Step 1.3: Configure the Cloudinary provider in config/plugins.js to ensure the Render instance remains stateless.  


Phase 2: Frontend Resiliency (Local)
Step 2.1: Because Render free instances spin down after 15 minutes of inactivity , the frontend build script might hit a 30-60 second "cold start" delay when fetching data during a Vercel build. Implement a fetch utility with exponential backoff and retry logic to prevent build timeouts.  

Phase 3: CI/CD & Deployment Strategy
Step 3.1: Document and set the exact build commands and strict environment variables for Render (including NODE_OPTIONS=--max-old-space-size=400 to prevent OOM errors).  
Step 3.2: Configure the Vercel SSG deployment and generate a Deploy Hook.  
Step 3.3: Wire the Vercel Deploy Hook to the Strapi webhook UI, triggering on entry.publish and entry.unpublish.  


LLM Code-Generation Prompts
Prompt 1: Backend Database Configuration
You are an expert backend developer specializing in Strapi v5. We are working within a monorepo where the backend resides in the `/cms` directory. The backend will be deployed to Render's Free Web Service, and we are using Neon's serverless PostgreSQL for the production database. 

Please perform the following tasks using Test-Driven Development (TDD) principles where applicable:

1. Provide the exact `npm install` command to add the required PostgreSQL client package (`pg`) to the `/cms` directory.
2. Generate the complete code for `/cms/config/database.js` (or `.ts`). The code must dynamically route the database connection based on the `DATABASE_CLIENT` environment variable:
   - If `sqlite`, it should connect to a local SQLite file (used for local development).
   - If `postgres`, it should connect to the production Neon database using `DATABASE_URL`.
3. For the PostgreSQL configuration, you MUST set the connection pool limits using environment variables: `DATABASE_POOL_MIN` (default 2) and `DATABASE_POOL_MAX` (default 4). This strict maximum of 4 is required to prevent connection spikes from crashing the Neon free-tier limits. Include SSL configurations (`rejectUnauthorized: false`).
4. Write a brief Node.js test script using a testing framework like Jest to verify that the configuration object correctly switches between SQLite and Postgres based on mocked environment variables.


Prompt 2: Backend Media Storage Configuration
You are an expert backend developer specializing in Strapi v5. We are working within a monorepo where the backend resides in the `/cms` directory. The backend will be deployed to Render's Free Web Service, which has an ephemeral file system. Therefore, all media uploads must be routed to Cloudinary to make the backend stateless.

Please perform the following tasks using best practices:

1. Provide the exact `npm install` command to add the official Strapi Cloudinary provider (`@strapi/provider-upload-cloudinary`) to the `/cms` directory.
2. Generate the complete code for `/cms/config/plugins.js` (or `.ts`). This file must configure the upload provider to use Cloudinary.
3. Map the Cloudinary configuration dynamically using the following environment variables:
   - `CLOUDINARY_NAME`
   - `CLOUDINARY_KEY`
   - `CLOUDINARY_SECRET`
4. Provide a brief explanation of how to verify this integration locally by mocking these environment variables in a local `.env` file before pushing to production. Ensure the code seamlessly integrates with standard Strapi v5 plugin architecture.

Prompt 3: Frontend Resiliency & Fetch Utility
You are an expert frontend developer working on a decoupled Jamstack application. We are working within a monorepo where the frontend application resides in the `/profile` directory. The frontend will be deployed to Vercel and relies on Static Site Generation (SSG). It fetches data from a headless Strapi v5 API hosted on Render's Free tier.

Because Render's free tier spins down the server after 15 minutes of inactivity, API network requests made during the Vercel build step may experience a "cold start" timeout (up to 60 seconds).

Please perform the following tasks:

1. Write a resilient data-fetching utility function (e.g., `fetchStrapiData.ts` or `.js`) intended to be used during the Vercel SSG build step.
2. This function must implement explicit pre-flight network request loops with an exponential backoff retry mechanism. If the initial request fails or times out, it should retry multiple times with increasing delays to give the Render container enough time to wake up completely.
3. The utility should accept an endpoint path and utilize the `STRAPI_API_URL` and `STRAPI_API_TOKEN` environment variables for the request.
4. Write a comprehensive suite of unit tests for this utility using Jest or Vitest. The tests must simulate:
   - A successful immediate response.
   - A delayed response (simulating server wake-up) where the first two requests fail but the third succeeds.
   - A complete failure where all retries are exhausted.


Prompt 4: Deployment & Webhook Wiring Guide
You are an expert DevOps engineer specializing in Jamstack architectures, specifically deploying monorepos containing a Strapi v5 backend (`/cms`) and a frontend (`/profile`). The target infrastructure is Render (Free Web Service) for the backend and Vercel for the frontend.

Please generate a comprehensive, step-by-step markdown deployment guide and checklist for wiring this project together. The guide must include:

1. **Render Configuration:**
   - Root directory scoping (`/cms`).
   - Build and start commands.
   - A comprehensive table of all required environment variables (including database URIs, Cloudinary keys, and Strapi secure tokens).
   - Crucially, include the environment variable `NODE_OPTIONS=--max-old-space-size=400` and explain that it instructs the V8 engine to aggressively clean memory to prevent Out-Of-Memory (OOM) crashes on Render's 512MB RAM limit.

2. **Vercel Configuration:**
   - Root directory scoping (`/profile`).
   - Required environment variables (`STRAPI_API_URL`, `STRAPI_API_TOKEN`).

3. **Webhook Automation (SSG Loop):**
   - Step-by-step instructions on how to generate a Vercel Deploy Hook URL.
   - Step-by-step instructions on where to paste this URL inside the deployed Strapi Admin panel (Settings > Webhooks) and how to configure it to trigger only on `entry.publish` and `entry.unpublish` events.




   
   
   
   
   
LinkedIn Data Sync Extension Blueprint

---

## Architecture

- **Data store:** Strapi's existing `certification` and `engagement-and-activity` collections (Neon PostgreSQL). No new tables.
- **Sync endpoint:** A custom Strapi v5 route (`POST /api/sync-linkedin`) registered inside `cms/src/` using Strapi's policy/controller/route factory pattern.
- **Media pipeline:** LinkedIn badge images upload to Strapi's media library via `POST /api/upload` (Strapi proxies to Cloudinary via the existing upload provider). Post media uploads directly to Cloudinary via SDK, then stored as JSON URLs in the engagement record.
- **Cache invalidation:** The existing `/api/revalidate` route at `profile/app/api/revalidate/route.ts` handles `model: "certification"` → `certifications` tag and `model: "engagement-and-activity"` → `engagements` tag via `MODEL_TO_TAG_MAP`. No new tags or revalidation routes needed.
- **Frontend UI:** `CertificationsSection`, `CertificationCard`, `EngagementsSection`, and `EngagementCard` already exist. Only `EngagementCard` requires extension for the new `postUrl` and `mediaUrls` fields.

---

## Schema Changes — Additive Only, Zero Breaking Changes

### `EngagementAndActivity` — Fields to ADD

File: `cms/src/api/engagement-and-activity/content-types/engagement-and-activity/schema.json`

**Keep all existing fields unchanged:**
- `title` (String, required) — sync engine uses first 100 chars of LinkedIn post text as title
- `description` (Blocks, required) — sync engine creates a minimal Strapi Blocks paragraph structure from LinkedIn post plain text: `[{ type: "paragraph", children: [{ type: "text", text: "..." }] }]`
- `eventDate` (Date, required) — sync engine uses the LinkedIn post's `createdAt` date
- `isFeatured` (Boolean, default: false) — sync engine defaults to false; user manually promotes in Strapi admin
- `gallery_items` (Relation, many-to-many) — untouched for LinkedIn-sourced entries

**New additive fields:**
```json
"linkedinPostId": { "type": "string" },
"postUrl": { "type": "string" },
"mediaUrls": { "type": "json" },
"mediaType": {
  "type": "enumeration",
  "enum": ["Image", "Video", "Carousel", "ExternalLink"]
},
"linkPreviewCard": { "type": "json" }
```

Note: No `isPublished` field. Strapi's `draftAndPublish: true` already provides publish/draft toggle via `publishedAt`. The sync engine publishes records by posting to `?status=published` in the Strapi v5 API.

---

### `Certification` — Fields to ADD

File: `cms/src/api/certification/content-types/certification/schema.json`

**Existing fields (unchanged):**
- `title` (String, required)
- `issuingBody` (String, required)
- `badgeImage` (Media, required) — Strapi's Cloudinary upload provider handles this natively. The sync engine uploads badge images via `POST /api/upload` (multipart), receives a Strapi media ID, and passes that ID when creating the certification record.
- `verificationUrl` (String, required)
- `expiryDate` (Date, optional)

**New additive field:**
```json
"linkedinCertId": { "type": "string" }
```

`linkedinCertId` is the unique ID from Apify's LinkedIn scraper output used for deduplication. Title + issuingBody remains the human-readable composite key; `linkedinCertId` guards against re-importing if Apify changes text formatting. Strapi manages primary keys automatically; `draftAndPublish: true` already handles visibility.

---

## Round 1: High-Level Functional Chunks

1. **Schema Extension:** Add new fields to existing Strapi schemas (additive only).
2. **Media Extraction Asset Pipeline:** Utility to download ephemeral LinkedIn media and upload to Cloudinary directly; for badge images, upload via Strapi's `/api/upload` endpoint.
3. **Strapi REST API Client:** Thin client wrapping `fetch` calls to Strapi's REST API for upsert operations on certifications and engagements.
4. **Core Synchronization Engine:** Intelligent merge/dedup logic consuming the REST client and media pipeline.
5. **Strapi Custom Route:** Register `POST /api/sync-linkedin` inside the Strapi CMS with `X-Sync-Token` middleware.
6. **Next.js Vercel Cron Proxy:** `/api/cron/sync-linkedin` route in `profile/` proxies to the Strapi sync endpoint.
7. **Frontend UI Extension:** Extend `EngagementCard` to render `postUrl` and `mediaUrls`; no changes to `CertificationCard`.

## Round 2: Granular Step Sequence

Step 1: Extend Strapi schemas (additive fields) and rebuild CMS dist.
Step 2: Media pipeline utility — Cloudinary SDK for post media, Strapi upload API for badge images.
Step 3: Strapi REST API client — typed fetch wrappers for `engagement-and-activity` and `certification` upserts.
Step 4: Core sync engine — merge/dedup logic with full Vitest test coverage.
Step 5: Strapi custom route + `X-Sync-Token` middleware inside `cms/`.
Step 6: Next.js Vercel Cron proxy route in `profile/app/api/cron/sync-linkedin/route.ts`.
Step 7: `EngagementCard` UI extension for `postUrl` and `mediaUrls` fields.

---

## Developer LLM Prompts

Each prompt is self-contained with full file paths, interfaces, and TDD requirements aligned to the actual project stack (Strapi v5 / Next.js 16 App Router / Vitest).

---

### Prompt 1: Strapi Schema Extension + Strapi REST API Client

```
Context: You are extending an existing Strapi v5 CMS (monorepo at /cms) that manages a personal portfolio. The project uses Neon PostgreSQL via Strapi's database abstraction, Cloudinary for media via Strapi's upload provider, and Next.js 16 on the frontend. All data fetching on the frontend uses Strapi's REST API.

Two existing collection types need additive-only field additions. DO NOT remove or alter any existing field — only add new ones.

Task 1 — Extend cms/src/api/engagement-and-activity/content-types/engagement-and-activity/schema.json:
Add these fields to the existing `attributes` object:
- linkedinPostId: string (no unique constraint at schema level; dedup is handled in sync logic)
- postUrl: string
- mediaUrls: json
- mediaType: enumeration with values ["Image", "Video", "Carousel", "ExternalLink"]
- linkPreviewCard: json
Do NOT change title, description (blocks), eventDate, isFeatured, or gallery_items.
Do NOT add isPublished — Strapi's draftAndPublish: true already handles visibility.

Task 2 — Extend cms/src/api/certification/content-types/certification/schema.json:
Add this field to the existing `attributes` object:
- linkedinCertId: string
Do NOT change title, issuingBody, badgeImage (media type), verificationUrl, or expiryDate.
Do NOT add isPublished or badgeImageUrl — Strapi's draftAndPublish and existing media field handle these.

Task 3 — Create a typed Strapi REST API client at sync/src/strapi-client.ts:
This file will be used by the sync engine to write data into Strapi. It must:
1. Use environment variables STRAPI_API_URL and STRAPI_SYNC_API_TOKEN (a full-access token, separate from the read-only frontend token).
2. Export these typed async functions:
   - findEngagementByLinkedinPostId(postId: string): Promise<StrapiEngagement | null>
     Calls GET /api/engagement-and-activities?filters[linkedinPostId][$eq]={postId}&pagination[limit]=1
   - createEngagement(data: CreateEngagementInput): Promise<StrapiEngagement>
     Calls POST /api/engagement-and-activities with status=published query param
   - updateEngagementMedia(documentId: string, mediaUrls: string[]): Promise<void>
     Calls PUT /api/engagement-and-activities/{documentId} — updates only mediaUrls
   - findCertificationByCompositeKey(title: string, issuingBody: string): Promise<StrapiCertification | null>
     Calls GET with combined filters on title and issuingBody
   - createCertification(data: CreateCertificationInput): Promise<StrapiCertification>
     Calls POST /api/certifications with status=published
   - uploadBadgeToStrapiMedia(imageUrl: string): Promise<number>
     Downloads the image buffer from a remote URL, uploads it via multipart POST /api/upload,
     and returns the Strapi media entry's numeric id for use in certification's badgeImage field.

3. Define TypeScript interfaces for StrapiEngagement, StrapiCertification, CreateEngagementInput,
   and CreateCertificationInput aligned with Strapi v5's flat response format (no `attributes` wrapper).

Important Strapi v5 notes:
- All write endpoints require Authorization: Bearer <STRAPI_SYNC_API_TOKEN>
- POST to create a published record: POST /api/certifications?status=published
- PUT to update: PUT /api/engagement-and-activities/{documentId} (documentId is the string ID, not numeric id)
- Flat response: res.data.title (NOT res.data.attributes.title)

Write a Vitest test suite sync/src/__tests__/strapi-client.test.ts that mocks global fetch and verifies
correct URL construction, auth headers, and response parsing for each function.

Deliver only clean, production-ready TypeScript. Files: sync/src/strapi-client.ts and sync/src/__tests__/strapi-client.test.ts.
```

---

### Prompt 2: Media Extraction Asset Pipeline

```
Context: You are building the media management utility for a LinkedIn sync engine that feeds data into a Strapi v5 portfolio CMS. LinkedIn media URLs (post images, videos) are ephemeral and expire. Badge images for certifications must be uploaded via Strapi's /api/upload endpoint (which proxies to Cloudinary). Post media goes directly to Cloudinary via the SDK.

Task:
Create sync/src/media-processor.ts with two exported functions:

1. syncPostMediaToCloudinary(mediaUrls: string[]): Promise<string[]>
   - Initialize Cloudinary v2 SDK with env vars CLOUDINARY_NAME, CLOUDINARY_KEY, CLOUDINARY_SECRET.
   - For each URL: fetch raw buffer via node-fetch with a 10-second AbortController timeout.
   - Upload the buffer to Cloudinary using uploader.upload_stream wrapped in a Promise.
   - On any per-asset error (timeout, network fail, Cloudinary rejection), log the error and exclude
     that asset from the returned array — do NOT crash the pipeline.
   - Return array of permanent Cloudinary secure_urls.

2. uploadBadgeViaStrapi(badgeUrl: string): Promise<number>
   - Fetch the raw image buffer from badgeUrl with a 10-second timeout.
   - Build a FormData payload with the file buffer as a Blob.
   - POST to ${STRAPI_API_URL}/api/upload with Authorization: Bearer ${STRAPI_SYNC_API_TOKEN}.
   - Parse the JSON response (Strapi returns an array) and return response[0].id (numeric Strapi media ID).
   - Throw a descriptive error if the upload fails — badge images are required for certifications.

Write a Vitest test suite sync/src/__tests__/media-processor.test.ts mocking node-fetch and the Cloudinary SDK:
- Successful post media download returns permanent Cloudinary URLs.
- A timed-out asset is excluded from results without throwing.
- Successful badge upload returns the correct numeric Strapi media ID.
- A failed badge upload throws with a descriptive message.

Deliver only clean, production-ready TypeScript. Files: sync/src/media-processor.ts and sync/src/__tests__/media-processor.test.ts.
```



---

### Prompt 3: Intelligent Merge Core Engine

```
Context: You are building the core sync coordinator for a LinkedIn data pipeline. It writes data into a live Strapi v5 CMS (certifications and engagement-and-activities collections) via the Strapi REST API client from Prompt 1. It must never overwrite custom text edits made in the Strapi admin panel.

Task:
Implement sync/src/sync-engine.service.ts.

Requirements:
1. Export an async function:
   syncLinkedInData(incomingData: LinkedInScraperPayload): Promise<{ activitiesSynced: number; certsSynced: number }>

   LinkedInScraperPayload shape (from Apify LinkedIn scraper output):
   {
     certifications: Array<{
       linkedinCertId: string
       title: string
       issuingBody: string
       badgeUrl: string           // ephemeral LinkedIn CDN URL
       verificationUrl: string
       expiryDate?: string        // ISO date string or undefined
     }>
     featuredPosts: Array<{
       linkedinPostId: string
       postUrl: string
       textContent: string
       mediaUrls: string[]        // ephemeral LinkedIn CDN URLs
       mediaType: 'Image' | 'Video' | 'Carousel' | 'ExternalLink'
       linkPreviewCard?: { title: string; description: string; thumbnailUrl: string }
       postedAt: string           // ISO date string
     }>
   }

2. Certification merge rules:
   - Look up by linkedinCertId first; fall back to title + issuingBody composite check.
   - If NOT found: upload badge via uploadBadgeViaStrapi(), then createCertification() with
     the returned Strapi media ID as badgeImage.
   - If found: skip entirely. Never overwrite existing certification data.

3. Featured post merge rules:
   - Look up by linkedinPostId.
   - If NOT found: upload media via syncPostMediaToCloudinary(), then createEngagement() with:
       title: first 100 characters of textContent (trimmed)
       description: Strapi Blocks format — [{ type: "paragraph", children: [{ type: "text", text: textContent }] }]
       eventDate: postedAt (formatted as YYYY-MM-DD)
       isFeatured: false
       linkedinPostId, postUrl, mediaUrls (permanent Cloudinary URLs), mediaType, linkPreviewCard
   - If found: upload incoming mediaUrls via syncPostMediaToCloudinary(), then call updateEngagementMedia()
     with fresh Cloudinary URLs. Update only the mediaUrls field — title, description, eventDate, and isFeatured retain their current values.

4. After all upserts complete, call the existing Next.js revalidation endpoint for both affected models:
   POST ${NEXT_REVALIDATION_URL}/api/revalidate with:
   - Authorization: Bearer ${REVALIDATION_SECRET_TOKEN}
   - Body: { model: "certification" }  (maps to 'certifications' cache tag via existing MODEL_TO_TAG_MAP)
   POST the same endpoint with body: { model: "engagement-and-activity" }  (maps to 'engagements' tag)
   Do NOT invent new cache tags. The existing /api/revalidate route handles these model names already.

5. Inject strapiClient and mediaProcessor as constructor/parameter dependencies for testability.

Write a Vitest suite sync/src/__tests__/sync-engine.test.ts covering:
- New certification: badge uploaded, createCertification called with correct Strapi media ID.
- Existing certification (found by linkedinCertId): skipped, no create call made.
- New post: media uploaded, createEngagement called with correct Blocks description format.
- Existing post: only updateEngagementMedia called; createEngagement NOT called; textContent unchanged.
- Revalidation endpoint called for both models after sync completes.

Deliver only clean, production-ready TypeScript. Files: sync/src/sync-engine.service.ts and sync/src/__tests__/sync-engine.test.ts.
```

---

### Prompt 4: Strapi Custom Route — Sync Endpoint

```
Context: You are adding a custom API route to an existing Strapi v5 CMS (located at /cms in the monorepo). This route exposes POST /api/sync-linkedin and is triggered by the Next.js Vercel cron proxy. Strapi v5 uses its own routing/controller/service architecture — this is NOT Express; do not use app.use() or express.Router(). The route is registered via Strapi's factory pattern.

Task:
Create three files inside cms/src/api/sync-linkedin/ following Strapi v5's custom API structure:

1. cms/src/api/sync-linkedin/routes/sync-linkedin.ts
   Register POST /api/sync-linkedin with a custom policy for token validation.

2. cms/src/api/sync-linkedin/policies/verify-sync-token.ts
   Strapi v5 policy that:
   - Reads the X-Sync-Token header from ctx.request.header.
   - Compares it against process.env.RENDER_SYNC_TOKEN.
   - Returns HTTP 401 with { error: "Unauthorized handshake token" } if missing or incorrect.
   - Calls next() if valid.

3. cms/src/api/sync-linkedin/controllers/sync-linkedin.ts
   Controller that:
   - Invokes the syncLinkedInData() function from the sync engine (imported from sync/src/sync-engine.service.ts or a bundled copy).
   - Passes ctx.request.body as the scraper payload.
   - Returns HTTP 200 with { success: true, activitiesSynced: N, certsSynced: N } on success.
   - Returns HTTP 500 with { error: message } on unhandled exceptions.

Environment variable required on Render: RENDER_SYNC_TOKEN (generate with openssl rand -base64 32).

Write a Vitest/Supertest suite cms/src/__tests__/sync-route.test.ts that mocks the Strapi test instance and verifies:
- Requests missing X-Sync-Token header receive 401.
- Requests with incorrect token receive 401.
- Valid token triggers sync engine and returns 200 with correct payload shape.

Deliver only clean, production-ready TypeScript in Strapi v5 convention. File structure:
cms/src/api/sync-linkedin/routes/sync-linkedin.ts
cms/src/api/sync-linkedin/policies/verify-sync-token.ts
cms/src/api/sync-linkedin/controllers/sync-linkedin.ts
cms/src/__tests__/sync-route.test.ts
```

---

### Prompt 5: Next.js Vercel Cron Proxy Route

```
Context: You are adding a Vercel Cron Job to an existing Next.js 16 App Router portfolio (at /profile in the monorepo). The cron fires weekly and proxies to a Strapi v5 custom route at POST /api/sync-linkedin on the Render backend. Cache invalidation is handled inside the sync engine itself via the existing /api/revalidate route.

Task:
Create two files:

1. profile/vercel.json
   Add a cron configuration. IMPORTANT: check if vercel.json already exists before creating it.
   If it exists, merge the crons array rather than overwriting.
   Content:
   {
     "crons": [
       { "path": "/api/cron/sync-linkedin", "schedule": "0 2 * * 0" }
     ]
   }
   (Sunday 02:00 UTC — offset from midnight to reduce API rate-limit collisions with other services.)

2. profile/app/api/cron/sync-linkedin/route.ts
   Next.js App Router GET handler (Vercel cron uses GET):
   - Read Authorization header. Verify it matches Bearer ${process.env.CRON_SECRET_TOKEN}.
     Return NextResponse.json({ error: "Unauthorized" }, { status: 401 }) if invalid.
   - POST to ${process.env.STRAPI_API_URL}/api/sync-linkedin with header X-Sync-Token: ${process.env.RENDER_SYNC_TOKEN}.
   - If Render responds 2xx: return NextResponse.json({ triggered: true }, { status: 200 }).
   - If Render responds non-2xx: return NextResponse.json({ triggered: false, status: renderResponse.status }, { status: 502 }).
   - Wrap in try/catch: network failure returns 502.

Environment variables required in Vercel: CRON_SECRET_TOKEN, RENDER_SYNC_TOKEN.
STRAPI_API_URL is already configured in Vercel (points to https://strapi-cms-2usx.onrender.com).

Write a Vitest test suite profile/app/api/cron/__tests__/sync-linkedin.test.ts mocking global fetch:
- Missing/wrong Authorization header → 401.
- Valid token + Render 200 response → returns { triggered: true }.
- Valid token + Render 500 response → returns 502 with triggered: false.
- Valid token + network error → returns 502.

Deliver only clean, production-ready TypeScript. No new revalidation logic — it is handled inside the sync engine.
```

---

### Prompt 6: Next.js Cache Revalidation

```
Context: You are working on a Next.js 16 App Router portfolio at /profile. The application uses
Static Site Generation with on-demand cache invalidation via a revalidation route handler at
profile/app/api/revalidate/route.ts. This route uses MODEL_TO_TAG_MAP to resolve incoming model
names to cache tags and calls revalidateTag(tag, 'default') for each.

The existing MODEL_TO_TAG_MAP already covers the models updated by the sync engine:
  'certification'             → ['certifications']
  'engagement-and-activity'   → ['engagements']

Task:
The revalidation route requires no modifications. The sync engine (Prompt 3) triggers it by calling:
  POST /api/revalidate with Authorization: Bearer ${REVALIDATION_SECRET_TOKEN}
  Body: { model: "certification" }
  Body: { model: "engagement-and-activity" }

For reference, the complete current handler is:
  - Validates Bearer token against REVALIDATION_SECRET_TOKEN
  - Looks up model in MODEL_TO_TAG_MAP
  - Calls revalidateTag(tag, 'default') for each matched tag
  - Returns { revalidated: true, tags, now: Date.now() }

Write an integration test profile/app/api/revalidate/__tests__/route.test.ts verifying:
- Invalid token returns 401.
- model: "certification" triggers revalidateTag with tag "certifications".
- model: "engagement-and-activity" triggers revalidateTag with tag "engagements".
- Unknown model returns 400.

Deliver only the test file. The route handler itself is already complete.
```

---

### Prompt 7: Frontend UI Extension — EngagementCard Only

```
Context: You are extending an existing Next.js 16 portfolio frontend (/profile). The certifications
and engagements data is already fetched in app/page.tsx via fetchCertifications() and fetchEngagements()
from profile/lib/api.ts, and rendered by CertificationsSection and EngagementsSection components.
CertificationCard already renders cert.badgeImage.url and requires no changes.

The UI work is scoped to extending EngagementCard and the TypeScript EngagementAndActivity interface
to surface the new LinkedIn-sourced fields.

Task 1 — Update profile/lib/types.ts:
Add these optional fields to the existing EngagementAndActivity interface:
  linkedinPostId?: string
  postUrl?: string
  mediaUrls?: string[]
  mediaType?: 'Image' | 'Video' | 'Carousel' | 'ExternalLink'
  linkPreviewCard?: { title: string; description: string; thumbnailUrl: string }
Only the EngagementAndActivity interface requires new optional fields; all other interfaces remain unchanged.

Task 2 — Update profile/components/ui/EngagementCard.tsx:
Read the current file before editing.
Add these conditional rendering behaviors to the existing card layout:
  - If engagement.postUrl is present, wrap the card title (h3) in an anchor:
      <a href={engagement.postUrl} target="_blank" rel="noopener noreferrer">
    Keep the existing hover:text-accent styling.
  - If engagement.mediaUrls?.length > 0, render a media row below the description:
    - For mediaType === 'Image' or 'Carousel': render the first URL as a responsive next/image
      (use unoptimized={true} since these are Cloudinary URLs with full optimization already applied).
    - For mediaType === 'Video': render a <video controls className="w-full rounded"> tag.
    - For other types or missing mediaType: render nothing.
  - If engagement.linkPreviewCard is present and no mediaUrls exist: render a small preview card
    below description showing linkPreviewCard.title and linkPreviewCard.description in muted text.
    Fallback gracefully to nothing if the object is malformed.
  All new elements are conditional — existing manual engagements without these fields render identically to today.

Task 3 — Write a Vitest + React Testing Library suite
profile/components/ui/__tests__/EngagementCard.test.tsx:
  - Card with postUrl: title anchor has correct href, target="_blank", rel="noopener noreferrer".
  - Card without postUrl: title is not wrapped in an anchor.
  - Card with mediaType=Image and mediaUrls: image element is rendered.
  - Card with linkPreviewCard but no mediaUrls: preview card text is visible.
  - Card with malformed linkPreviewCard (null fields): no runtime error thrown.
  - Existing engagement without any new fields: renders identically, no regressions.

Deliver only clean, production-ready TypeScript and Tailwind CSS code. Do not modify CertificationCard,
CertificationsSection, EngagementsSection, or any other existing component.
```


