# Akash Borkar — Lead Technical Consultant Portfolio

A production-grade personal branding and thought-leadership platform built as a decoupled JAMstack. The Next.js frontend is fully statically generated and consumes structured content from a Strapi v5 headless CMS, with on-demand cache revalidation so the site updates instantly when content is published — no redeploy required.

**🌐 Live:** https://akashdborkar.vercel.app

---

## Table of Contents

- [Live Architecture](#live-architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Pages & Routes](#pages--routes)
- [Application Flow](#application-flow)
- [CMS Content Model](#cms-content-model)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [CMS Setup (Strapi)](#cms-setup-strapi)
  - [Frontend Setup (Next.js)](#frontend-setup-nextjs)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Testing](#testing)
- [Deployment](#deployment)
- [Key Design Decisions](#key-design-decisions)

---

## Live Architecture

```
Browser
  │
  ▼
Vercel CDN (akashdborkar.vercel.app) ──── serves pre-rendered HTML (SSG)
  │
  ▼
Next.js 16 (App Router)
  │  ├── Static pages: /, /about, /contact, /sitemap.xml, /robots.txt
  │  ├── SSG dynamic: /blog/[slug], /case-studies/[slug]
  │  └── API route:   /api/revalidate  (webhook receiver)
  │
  ▼
Strapi v5 (strapi-cms-2usx.onrender.com — Render Free)
  │  └── On publish → fires webhook → POST /api/revalidate
  │                                      └── revalidateTag() clears CDN cache
  ▼
PostgreSQL (production) / SQLite (development)
```

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| **Frontend framework** | Next.js (App Router, RSC) | 16.2.6 |
| **UI library** | React | 19.2.4 |
| **Styling** | Tailwind CSS v4 + shadcn/ui | 4.3.0 |
| **Theme** | next-themes (dark-first) | 0.4.6 |
| **CMS** | Strapi v5 | 5.x |
| **Email** | Resend API via Server Action | — |
| **Analytics** | GA4 via `@next/third-parties` | — |
| **Testing** | Vitest + React Testing Library | 3.2.4 |
| **Deployment** | Vercel (frontend) | — |
| **CMS hosting** | Render Free + Neon PostgreSQL | — |
| **Media storage** | Cloudinary | — |

---

## Project Structure

```
profile/                          ← Next.js frontend
├── app/
│   ├── layout.tsx                # Root layout: ThemeProvider, GA4, OG metadata
│   ├── page.tsx                  # SPA home — all sections, Promise.allSettled
│   ├── about/page.tsx
│   ├── contact/page.tsx
│   ├── blog/[slug]/page.tsx      # SSG + external redirect logic
│   ├── case-studies/[slug]/page.tsx
│   ├── api/revalidate/route.ts   # Webhook endpoint
│   ├── error.tsx                 # Global error boundary
│   ├── not-found.tsx             # Custom 404
│   ├── sitemap.ts
│   └── robots.ts
├── components/
│   ├── blocks/                   # Dynamic Zone renderers (blog content)
│   ├── layout/                   # Navbar, Footer, SectionWrapper
│   ├── sections/                 # Page-level sections
│   └── ui/                       # Reusable atoms (shadcn + custom)
├── lib/
│   ├── api.ts                    # All Strapi fetch helpers with cache tags
│   ├── strapi.ts                 # Base fetch client
│   ├── types.ts                  # TypeScript interfaces (Strapi v5 flat shape)
│   ├── env.ts                    # Server-only env accessors
│   ├── actions/sendContactEmail.ts
│   └── utils/
│       ├── analytics.ts          # GA4 event helpers
│       ├── buildFeaturedList.ts  # Featured hybrid engine
│       ├── filterExpiredCertifications.ts
│       ├── groupSkillsByCategory.ts
│       └── richTextHelpers.ts

cms/                              ← Strapi v5 backend
├── src/
│   ├── api/                      # 8 content type schemas
│   └── components/               # Shared + Dynamic Zone components
└── config/                       # CORS, middleware, server config
```

---

## Pages & Routes

| Route | Type | Description |
|---|---|---|
| `/` | Static | SPA home — Hero, About preview, Skills, Featured, Certifications, Engagements |
| `/about` | Static | Full professional narrative + CV download + social links |
| `/contact` | Static | Contact form (Resend Server Action) |
| `/blog/[slug]` | SSG | Internal blog with Dynamic Zone blocks; external blogs server-redirect |
| `/case-studies/[slug]` | SSG | Project deep-dive with challenge/solution + skills sidebar |
| `/api/revalidate` | Dynamic | Strapi webhook receiver — clears Next.js cache tags on publish |
| `/sitemap.xml` | Static | Auto-generated; internal blogs + case studies |
| `/robots.txt` | Static | Allows all, disallows `/api/` |

---

## Application Flow

### 1. Page Render (SSG)

```
Build time:
  generateStaticParams() → fetches all slugs from Strapi
  → Next.js pre-renders each page as static HTML
  → Deployed to Vercel CDN edge

Runtime (cache hit):
  User visits page → CDN returns cached HTML instantly

Runtime (cache miss / first visit to new content):
  CDN miss → Next.js renders → fetches from Strapi with cache tags
  → Response cached at CDN + tagged for future invalidation
```

### 2. Content Update Flow (On-Demand Revalidation)

```
Editor publishes content in Strapi admin
  → Strapi fires webhook: POST /api/revalidate
     Headers: Authorization: Bearer <REVALIDATION_SECRET_TOKEN>
     Body:    { "model": "blog", "slug": "my-post" }
  → Route handler validates token
  → Calls revalidateTag("blogs") + revalidateTag("my-post")
  → Next.js purges matching CDN cache entries
  → Next visitor triggers a fresh fetch from Strapi
  → Updated content live within seconds — no redeploy
```

### 3. Blog Dynamic Zone

Each internal blog post is built from a sequence of typed content blocks:

```
contentBlocks[]
  ├── content.hero-block   → full-width image + heading
  ├── content.text-block   → Strapi Blocks rich text → RichTextRenderer
  ├── content.code-block   → syntax-highlighted <pre> + CopyButton
  └── content.callout-box  → Info / Warning / Success callout
```

Each block is individually wrapped in a `BlockErrorBoundary` — a single broken block cannot crash the page.

### 4. CMS-Down Resilience

The home page fetches all six sections in parallel via `Promise.allSettled`. Any section whose fetch fails independently renders a `<SectionUnavailable>` fallback message — the rest of the page is unaffected.

### 5. Contact Form

```
User submits form
  → ContactForm (client component) calls sendContactEmail Server Action
  → Server validates fields + email format
  → Resend API sends email
  → Success: toast notification
  → Resend 429: LinkedIn fallback message shown
  → Other error: generic retry message shown
```

---

## CMS Content Model

| Content Type | Kind | Key Fields |
|---|---|---|
| **AboutMe** | Single Type | `elevatorPitch`, `professionalNarrative` (Blocks), `resumeFile`, `socialLinks[]` |
| **FeaturedCurations** | Single Type | `manuallyCuratedList[]` — up to 5 explicit content overrides |
| **Blog** | Collection | `slug`, `isExternal`, `externalUrl`, `isFeatured`, `contentBlocks[]` (Dynamic Zone) |
| **Project** | Collection | `slug`, `leadershipRole`, `challenge` (Blocks), `solution` (Blocks), `skills_matrices[]` |
| **SkillsMatrix** | Collection | `skillName`, `category` (9 enum values), `yearsOfExperience` |
| **Certification** | Collection | `title`, `issuingBody`, `badgeImage`, `verificationUrl`, `expiryDate` |
| **EngagementAndActivity** | Collection | `title`, `description` (Blocks), `eventDate`, `isFeatured`, `gallery_items[]` |
| **Gallery** | Collection | `imageAsset`, `categoryTag` (4 enum values) |

**Featured Hybrid Engine:** `buildFeaturedList` checks `FeaturedCurations` for manual overrides first (max 5 explicit IDs). If empty, falls back to the 5 most-recent items with `isFeatured: true` aggregated across Blogs, Projects, and Engagements.

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### CMS Setup (Strapi)

```bash
cd cms
npm install
npm run develop
# Admin panel: http://localhost:1337/admin
```

1. Register your admin account on first launch
2. Go to **Settings → API Tokens** → create a read-only token named `nextjs-read`
3. Go to **Settings → Roles → Public** → enable `find` / `findOne` on all content types
4. Go to **Settings → Webhooks** → create a webhook:
   - URL: `http://localhost:3000/api/revalidate`
   - Events: all Entry events (Create, Update, Delete, Publish, Unpublish)
   - Header: `Authorization: Bearer <your REVALIDATION_SECRET_TOKEN>`

### Frontend Setup (Next.js)

```bash
cd profile
npm install

# Copy example env file and fill in values
cp .env.local.example .env.local
# Edit .env.local — see Environment Variables section below

npm run dev
# App: http://localhost:3000
```

---

## Environment Variables

Create `profile/.env.local` from the example file:

```bash
# Strapi connection
STRAPI_API_URL=http://localhost:1337
STRAPI_API_TOKEN=         # Read-only API token from Strapi admin

# Webhook security (shared secret between Next.js and Strapi)
REVALIDATION_SECRET_TOKEN= # Generate with: openssl rand -base64 32

# Email (Resend)
RESEND_API_KEY=            # From resend.com dashboard

# Analytics (optional in dev)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Deployment (used in sitemap + OG metadata)
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

> **Security note:** `STRAPI_API_TOKEN`, `REVALIDATION_SECRET_TOKEN`, and `RESEND_API_KEY` are server-only. `lib/env.ts` throws at module load if any of these are accessed client-side.

---

## Available Scripts

All commands run from the `profile/` directory.

| Command | Description |
|---|---|
| `npm run dev` | Start dev server at `http://localhost:3000` |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |
| `npm run type-check` | TypeScript check (`tsc --noEmit`) |
| `npm test` | Run full Vitest test suite |
| `npm run test:watch` | Vitest in watch mode |

---

## Testing

```bash
cd profile && npm test
```

**45 tests across 9 suites:**

| Suite | Tests | Type |
|---|---|---|
| `filterExpiredCertifications` | 5 | Unit |
| `groupSkillsByCategory` | 5 | Unit |
| `richTextHelpers` | 5 | Unit |
| `buildFeaturedList` | 5 | Unit |
| `fetchStrapiData` | 7 | Unit (retry + backoff) |
| `sendContactEmail` | 6 | Unit (Server Action) |
| `/api/revalidate` route | 6 | Integration |
| `SkillBadge` component | 3 | Component (RTL + jsdom) |
| `CertificationsSection` component | 3 | Component (RTL + jsdom) |

---

## Deployment

### Live Deployment

| Service | URL | Platform |
|---|---|---|
| **Frontend** | https://akashdborkar.vercel.app | Vercel |
| **CMS** | https://strapi-cms-2usx.onrender.com | Render Free |

See `DEPLOYMENT.md` for the full step-by-step guide including env vars, webhook wiring, and troubleshooting.

**Note on Render free tier:** The Strapi admin Vite bundle OOMs on 512 MB RAM. `cms/dist/` is pre-built locally and committed — Render's build command is `npm install` only (no webpack/Vite step).

---

## Key Design Decisions

**Strapi v5 flat shape** — Strapi v5 removes the `attributes` wrapper from API responses. All TypeScript interfaces in `lib/types.ts` use the flat shape directly (e.g., `blog.slug` not `blog.attributes.slug`).

**Dynamic Zone populate** — Strapi v5 requires fragment syntax for Dynamic Zone populate: `populate[contentBlocks][on][content.text-block][populate]=*`. A wildcard `populate=*` does not traverse into Dynamic Zones.

**Media field populate** — Strapi v5 rejects wildcard populate on media fields inside Dynamic Zones. Use explicit field selection: `populate[image][fields][0]=url&...`.

**`revalidateTag` in Next.js 16** — Next.js 16 changed `revalidateTag` to require a second `profile` argument. The revalidation route passes `'default'` as the profile.

**Server-only secrets** — `lib/env.ts` throws at module load if imported client-side, preventing accidental secret leakage into the client bundle.
