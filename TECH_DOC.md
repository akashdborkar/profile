# Technical Documentation — Akash Borkar Profile Platform

**Last updated:** June 2026  
**Author:** Akash Borkar  
**Purpose:** Tech doc reference for the personal branding and thought-leadership platform.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Repository Structure](#2-repository-structure)
3. [Technology Stack](#3-technology-stack)
4. [Architecture Deep-Dive](#4-architecture-deep-dive)
5. [Next.js Concepts Used](#5-nextjs-concepts-used)
6. [Caching Model](#6-caching-model)
7. [Data Layer — Strapi v5 API](#7-data-layer--strapi-v5-api)
8. [Component Architecture](#8-component-architecture)
9. [Styling System — Tailwind CSS v4](#9-styling-system--tailwind-css-v4)
10. [Testing](#10-testing)
11. [Environment Variables Reference](#11-environment-variables-reference)
12. [Deployment & Infrastructure](#12-deployment--infrastructure)
13. [Known Limitations](#13-known-limitations)
14. [Runbooks](#14-runbooks)

---

## 1. Project Overview

A **decoupled JAMstack** personal portfolio and thought-leadership platform. The frontend is a statically generated Next.js site served via Vercel's global CDN. Content is authored in a Strapi v5 headless CMS hosted on Render's free tier, with Neon PostgreSQL as the database and Cloudinary for media storage.

The site is designed for **zero-runtime cost** at scale — pages are pre-rendered at build time and content changes trigger targeted cache invalidation (ISR) rather than full rebuilds.

**Live URLs:**
| Service | URL | Platform |
|---|---|---|
| Frontend | https://akashdborkar.vercel.app | Vercel |
| CMS Admin | https://strapi-cms-2usx.onrender.com/admin | Render Free |

---

## 2. Repository Structure

```
Profile/                        ← monorepo root
├── profile/                    ← Next.js frontend
│   ├── app/                    ← App Router pages and API routes
│   │   ├── page.tsx            ← Home SPA page
│   │   ├── blog/[slug]/        ← Dynamic blog post page
│   │   ├── case-studies/[slug]/← Dynamic project/case study page
│   │   └── api/
│   │       └── revalidate/     ← Strapi webhook → ISR revalidation
│   ├── components/
│   │   ├── blocks/             ← Content block renderers (Dynamic Zone)
│   │   ├── sections/           ← Page section components
│   │   ├── layout/             ← Navbar, Footer, SectionWrapper
│   │   └── ui/                 ← Atomic UI components
│   ├── lib/
│   │   ├── api.ts              ← All Strapi fetch helpers
│   │   ├── strapi.ts           ← Base HTTP client
│   │   ├── types.ts            ← TypeScript interfaces (Strapi v5 flat)
│   │   ├── env.ts              ← Server-only env accessor (throws client-side)
│   │   └── utils/              ← Pure utility functions
│   ├── vitest.config.ts
│   └── next.config.ts
├── cms/                        ← Strapi v5 backend
│   ├── src/
│   │   └── api/                ← 9 content types
│   └── dist/                   ← Pre-built admin panel (committed to git)
└── CLAUDE.md                   ← AI assistant instructions
```

---

## 3. Technology Stack

| Layer | Technology | Version | Notes |
|---|---|---|---|
| Framework | Next.js | 16.2.6 | App Router, PPR-ready |
| UI Library | React | 19.2.4 | Server Components default |
| Styling | Tailwind CSS | v4 | CSS-first config, no `tailwind.config.ts` |
| CMS | Strapi | v5.46.0 | Flat response format (no `attributes` wrapper) |
| Database | Neon PostgreSQL | — | Serverless Postgres, managed by Strapi |
| Media CDN | Cloudinary | free tier | Images and file uploads |
| Testing | Vitest | v3 | Node + jsdom environments |
| Hosting (FE) | Vercel |
| Hosting (CMS) | Render | free tier | 512 MB RAM limit |
| Analytics | Google Analytics 4 | — | Measurement ID via env |

---

## 4. Architecture Deep-Dive

### 4.1 High-Level Flow

```
Browser
  │
  ▼
Vercel CDN  ←── pre-rendered HTML (SSG)
  │  ▲
  │  │ revalidateTag() on publish
  │  │
  ▼  │
Next.js (Vercel)
  │
  ├── fetch() with next.tags → Strapi REST API (Render)
  │                               │
  │                               └── Neon PostgreSQL
  │                                     Cloudinary (media)
  │
  └── /api/revalidate     ← POST from Strapi webhook
```

### 4.2 Request Lifecycle for a Visitor

1. Browser requests `https://akashdborkar.vercel.app/`
2. Vercel CDN serves the pre-rendered HTML instantly (no server processing)
3. React hydrates the page client-side
4. No runtime Strapi requests are made by the visitor

### 4.3 Request Lifecycle for a Content Publish

1. Akash publishes content in Strapi admin
2. Strapi fires a configured webhook: `POST /api/revalidate`
3. The route handler validates the `Authorization: Bearer <REVALIDATION_SECRET_TOKEN>` header
4. It calls `revalidateTag(modelName, 'default')` for the relevant model
5. Next.js marks all cached `fetch()` calls tagged with that model as stale
6. On the next visitor request, Next.js re-fetches and caches the fresh HTML

---

## 5. Next.js Concepts Used

### 5.1 App Router

All pages use the **App Router** (`app/` directory) introduced in Next.js 13. Key implications:

- Every component is a **React Server Component (RSC)** by default — no JavaScript sent to the browser unless `'use client'` is explicitly declared
- `async/await` is used directly in page components for data fetching
- Layouts are defined via `layout.tsx` files and share state across nested routes without re-mounting

### 5.2 Static Site Generation (SSG)

The home page (`app/page.tsx`) and all blog/case-study pages are **fully static**:

```ts
// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const blogs = await getBlogs();
  return blogs.map((b) => ({ slug: b.slug }));
}
```

`generateStaticParams` runs at **build time**, emitting one HTML file per slug. At runtime, Vercel serves these as static assets — no server process involved.

### 5.3 Incremental Static Regeneration (ISR) — On-Demand Mode

Rather than time-based revalidation (`revalidate: 60`), this project uses **on-demand ISR**:

```ts
// lib/strapi.ts
fetch(url, {
  next: { tags: ['blog', 'revalidate-blog-my-post-slug'] }
});

// app/api/revalidate/route.ts
revalidateTag(modelName, 'default');  // Next.js 16 requires 2nd argument
```

This means pages are only regenerated when content actually changes, not on a polling interval. This is more efficient and avoids unnecessary builds.

### 5.4 Server-Side Redirect

External blogs use a **server-side redirect** in the route handler:

```ts
// app/blog/[slug]/page.tsx
if (blog.isExternal && blog.externalUrl) {
  redirect(blog.externalUrl);  // 307 redirect, no client-side JS needed
}
```

This avoids building a full page for external content and correctly handles SEO (the redirect happens before the browser renders anything).

### 5.5 `generateMetadata`

Each dynamic page exports `generateMetadata` for per-page `<head>` tags:

```ts
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const blog = await getBlogBySlug(params.slug);
  return {
    title: blog.title,
    description: extractFirstParagraph(blog.content),
    openGraph: { ... }
  };
}
```

This runs on the server at build time and produces static `<meta>` tags — no client-side head mutation.

### 5.6 React Server Components vs. Client Components

| Component | Type | Reason |
|---|---|---|
| `app/page.tsx` | Server | Fetches data, renders HTML |
| `components/sections/*` | Server | Pure display, no interactivity |
| `components/ui/ThemeToggle.tsx` | Client (`'use client'`) | Needs `useState` for theme |
| `components/blocks/CopyButton.tsx` | Client | Needs `navigator.clipboard` |
| `components/ui/SocialLinks.tsx` | Client | Analytics event tracking |
| `components/blocks/BlockErrorBoundary.tsx` | Client | Error boundaries require class component |

### 5.7 `Promise.allSettled` for CMS-Down Resilience

The home page fetches all sections in **parallel** but is resilient to individual failures:

```ts
// app/page.tsx
const [heroResult, aboutResult, skillsResult, ...] = await Promise.allSettled([
  getAboutMe(),
  getSkillsMatrix(),
  getBlogs(),
  // ...
]);

const hero = heroResult.status === 'fulfilled' ? heroResult.value : null;
```

Each section receives `T | null`. When null, it renders `<SectionUnavailable sectionName="..." />` instead of crashing the entire page. This is critical because Strapi runs on Render's free tier which can go to sleep.

### 5.8 Route Handlers (API Routes)

One API route is implemented:

| Route | Method | Purpose |
|---|---|---|
| `/api/revalidate` | POST | Strapi publish webhook → ISR invalidation |

### 5.9 JSON-LD Structured Data

The home page injects `application/ld+json` schema for Google's rich results:

```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
/>
```

This is a Person schema with name, role, social URLs, and contact info — improving SEO appearance in search results.

### 5.10 Next.js Image Optimization

`next/image` is used for profile photos and blog hero images. Remote patterns are configured in `next.config.ts` to allowlist:

- `localhost:1337` (local Strapi)
- `*.res.cloudinary.com` (production media CDN)

Images are automatically resized, converted to WebP, and served via Vercel's image CDN.

---

## 6. Caching Model

### 6.1 How Next.js Caches `fetch()` Calls

Every `fetch()` in `lib/api.ts` passes `next: { tags: [...] }`:

```ts
// lib/strapi.ts
export async function strapiRequest<T>(path: string, options = {}): Promise<T> {
  return fetch(`${env.strapiUrl}/api${path}`, {
    headers: { Authorization: `Bearer ${env.strapiToken}` },
    next: { tags: ['strapi', modelTag, slugTag] }
  });
}
```

Next.js stores the response in its **Data Cache** (persistent across requests). All pages sharing the same tag are invalidated together when `revalidateTag()` is called.

### 6.2 Tag Naming Convention

```ts
// app/api/revalidate/route.ts
const MODEL_TO_TAG_MAP: Record<string, string> = {
  blog:                  'blog',
  project:               'project',
  'skills-matrix':       'skills',
  certification:         'certification',
  'about-me':            'about',
  'engagement-and-activity': 'engagement',
  'featured-curation':   'featured',
  contact:               'contact',
};
```

Slug-specific tags (e.g., `revalidate-blog-my-post`) allow per-post invalidation without busting the entire blog listing cache.

### 6.3 Cache Hierarchy

```
Browser Cache (HTTP headers, short TTL)
  ↓
Vercel CDN Edge Cache (HTML, immutable until revalidated)
  ↓
Next.js Data Cache (fetch() responses, tagged)
  ↓
Strapi REST API (no caching — fresh DB reads)
```

### 6.4 Build-Time vs. Runtime Fetching

| When | What | Cache |
|---|---|---|
| `npm run build` | `generateStaticParams`, page data | Baked into HTML |
| On-demand ISR | After `revalidateTag()`, next visitor request | Updated HTML cached |
| Never (runtime) | No per-visitor Strapi calls | — |

### 6.5 Cold-Start Resilience via `fetchStrapiData`

Render's free tier **spins down after 15 minutes of inactivity**. On the first build request, Strapi may take 30–60 seconds to wake up. `lib/utils/fetchStrapiData.ts` implements **exponential backoff**:

```ts
async function fetchStrapiData<T>(fetcher: () => Promise<T>, options = {}) {
  const { maxAttempts = 5, baseDelayMs = 2000 } = options;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fetcher();
    } catch (err) {
      if (attempt === maxAttempts) throw err;
      await sleep(baseDelayMs * 2 ** (attempt - 1));  // 2s, 4s, 8s, 16s...
    }
  }
}
```

This wraps all `generateStaticParams` calls to ensure build-time data fetching succeeds even after a cold start.

---

## 7. Data Layer — Strapi v5 API

### Content Types

| Content Type | Strapi UID | Type | Notes |
|---|---|---|---|
| About Me | `about-me` | Single | Personal bio, hero text |
| Blog | `blog` | Collection | Supports external redirect flag |
| Project | `project` | Collection | Used as Case Studies |
| Skills Matrix | `skills-matrix` | Collection | Grouped by category |
| Certification | `certification` | Collection | Expiry date filtering |
| Engagement & Activity | `engagement-and-activity` | Collection | Talks, podcasts, etc. |
| Gallery | `gallery` | Collection | Photo grid |
| Featured Curation | `featured-curation` | Single | Manual content curation |
| Contact | `contact` | Single | Social links, contact info |

### Featured Content Hybrid Engine

`lib/utils/buildFeaturedList.ts` implements a two-tier fallback:

**Tier 1 — Manual Curation:**
The `FeaturedCurations` single type stores up to 5 explicit content IDs (with `contentType` discriminator). If populated, these are fetched individually and returned in the curated order.

**Tier 2 — Automatic Fallback:**
If no manual curation exists, the engine aggregates all items with `isFeatured: true` from Blogs, Projects, and Engagements, sorts by `publishedAt` descending, and returns the top 5.

```ts
// lib/utils/buildFeaturedList.ts
export async function buildFeaturedList(): Promise<FeaturedItem[]> {
  const curations = await getFeaturedCurations();

  if (curations?.items?.length) {
    return fetchCuratedItemsById(curations.items);  // Tier 1
  }

  return aggregateIsFeaturedItems();  // Tier 2
}
```

### Rich Text (Strapi Blocks Format)

Blog and case study content uses Strapi's **Blocks rich text editor**, which outputs a structured JSON array (not HTML or Markdown):

```json
[
  { "type": "paragraph", "children": [{ "type": "text", "text": "Hello world" }] },
  { "type": "heading", "level": 2, "children": [{ "type": "text", "text": "Section" }] }
]
```

`components/ui/RichTextRenderer.tsx` recursively renders this tree. `lib/utils/richTextHelpers.ts` provides `extractFirstParagraph()` for pulling plain text used in `generateMetadata` descriptions.

---

## 8. Component Architecture

### 8.1 Component Hierarchy

```
app/page.tsx  (Server Component)
  ├── HeroSection          (Server)
  ├── AboutPreviewSection  (Server)
  ├── SkillsMatrixSection  (Server)
  │     └── SkillsCategoryBlock (Server)
  │           └── SkillBadge   (Server)
  ├── FeaturedSection      (Server)
  │     └── FeaturedCard   (Server)
  ├── BlogsSection         (Server)
  ├── CertificationsSection (Server)
  │     └── CertificationCard (Server)
  └── EngagementsSection   (Server)
        └── EngagementCard (Server)
```

### 8.2 Dynamic Zone Renderer

`components/blocks/DynamicZoneRenderer.tsx` is a **block map dispatcher**:

```ts
const BLOCK_MAP: Record<string, React.ComponentType<BlockProps>> = {
  'content.hero-block':    HeroBlock,
  'content.text-block':    TextBlock,
  'content.code-block':    CodeBlock,
  'content.callout-box':   CalloutBox,
};

export function DynamicZoneRenderer({ blocks }: Props) {
  return blocks.map((block) => {
    const Component = BLOCK_MAP[block.__component];
    return (
      <BlockErrorBoundary key={block.id}>
        <Component {...block} />
      </BlockErrorBoundary>
    );
  });
}
```

Each block is wrapped in `BlockErrorBoundary` — a class-based error boundary that renders a "block unavailable" fallback instead of crashing the whole page.

### 8.3 Content Blocks

| Block | Component | Notes |
|---|---|---|
| `content.hero-block` | `HeroBlock.tsx` | Full-width image, optional heading |
| `content.text-block` | `TextBlock.tsx` | Delegates to `RichTextRenderer` |
| `content.code-block` | `CodeBlock.tsx` | Language label + `CopyButton` |
| `content.callout-box` | `CalloutBox.tsx` | Info/Warning/Success variants |

### 8.4 Key UI Atoms

| Component | Purpose |
|---|---|
| `SectionUnavailable` | Renders graceful fallback when a section's data is null |
| `RichTextRenderer` | Recursive Strapi blocks JSON → HTML renderer |
| `CertificationCard` | Cert tile with expiry badge and optional verify link |
| `FeaturedCard` | Unified card for Blog / Project / Engagement featured items |
| `ResumeDownloadLink` | CV download with GA4 event tracking |
| `ThemeToggle` | Light/dark mode toggle, persisted to `localStorage` |
| `SkillBadge` | Pill badge for individual skills, renders Cloudinary icon |

### 8.5 Error Boundary Strategy

`BlockErrorBoundary` is a **class component** because React's error boundary API (`componentDidCatch`) is not available to function components. It must be a `'use client'` component — server components cannot catch errors in the same way.

The error boundary only catches render-time errors within blocks. Data fetch errors are handled upstream via `Promise.allSettled`.

---

## 9. Styling System — Tailwind CSS v4

### 10.1 CSS-First Configuration

Tailwind v4 removes `tailwind.config.ts`. All configuration lives in `app/globals.css`:

```css
@import "tailwindcss";

/* Content scanning */
@source "../app";
@source "../components";

/* Custom design tokens */
@theme {
  --color-brand-primary: oklch(60% 0.2 250);
  --font-sans: 'Inter', system-ui, sans-serif;
  /* ... */
}

/* Dark mode */
@custom-variant dark (&:where(.dark, .dark *));
```

No `tailwind.config.ts` file exists or is needed.

### 10.2 Dark Mode

Dark mode is implemented via a CSS class strategy. `ThemeToggle.tsx` adds/removes the `.dark` class on `<html>`. The `@custom-variant dark` directive in `globals.css` maps `dark:` utility classes to `.dark` ancestry.


## 10. Testing

### 11.1 Framework

**Vitest v3** is used (not Jest). Jest is not installed. The config is at `profile/vitest.config.ts`.

### 11.2 Environment Segregation

```ts
// vitest.config.ts
environmentMatchGlobs: [
  ['components/**/__tests__/*.test.tsx', 'jsdom'],  // browser-like env
  // everything else uses 'node'
]
```

Utility tests (`lib/utils/__tests__/`) run in the `node` environment. Component tests run with `jsdom` for DOM access.

### 11.3 JSX Transform

JSX transform uses **esbuild** directly instead.

### 11.4 Running Tests

```bash
cd profile
npm test                            # run all tests
npm run test:watch                  # watch mode
npx vitest run lib/utils/__tests__/filterExpiredCertifications.test.ts  # single file
```

### 11.5 Current Test Coverage

| Area | Coverage |
|---|---|
| `filterExpiredCertifications` | Unit tests present |
| `buildFeaturedList` | No tests (relies on live API) |
| API routes | No tests |
| Components | Limited |

---

## 11. Environment Variables Reference

### Frontend (`profile/.env.local`)

| Variable | Required | Purpose |
|---|---|---|
| `STRAPI_API_URL` | Yes | Strapi base URL (e.g., `http://localhost:1337`) |
| `STRAPI_API_TOKEN` | Yes | Read-only Strapi API token |
| `REVALIDATION_SECRET_TOKEN` | Yes | Shared secret for ISR webhook validation |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | No | Google Analytics 4 measurement ID |
| `NEXT_PUBLIC_STRAPI_HOST` | Yes | Strapi hostname for `next/image` allowlist |
| `NEXT_PUBLIC_SITE_URL` | Yes | Canonical site URL |

### CMS (`cms/.env` on Render)

| Variable | Purpose |
|---|---|
| `STRAPI_API_URL` | Self-referential URL (`http://localhost:1337`) |
| `NEXT_REVALIDATION_URL` | Frontend URL to POST revalidation webhook |
| `REVALIDATION_SECRET_TOKEN` | Must match Vercel value |

**Security note:** Variables prefixed `NEXT_PUBLIC_` are embedded in the client-side JavaScript bundle and are visible to anyone. All secret tokens must **never** use this prefix. `lib/env.ts` throws at module load if accessed client-side:

```ts
if (typeof window !== 'undefined') {
  throw new Error('lib/env must only be imported on the server');
}
```

---

## 12. Deployment & Infrastructure

### 13.1 Frontend (Vercel)

- Deploys automatically on `git push` to `main`
- Build command: `cd profile && npm run build`
- Output: static HTML + edge functions for API routes
- ISR revalidation is handled by Vercel's infrastructure

### 13.2 CMS (Render Free Tier)

**Critical constraint:** Render's free tier has 512 MB RAM. The Strapi admin panel's Vite build **exceeds this limit** (OOM error).

**Solution:** The `cms/dist/` admin panel is **pre-built locally and committed to git**. Render's build command is `npm install` only — it does not run `npm run build`.

**Rule:** Every commit touching `cms/src/` or any `schema.json` **must** include a rebuilt `cms/dist/`:

```bash
cd cms
npx strapi ts:generate-types       # if content type schemas changed
npm run build                      # rebuild admin panel
git add -f cms/dist/
git add cms/types/generated/contentTypes.d.ts  # if types were regenerated
git commit -m "feat: ..."
```

### 13.3 Render Sleep Behavior

Render free tier services **sleep after 15 minutes of inactivity**. On the first request after sleep, the service takes 30–60 seconds to wake. This affects:

- Build-time data fetching (mitigated by `fetchStrapiData` exponential backoff)
- First content publish after inactivity (revalidation webhook may time out)

### 13.4 Database

Neon PostgreSQL is used. It is managed entirely through Strapi's connection string — no manual DB migrations or schema management is needed outside of Strapi's built-in migration system.

### 13.5 Media Storage (Cloudinary)

Images uploaded through Strapi admin are stored in Cloudinary. Strapi returns full Cloudinary URLs in its API responses. `next/image` is configured to accept these URLs via `remotePatterns` in `next.config.ts`.

---

## 13. Known Limitations

### 13.1 Render Free Tier Constraints

- 512 MB RAM: no in-container builds for CMS admin panel
- Sleep after 15 min: cold-start latency on first build request
- Single dyno: no horizontal scaling

### 13.2 No Full-Text Search

There is no search functionality. Adding search would require either:
- Algolia integration (indexing Strapi content)
- Strapi's built-in `_q` search parameter (limited, no fuzzy search)
- Meilisearch plugin for Strapi

### 13.3 Static Build Required for New Content

New blog posts or case studies require a **new static build** to appear at their URLs because `generateStaticParams` runs only at build time. ISR handles existing URLs being updated but not new URLs being added — unless `dynamicParams = true` is set (which would add server-side rendering latency for unknown slugs).

**Current behaviour:** A new slug published in Strapi will 404 until the next Vercel deployment. Trigger a re-deploy from the Vercel dashboard or push a trivial commit.

### 13.4 No Authentication

The site is fully public. The Strapi admin panel has its own authentication but the Next.js frontend has no login, protected routes, or user accounts.

### 13.5 Cloudinary Free Tier

Cloudinary's free tier has a 25 GB storage and 25 GB bandwidth monthly limit. No transformations (resizing, cropping) are applied at upload time — `next/image` handles all resizing on-the-fly via Vercel's image CDN.

### 13.6 Strapi v5 Dynamic Zone Populate Verbosity

The `BLOG_BLOCKS_POPULATE` query string must enumerate every block type explicitly. Adding a new Dynamic Zone block type to the CMS schema requires a corresponding entry in `lib/api.ts` or that block type's data will be silently missing in the response.

---

## 14. Runbooks

### 14.1 Adding a New Blog Post

1. Log in to Strapi admin at `https://strapi-cms-2usx.onrender.com/admin`
2. Create the blog post, set `slug`, toggle `Published`
3. Strapi fires the revalidation webhook automatically
4. If the post has a new slug: trigger a Vercel re-deploy for it to appear at its URL

### 14.2 Adding a New Content Block Type to Blogs

1. In Strapi admin: add a new component to the `contentBlocks` dynamic zone
2. Run `cd cms && npx strapi ts:generate-types`
3. Run `cd cms && npm run build` and commit `cms/dist/`
4. Add the block type to `BLOG_BLOCKS_POPULATE` in `profile/lib/api.ts`
5. Create the React component in `profile/components/blocks/`
6. Register it in `DynamicZoneRenderer.tsx`'s `BLOCK_MAP`

### 14.3 Forcing a Full Re-Deploy

If content appears stale after a revalidation:

```bash
# Option 1: Vercel dashboard → Deployments → Redeploy
# Option 2: Empty commit
git commit --allow-empty -m "chore: force redeploy"
git push
```

### 14.4 Debugging a Failed Revalidation

1. Check Strapi webhook logs (admin → Settings → Webhooks)
2. Check Vercel function logs for `/api/revalidate`
3. Verify `REVALIDATION_SECRET_TOKEN` matches in both Vercel and Render env
4. Verify the webhook payload `model` field matches a key in `MODEL_TO_TAG_MAP`

### 14.5 Rebuilding the CMS Admin Panel

Required after any change to `cms/src/` content type schemas:

```bash
cd cms
npx strapi ts:generate-types          # regenerate TypeScript types
npm run build                         # build admin panel (~2-5 min)
git add -f cms/dist/
git add cms/types/generated/contentTypes.d.ts
git commit -m "chore: rebuild CMS dist after schema change"
git push
```

### 14.6 Running Locally

```bash
# Terminal 1: Start CMS
cd cms
npm run develop       # http://localhost:1337/admin

# Terminal 2: Start Frontend
cd profile
cp .env.local.example .env.local   # fill in local Strapi token
npm run dev           # http://localhost:3000
```

---

*End of document.*
