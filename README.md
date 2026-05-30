# Akash Borkar — Lead Technical Consultant Portfolio

A production-grade personal branding platform built as a decoupled JAMstack. The Next.js frontend is fully statically generated and consumes structured content from a Strapi v5 headless CMS, with on-demand cache revalidation so the site updates instantly when content is published — no redeploy required.

**Live:** https://akashdborkar.vercel.app

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16.2.6 (App Router, RSC) + React 19 |
| Styling | Tailwind CSS v4 + shadcn/ui v4 |
| CMS | Strapi v5 |
| Email | Resend API via Server Action |
| Analytics | GA4 via `@next/third-parties` |
| Testing | Vitest v3 + React Testing Library |
| Deployment | Vercel (frontend) · Render Free + Neon PostgreSQL (CMS) · Cloudinary (media) |

---

## Project Structure

```
profile/                          ← Next.js frontend
├── app/
│   ├── page.tsx                  # SPA home — all sections, Promise.allSettled
│   ├── about/page.tsx
│   ├── contact/page.tsx
│   ├── blog/[slug]/page.tsx      # SSG + external redirect logic
│   ├── case-studies/[slug]/page.tsx
│   └── api/
│       ├── revalidate/route.ts   # Strapi publish webhook
│       ├── cron/sync-linkedin/   # Vercel Cron — triggers Apify
│       └── webhooks/apify-linkedin/ # Apify run callback
├── components/
│   ├── blocks/                   # Dynamic Zone renderers (blog content)
│   ├── layout/                   # Navbar, Footer, SectionWrapper
│   ├── sections/                 # Page-level sections
│   └── ui/                       # Reusable atoms (shadcn + custom)
└── lib/
    ├── api.ts                    # All Strapi fetch helpers with cache tags
    ├── apify.ts                  # Apify API client + LinkedIn transformer
    ├── types.ts                  # TypeScript interfaces (Strapi v5 flat shape)
    ├── env.ts                    # Server-only env accessors
    └── utils/                    # Analytics, featured engine, filters, rich text

cms/                              ← Strapi v5 backend
├── src/
│   ├── api/                      # 9 content types + sync-linkedin endpoint
│   ├── components/               # Shared + Dynamic Zone components
│   └── sync/                     # LinkedIn sync engine
└── config/
```

---

## Pages & Routes

| Route | Type | Description |
|---|---|---|
| `/` | Static | SPA home — Hero, About, Skills, Featured, Certifications, Engagements |
| `/about` | Static | Full professional narrative + CV download |
| `/contact` | Static | Contact details — CMS-driven |
| `/blog/[slug]` | SSG | Internal blog with Dynamic Zone blocks; external blogs server-redirect |
| `/case-studies/[slug]` | SSG | Project deep-dive with challenge/solution + skills sidebar |
| `/api/revalidate` | Dynamic | Strapi webhook receiver — clears Next.js cache tags on publish |

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
2. **Settings → API Tokens** → create a read-only token named `nextjs-read`
3. **Settings → Roles → Public** → enable `find` / `findOne` on all content types
4. **Settings → Webhooks** → create a webhook:
   - URL: `http://localhost:3000/api/revalidate`
   - Events: all Entry events (Create, Update, Delete, Publish, Unpublish)
   - Header: `Authorization: Bearer <your REVALIDATION_SECRET_TOKEN>`

### Frontend Setup (Next.js)

```bash
cd profile
npm install
cp .env.local.example .env.local   # fill in values — see Environment Variables below
npm run dev
# App: http://localhost:3000
```

---

## Environment Variables

```bash
# profile/.env.local
STRAPI_API_URL=http://localhost:1337
STRAPI_API_TOKEN=           # Read-only API token from Strapi admin
REVALIDATION_SECRET_TOKEN=  # openssl rand -base64 32
RESEND_API_KEY=             # From resend.com dashboard
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_STRAPI_HOST=    # Strapi hostname for next/image domain allowlist

# LinkedIn sync (Vercel only)
APIFY_TOKEN=
APIFY_ACTOR_ID=sovereigntaylor~linkedin-profile-scraper
LINKEDIN_PROFILE_URL=https://www.linkedin.com/in/yourprofile/
APIFY_WEBHOOK_SECRET=       # openssl rand -base64 32
RENDER_SYNC_TOKEN=          # openssl rand -base64 32 — must match Render env var
```

Strapi (Render) also needs: `RENDER_SYNC_TOKEN`, `STRAPI_SYNC_API_TOKEN`, `STRAPI_API_URL`, `NEXT_REVALIDATION_URL`, `REVALIDATION_SECRET_TOKEN`.

> `STRAPI_API_TOKEN`, `REVALIDATION_SECRET_TOKEN`, `RESEND_API_KEY`, and `RENDER_SYNC_TOKEN` are server-only. `lib/env.ts` throws at module load if accessed client-side.

---

## CMS Schema Changes

Render's free tier (512 MB RAM) OOMs during `strapi build`, so `cms/dist/` is pre-built locally and committed. Render's build command is `npm install` only.

**Every commit that touches `cms/src/` or any `schema.json` must include a rebuilt `cms/dist/`:**

```bash
cd cms && npx strapi ts:generate-types  # only if content types changed
cd cms && npm run build
git add -f cms/dist/
git add cms/types/generated/contentTypes.d.ts   # if types were regenerated
git add cms/src/
git commit -m "your message"
```

Skipping the build = schema changes that never reach production.

---

## Testing

```bash
cd profile && npm test   # Vitest — 45 tests across 9 suites
```
