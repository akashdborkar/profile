# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A personal branding and thought-leadership platform for a Lead Technical Consultant (Akash Borkar). Decoupled JAMstack: **Next.js 16** (App Router) frontend in `profile/` + **Strapi v5** headless CMS in `cms/`.

**Live URLs:**
- Frontend: **https://akashdborkar.vercel.app** (Vercel)
- CMS Admin: **https://strapi-cms-2usx.onrender.com/admin** (Render Free)

**Current status:** Fully deployed. Remaining work: Lighthouse audits.

## Commands

**Frontend (`profile/`):**
```bash
npm run dev          # Start dev server at http://localhost:3000
npm run build        # Production build
npm run start        # Serve production build
npm run lint         # ESLint
npm run type-check   # tsc --noEmit
npm test             # Vitest run (45 tests)
npm run test:watch   # Vitest watch mode
```

Run a single test file:
```bash
npx vitest run lib/utils/__tests__/filterExpiredCertifications.test.ts
```

**CMS (`cms/`):**
```bash
npm run develop      # Start Strapi at http://localhost:1337
npm run build        # Build Strapi admin panel
```

## Architecture

### Version Reality Check

The actual versions differ from the original spec — always trust these:

| Layer | Actual Version | Spec Said |
|---|---|---|
| Next.js | **16.2.6** | 15 |
| Tailwind CSS | **v4** | v3 |
| shadcn/ui | **v4** | — |
| Strapi | **v5.46.0** | v4 |
| React | **19** | — |
| Test runner | **Vitest v3** | Jest |

### Strapi v5 API — Critical Differences from v4

Strapi v5 uses a **flat response format** — no `attributes` wrapper. Every type extends `StrapiEntity` directly:

```ts
// v5 (correct)
res.data.title        // ✓
// v4 style (WRONG)
res.data.attributes.title  // ✗
```

**Dynamic Zone populate** uses fragment syntax — `populate=*` does NOT work for dynamic zones:
```
populate[contentBlocks][on][content.hero-block][populate][image][fields][0]=url
```

**Media fields** must use explicit `[fields][n]=fieldName` — `[image]=*` is rejected in v5.

`revalidateTag` in Next.js 16 requires a second profile argument: `revalidateTag(tag, 'default')`.

### Tailwind CSS v4

Configuration is CSS-first, not `tailwind.config.ts`:
- Use `@import "tailwindcss"` (not `@tailwind base/components/utilities`)
- Dark mode via `@custom-variant dark` in `globals.css`
- Content scanning via explicit `@source "../app"` and `@source "../components"` directives

### shadcn v4

`Button` has **no `asChild` prop**. For link-styled buttons, use `buttonVariants` helper directly:
```tsx
<Link href="/" className={buttonVariants({ variant: 'outline' })}>Go Home</Link>
```

### Caching Model

SSG at build time. On-demand revalidation via `app/api/revalidate/route.ts`: Strapi fires a webhook → `revalidateTag(modelName, 'default')`. Every `fetch` in `lib/api.ts` passes `next: { tags: [...] }` matching `MODEL_TO_TAG_MAP` in the route handler.

### CMS-Down Resilience

`app/page.tsx` uses `Promise.allSettled` for all section fetches. Sections receive `T | null` and render `<SectionUnavailable sectionName="..." />` on null.

### Featured Content Hybrid Engine (`lib/utils/buildFeaturedList.ts`)

Checks `FeaturedCurations` single type first (max 5 explicit IDs). Falls back to the 5 most-recent `isFeatured=true` items aggregated across Blogs, Projects, and Engagements.

### Server-Only Secrets

`STRAPI_API_TOKEN`, `REVALIDATION_SECRET_TOKEN`, and `RESEND_API_KEY` must never have `NEXT_PUBLIC_` prefix. `lib/env.ts` throws at module load if `typeof window !== 'undefined'`.

### External Blog Routing

Blogs with `isExternal: true` use server-side `redirect(externalUrl)` inside `app/blog/[slug]/page.tsx` — no client-side redirect.

### Block Error Isolation

Each block in `DynamicZoneRenderer` is wrapped in `BlockErrorBoundary` (class component) so one malformed block doesn't crash the page.

## Testing

Vitest v3 — **not** Jest. Config in `profile/vitest.config.ts`:

- `lib/` tests run under `node` environment
- `components/**/__tests__/*.test.tsx` run under `jsdom` environment (via `environmentMatchGlobs`)
- JSX transform uses esbuild (`@vitejs/plugin-react` removed — was incompatible with Vite 7)

## Key Files

```
profile/
  app/
    page.tsx                     # SPA home — Promise.allSettled over all sections
    api/revalidate/route.ts      # Webhook endpoint with MODEL_TO_TAG_MAP
    blog/[slug]/page.tsx         # generateStaticParams + server-side redirect for external
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
    actions/sendContactEmail.ts     # 'use server' — Resend API
  components/
    blocks/   # DynamicZoneRenderer, BlockErrorBoundary, HeroBlock, TextBlock, CodeBlock, CalloutBox, CopyButton
    sections/ # Page sections (HeroSection, SkillsMatrixSection, FeaturedSection, etc.)
    layout/   # Navbar, Footer, SectionWrapper
    ui/       # Atoms: SkillBadge, FeaturedCard, CertificationCard, RichTextRenderer, SectionUnavailable, etc.
cms/
  src/
    api/            # 8 content types (about-me, blog, project, skills-matrix, certification, engagement-and-activity, gallery, featured-curation)
    components/
      shared/       # social-link, curated-item
      content/      # hero-block, text-block, code-block, callout-box (blog Dynamic Zone)
```

## Environment Variables

```bash
# profile/.env.local
STRAPI_API_URL=http://localhost:1337
STRAPI_API_TOKEN=...
REVALIDATION_SECRET_TOKEN=...   # use `openssl rand -base64 32` for production
RESEND_API_KEY=...
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_STRAPI_HOST=...     # production Strapi hostname for next/image
NEXT_PUBLIC_SITE_URL=https://akashborkar.com
```

## Production Deployment

| Service | URL | Platform |
|---|---|---|
| Frontend | https://akashdborkar.vercel.app | Vercel (Next.js SSG) |
| CMS | https://strapi-cms-2usx.onrender.com | Render Free + Neon PostgreSQL |
| Media | Cloudinary (free tier) | — |

**CMS admin:** `admin@profile.local` — change password at `/admin` on first use.

**To update the pre-built admin panel** (after schema changes):
```bash
cd cms && npm run build && git add -f dist/ && git commit && git push
```

## Next Steps

1. Lighthouse audits (Performance/Accessibility/SEO/Best Practices ≥ 95 on all pages)
2. See `todo.md` for full checklist
