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
    page.tsx                              # SPA home — Promise.allSettled over all sections
    api/revalidate/route.ts               # Strapi publish webhook — MODEL_TO_TAG_MAP + revalidateTag
    api/cron/sync-linkedin/route.ts       # Vercel Cron — triggers Apify actor, returns immediately
    api/webhooks/apify-linkedin/route.ts  # Apify run callback — fetch dataset → transform → Strapi
    blog/[slug]/page.tsx                  # generateStaticParams + server-side redirect for external
    case-studies/[slug]/page.tsx
  lib/
    apify.ts    # Apify API client (triggerLinkedInActorRun, fetchDatasetItems) + LinkedIn transformer
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
      sync-linkedin/                # POST /api/sync-linkedin — verify-sync-token policy + controller
      # + 9 content types: about-me, blog, project, skills-matrix, certification,
      #                     engagement-and-activity, gallery, featured-curation, contact
    sync/
      sync-engine.service.ts        # Core sync logic — dedup, upsert, revalidate
      strapi-client.ts              # Self-referential Strapi REST calls (uses STRAPI_SYNC_API_TOKEN)
      media-processor.ts            # Badge image upload helper (Cloudinary removed for post media)
    components/
      shared/       # social-link, curated-item
      content/      # hero-block, text-block, code-block, callout-box (blog Dynamic Zone)
```

## Environment Variables

```bash
# profile/.env.local — Vercel environment
STRAPI_API_URL=http://localhost:1337
STRAPI_API_TOKEN=...                    # Read-only Strapi token
REVALIDATION_SECRET_TOKEN=...           # openssl rand -base64 32
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_STRAPI_HOST=...             # Strapi hostname for next/image domain allowlist
NEXT_PUBLIC_SITE_URL=https://akashborkar.com

