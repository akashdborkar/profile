# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A personal branding and thought-leadership platform for a Lead Technical Consultant (Akash Borkar). Decoupled JAMstack: **Next.js 16.2.6** (App Router) frontend in `profile/` + **Strapi v5** headless CMS in `cms/`.

Stack: Next.js 16.2.6 · React 19 · Tailwind CSS v4 · shadcn/ui v4 · Strapi v5.46.0 · Vitest v3

**Live URLs:**
- Frontend: https://akashdborkar.vercel.app (Vercel)
- CMS Admin: https://strapi-cms-2usx.onrender.com/admin (Render Free)

## Commands

**Frontend (`profile/`):**
```bash
npm run dev          # Start dev server at http://localhost:3000
npm run build        # Production build
npm run lint         # ESLint
npm run type-check   # tsc --noEmit
npm test             # Vitest run
npm run test:watch   # Vitest watch mode
npx vitest run lib/utils/__tests__/filterExpiredCertifications.test.ts  # single file
```

**CMS (`cms/`):**
```bash
npm run develop      # Start Strapi at http://localhost:1337
npm run build        # Build Strapi admin panel
```

## Architecture

### Strapi v5 API

Flat response format — no `attributes` wrapper:
```ts
res.data.title        // ✓
res.data.attributes.title  // ✗ (v4 style — wrong)
```

**Dynamic Zone populate** requires fragment syntax — `populate=*` does NOT work:
```
populate[contentBlocks][on][content.hero-block][populate][image][fields][0]=url
```

**Media fields** must use explicit `[fields][n]=fieldName` — `[image]=*` is rejected.

`revalidateTag` in Next.js 16 requires a second argument: `revalidateTag(tag, 'default')`.

### Tailwind CSS v4

CSS-first config — no `tailwind.config.ts`:
- `@import "tailwindcss"` (not `@tailwind base/components/utilities`)
- Dark mode via `@custom-variant dark` in `globals.css`
- Content scanning via `@source "../app"` and `@source "../components"` directives

### shadcn v4

`Button` has no `asChild` prop. Use `buttonVariants` for link-styled buttons:
```tsx
<Link href="/" className={buttonVariants({ variant: 'outline' })}>Go Home</Link>
```

### Caching Model

SSG at build time. On-demand revalidation: Strapi webhook → `app/api/revalidate/route.ts` → `revalidateTag(modelName, 'default')`. Every `fetch` in `lib/api.ts` passes `next: { tags: [...] }` matching `MODEL_TO_TAG_MAP`.

### CMS-Down Resilience

`app/page.tsx` uses `Promise.allSettled` for all section fetches. Sections receive `T | null` and render `<SectionUnavailable sectionName="..." />` on null.

### Featured Content Hybrid Engine

`lib/utils/buildFeaturedList.ts` — checks `FeaturedCurations` single type first (max 5 explicit IDs), falls back to 5 most-recent `isFeatured=true` items across Blogs, Projects, and Engagements.

### Server-Only Secrets

`STRAPI_API_TOKEN`, `REVALIDATION_SECRET_TOKEN`, and `RESEND_API_KEY` must never have `NEXT_PUBLIC_` prefix. `lib/env.ts` throws at module load if `typeof window !== 'undefined'`.

### External Blog Routing

Blogs with `isExternal: true` use server-side `redirect(externalUrl)` in `app/blog/[slug]/page.tsx`.

### Block Error Isolation

Each block in `DynamicZoneRenderer` is wrapped in `BlockErrorBoundary` so one malformed block doesn't crash the page.

## Testing

Vitest v3 — not Jest. Config in `profile/vitest.config.ts`:
- `lib/` tests: `node` environment
- `components/**/__tests__/*.test.tsx`: `jsdom` environment (via `environmentMatchGlobs`)
- JSX transform uses esbuild (`@vitejs/plugin-react` removed — incompatible with Vite 7)

## Key Files

```
profile/
  app/
    page.tsx                              # SPA home — Promise.allSettled over all sections
    api/revalidate/route.ts               # Strapi publish webhook — MODEL_TO_TAG_MAP + revalidateTag
    blog/[slug]/page.tsx                  # generateStaticParams + server-side redirect for external
    case-studies/[slug]/page.tsx
  lib/
    api.ts      # All fetch helpers — BLOG_BLOCKS_POPULATE uses fragment syntax
    strapi.ts   # Base fetch client
    types.ts    # All TypeScript interfaces (Strapi v5 flat)
    env.ts      # Server-only env accessors — throws client-side
    utils/
      buildFeaturedList.ts          # Hybrid featured engine
      fetchStrapiData.ts            # SSG fetch with exponential backoff (cold-start resilient)
      filterExpiredCertifications.ts
      groupSkillsByCategory.ts
      richTextHelpers.ts            # extractFirstParagraph for Strapi Blocks JSON
      analytics.ts                  # GA4 event helpers (guard: window.gtag)
  components/
    blocks/   # DynamicZoneRenderer, BlockErrorBoundary, HeroBlock, TextBlock, CodeBlock, CalloutBox, CopyButton
    sections/ # Page sections (HeroSection, SkillsMatrixSection, FeaturedSection, etc.)
    layout/   # Navbar, Footer, SectionWrapper
    ui/       # Atoms: SkillBadge, FeaturedCard, CertificationCard, RichTextRenderer, SectionUnavailable, etc.
cms/
  src/
    api/
      # 9 content types: about-me, blog, project, skills-matrix, certification,
      #                   engagement-and-activity, gallery, featured-curation, contact
    components/
      shared/       # social-link, curated-item
      content/      # hero-block, text-block, code-block, callout-box (blog Dynamic Zone)
```

## Environment Variables

```bash
# profile/.env.local
STRAPI_API_URL=http://localhost:1337
STRAPI_API_TOKEN=...                    # Read-only Strapi token
REVALIDATION_SECRET_TOKEN=...           # openssl rand -base64 32
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_STRAPI_HOST=...             # Strapi hostname for next/image domain allowlist
NEXT_PUBLIC_SITE_URL=https://akashborkar.com
```

```bash
# Render (Strapi)
STRAPI_API_URL=http://localhost:1337
NEXT_REVALIDATION_URL=https://akashdborkar.vercel.app
REVALIDATION_SECRET_TOKEN=...          # Must match Vercel value
```

## Production Deployment

| Service | URL | Platform |
|---|---|---|
| Frontend | https://akashdborkar.vercel.app | Vercel (Next.js SSG) |
| CMS | https://strapi-cms-2usx.onrender.com | Render Free + Neon PostgreSQL |
| Media | Cloudinary (free tier) | — |

**IMPORTANT — CMS dist build rule:** Render serves `cms/dist/` directly (pre-built locally) because the Strapi admin Vite build OOMs on Render's 512 MB free tier. Render's build command is `npm install` only. **Every commit touching `cms/src/` or any `schema.json` must include a rebuilt `cms/dist/`.**

After any CMS change:
```bash
cd cms && npx strapi ts:generate-types  # only if content types changed
cd cms && npm run build
git add -f cms/dist/
git add cms/types/generated/contentTypes.d.ts   # if types were regenerated
```

