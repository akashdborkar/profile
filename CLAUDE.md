# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A personal branding and thought-leadership platform for a Lead Technical Consultant. The architecture is a decoupled JAMstack: **Next.js 15** (App Router) frontend hosted on Vercel consuming content from a **Strapi v4** headless CMS.

**Current status:** Planning/specification phase. Source code has not yet been scaffolded. Start with `blueprint.md` and track progress using `todo.md`.

## Planned Monorepo Structure

```
profile/               ← Next.js frontend (create with create-next-app)
cms/                   ← Strapi v4 backend (create with create-strapi-app)
spec.md                ← Full technical specification
blueprint.md           ← Step-by-step implementation prompts (16 prompts)
todo.md                ← Build checklist — use this to track progress
```

## Commands (once scaffolded)

**Frontend (`profile/`):**
```bash
npm run dev          # Start dev server at http://localhost:3000
npm run build        # Production build
npm run start        # Serve production build
npm run lint         # ESLint
npm run type-check   # tsc --noEmit (add this script in Prompt 16)
npm test             # Jest/Vitest test suite
npm test -- <pattern> # Run a single test file
```

**CMS (`cms/`):**
```bash
npm run develop      # Start Strapi at http://localhost:1337
npm run build        # Build Strapi admin panel
```

## Architecture

### Caching Model
- **SSG at build time** for all pages — maximizes Core Web Vitals and SEO.
- **On-demand revalidation** via `app/api/revalidate/route.ts`: Strapi fires a webhook on content publish/update, which calls `revalidateTag(modelName)` — no full redeploy needed.
- Every `fetch` in `lib/api.ts` must pass `next: { tags: [...] }` cache tags matching the `MODEL_TO_TAG_MAP` in the revalidation route.

### Frontend Directory Layout
```
app/
  layout.tsx                  # ThemeProvider, Inter font, Toaster, GA4
  page.tsx                    # SPA home — all sections, parallel fetch via Promise.allSettled
  about/page.tsx
  contact/page.tsx
  blog/[slug]/page.tsx        # generateStaticParams + external redirect logic
  case-studies/[slug]/page.tsx
  api/revalidate/route.ts     # Webhook endpoint (auth token → revalidateTag)
  error.tsx                   # Global error boundary
  not-found.tsx
  sitemap.ts
  robots.ts
components/
  layout/                     # Navbar, Footer, SectionWrapper
  sections/                   # Page-level sections (HeroSection, SkillsMatrixSection, etc.)
  blocks/                     # Dynamic Zone renderers (HeroBlock, CodeBlock, etc.)
  ui/                         # Reusable atoms (SkillBadge, FeaturedCard, CertificationCard, etc.)
  providers/ThemeProvider.tsx
lib/
  api.ts          # All Strapi fetch helpers with cache tags
  strapi.ts       # Base fetch client (Authorization header, error handling)
  types.ts        # TypeScript interfaces for all Strapi content types
  env.ts          # Validated env var accessors — server-only, throws if called client-side
  design-tokens.ts
  actions/sendContactEmail.ts  # 'use server' — Resend API integration
  utils/
    filterExpiredCertifications.ts
    groupSkillsByCategory.ts
    buildFeaturedList.ts       # Featured hybrid engine (manual curation → isFeatured fallback)
    richTextHelpers.ts         # extractFirstParagraph for Strapi Blocks JSON
    analytics.ts               # trackExternalBlogClick, trackCertificationVerificationClick
```

### Key Architectural Patterns

**Strapi Blocks (Rich Text):** Content is stored as a JSON tree (not Markdown). Use `RichTextRenderer` component to render it and `extractFirstParagraph` from `lib/utils/richTextHelpers.ts` for plain-text excerpts.

**Featured Content Hybrid Engine (`buildFeaturedList`):** First checks `FeaturedCurations` single type for manual overrides (max 5 explicit IDs). If empty, falls back to the 5 most-recent `isFeatured=true` items aggregated across Blogs, Projects, and Engagements via `Promise.all`.

**CMS-Down Resilience:** `app/page.tsx` uses `Promise.allSettled` (not `Promise.all`) for all section fetches. Sections receive `T | null` — render `<SectionUnavailable>` on null rather than throwing.

**Server-Only Secrets:** `STRAPI_API_TOKEN`, `REVALIDATION_SECRET_TOKEN`, and `RESEND_API_KEY` must never have the `NEXT_PUBLIC_` prefix. `lib/env.ts` throws at module load if `typeof window !== 'undefined'`.

**External Blog Routing:** Blogs with `isExternal: true` are redirected server-side via `redirect(externalUrl)` inside `app/blog/[slug]/page.tsx` — no client-side redirect.

**Block Error Isolation:** Each block in `DynamicZoneRenderer` is wrapped in `BlockErrorBoundary` so a single malformed content block does not crash the entire blog page.

### Technology Stack

| Layer | Technology |
|---|---|
| Frontend framework | Next.js 15 (App Router, RSC) |
| Styling | Tailwind CSS v3 + shadcn/ui (Slate base) |
| Theme | next-themes, dark-first (`defaultTheme="dark"`) |
| CMS | Strapi v4 (SQLite dev / PostgreSQL prod) |
| Email | Resend API via Server Action |
| Analytics | GA4 via `@next/third-parties/google` (production only) |
| Deployment | Vercel (frontend) + Railway/Render (Strapi) |

### Environment Variables

```bash
# profile/.env.local
STRAPI_API_URL=http://localhost:1337
STRAPI_API_TOKEN=...          # Strapi read-only API token
REVALIDATION_SECRET_TOKEN=... # Shared secret with Strapi webhook header
RESEND_API_KEY=...
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

## Implementation Order

Follow the 16 prompts in `blueprint.md` in sequence. The `todo.md` checklist mirrors each prompt. Key dependencies:

- Prompts 1–3: Scaffold frontend + Strapi schemas (no dependencies on each other after init)
- Prompt 4: Typed API client — required before any UI work
- Prompts 5–9: SPA sections — build in order (each wires into `app/page.tsx`)
- Prompts 10–12: Standalone pages and dynamic routes
- Prompts 13–16: Integrations, error handling, testing, deployment hardening