# LinkedIn sync — Vercel only
CRON_SECRET=...                         # Auto-injected by Vercel; also set locally for manual cron tests
APIFY_TOKEN=...                         # Apify API token (Settings → Integrations → API tokens)
APIFY_ACTOR_ID=sovereigntaylor~linkedin-profile-scraper
LINKEDIN_PROFILE_URL=https://www.linkedin.com/in/akashdborkar/
APIFY_WEBHOOK_SECRET=...                # openssl rand -base64 32 — validates Apify callbacks
RENDER_SYNC_TOKEN=...                   # openssl rand -base64 32 — Vercel→Strapi handshake
```

```bash
# Render (Strapi) environment — LinkedIn sync engine
RENDER_SYNC_TOKEN=...                   # Must match Vercel value
STRAPI_SYNC_API_TOKEN=...               # Full-access Strapi API token for sync engine self-calls
STRAPI_API_URL=http://localhost:1337    # Self-referential on Render
NEXT_REVALIDATION_URL=https://akashdborkar.vercel.app
REVALIDATION_SECRET_TOKEN=...          # Must match Vercel value
```

## Production Deployment

| Service | URL | Platform |
|---|---|---|
| Frontend | https://akashdborkar.vercel.app | Vercel (Next.js SSG) |
| CMS | https://strapi-cms-2usx.onrender.com | Render Free + Neon PostgreSQL |
| Media | Cloudinary (free tier) | — |

**CMS admin:** `admin@profile.local` — change password at `/admin` on first use.

**IMPORTANT — CMS dist build rule:** Render serves `cms/dist/` directly (pre-built locally) because the Strapi admin Vite build OOMs on Render's 512 MB free tier. Render's build command is `npm install` only — it never runs `strapi build`. This means **every commit that changes anything in `cms/src/` or `cms/src/api/*/schema.json` must also include a rebuilt `cms/dist/`**, otherwise the schema changes will never reach production.

After any CMS change:
```bash
# If a new content type was added, regenerate TS types first
cd cms && npx strapi ts:generate-types

# Always rebuild and force-add dist
cd cms && npm run build
git add -f cms/dist/
git add cms/types/generated/contentTypes.d.ts   # if types were regenerated
```

## LinkedIn Data Sync

### Architecture (Async Webhook — required by Vercel Hobby 10s limit)

```
Vercel Cron (Sunday 2am UTC) — vercel.json: { "path": "/api/cron/sync-linkedin", "schedule": "0 2 * * 0" }
  └─ GET /api/cron/sync-linkedin
       ├─ Auth: Authorization: Bearer $CRON_SECRET  (Vercel auto-injects on cron requests)
       ├─ Calls triggerLinkedInActorRun() in lib/apify.ts
       │    POST https://api.apify.com/v2/acts/sovereigntaylor~linkedin-profile-scraper/runs
       │    Body: { profileUrls: [LINKEDIN_PROFILE_URL], scrapeType: "profiles", maxResults: 1 }
       │    Query: webhooks=<base64 JSON> → points to /api/webhooks/apify-linkedin
       └─ Returns { triggered: true, runId } in ~1s — function exits immediately

Apify actor runs (1–3 min)
  └─ Scrapes https://www.linkedin.com/in/akashdborkar/
  └─ On SUCCEEDED → POST /api/webhooks/apify-linkedin?secret=APIFY_WEBHOOK_SECRET

Webhook handler (profile/app/api/webhooks/apify-linkedin/route.ts)
  └─ Validates ?secret= against APIFY_WEBHOOK_SECRET
  └─ Fetches dataset: GET /v2/datasets/{defaultDatasetId}/items?clean=true
  └─ transformLinkedInOutput(items) → LinkedInScraperPayload { certifications[], featuredPosts[] }
  └─ POST https://strapi/api/sync-linkedin  { X-Sync-Token: RENDER_SYNC_TOKEN }

Strapi sync endpoint (cms/src/api/sync-linkedin/)
  └─ verify-sync-token policy checks X-Sync-Token === RENDER_SYNC_TOKEN
  └─ Controller calls syncLinkedInData(payload) in cms/src/sync/sync-engine.service.ts
  └─ Per cert: dedup by linkedinCertId → skip existing → upload badge → createCertification
  └─ Per post: dedup by linkedinPostId → skip existing / update media → createEngagement
  └─ POST /api/revalidate on Next.js → revalidateTag("certification") + revalidateTag("engagement-and-activity")
```

### Known Limitation — LinkedIn Bot Detection

`sovereigntaylor~linkedin-profile-scraper` uses **CheerioCrawler** (non-browser HTTP). LinkedIn returns **HTTP 999** against plain HTTP requests from Apify's shared IP pool without residential proxies. The Apify free plan ($5/month compute credit) does not include residential proxies (~$12/GB).

**Current state:** Cron fires → Apify run SUCCEEDED → dataset empty (LinkedIn blocked) → 0 items synced.
**Workaround:** Add certifications manually via https://strapi-cms-2usx.onrender.com/admin.

### Future Paths

| Option | Cost | Code change needed |
|---|---|---|
| Residential proxies | ~$12/GB (Apify/BrightData) | Add `proxyConfiguration` to actor input in `lib/apify.ts` |
| Playwright-based actor | Free compute only | Swap `APIFY_ACTOR_ID` env var; update transformer |
| LinkedIn Official API | Free (partner approval required) | Replace Apify layer entirely |
| Manual CSV import | Free, one-time | Export LinkedIn Settings → Data Privacy → Get a copy → parse `Certifications.csv` and POST to Strapi API |

### Transformer (`lib/apify.ts`)

`transformLinkedInOutput(items)` maps `sovereigntaylor` actor output to `LinkedInScraperPayload`. If switching actors, only this function needs updating — the webhook handler and Strapi sync engine are actor-agnostic.

Field mapping: `cert.name` → `title`, `cert.authority` → `issuingBody`, `cert.licenseNumber` → `linkedinCertId`, `cert.expiryDate` (string `"Jan 2026"`) or `cert.timePeriod` (object `{ endDate: { year, month } }`) → `expiryDate`.

## Next Steps

1. Lighthouse audits (Performance/Accessibility/SEO/Best Practices ≥ 95 on all pages)
2. Fix LinkedIn scraping — see LinkedIn Data Sync section above
3. See `todo.md` for full checklist
