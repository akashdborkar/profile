# Deployment Guide — Render (CMS) + Vercel (Frontend)

This guide wires the monorepo together for production:
- **Backend** (`/cms`) → Render Free Web Service + Neon PostgreSQL + Cloudinary
- **Frontend** (`/profile`) → Vercel + Next.js SSG

---

## Prerequisites

Before starting, have the following ready:

| Service | What you need |
|---|---|
| [Render](https://render.com) | Account connected to GitHub repo |
| [Neon](https://neon.tech) | Project created; copy the **pooler** connection string |
| [Cloudinary](https://cloudinary.com) | Free account; note Cloud Name, API Key, API Secret |
| [Vercel](https://vercel.com) | Account connected to GitHub repo |
| [Resend](https://resend.com) | API key for contact form emails |

---

## Phase 1 — Deploy the Backend to Render

### 1.1 Create the Web Service

1. Go to **Render Dashboard → New → Web Service**
2. Connect your GitHub repository
3. Configure the service:

| Setting | Value |
|---|---|
| **Name** | `akash-cms` (or your choice) |
| **Root Directory** | `cms` |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm run start` |
| **Instance Type** | `Free` |

### 1.2 Set Environment Variables

In **Settings → Environment**, add every variable from the table below. Use the **"Add Environment Variable"** button for each row — do not use a `.env` file upload.

| Variable | Value | How to generate |
|---|---|---|
| `NODE_ENV` | `production` | Literal |
| `NODE_OPTIONS` | `--max-old-space-size=400` | See note below |
| `NODE_VERSION` | `20` | Literal (Strapi v5 requires ≥ 20) |
| `HOST` | `0.0.0.0` | Literal — required for Render to route traffic |
| `DATABASE_CLIENT` | `postgres` | Literal |
| `DATABASE_URL` | `postgresql://...` | Neon dashboard → **Pooler** connection string |
| `DATABASE_POOL_MIN` | `2` | Literal |
| `DATABASE_POOL_MAX` | `4` | Literal — hard cap for Neon free tier |
| `CLOUDINARY_NAME` | `<cloud_name>` | Cloudinary dashboard → Account details |
| `CLOUDINARY_KEY` | `<api_key>` | Cloudinary dashboard → API Keys |
| `CLOUDINARY_SECRET` | `<api_secret>` | Cloudinary dashboard → API Keys |
| `APP_KEYS` | `key1,key2,key3,key4` | Run `openssl rand -base64 16` four times, comma-separate |
| `API_TOKEN_SALT` | `<random>` | `openssl rand -base64 16` |
| `ADMIN_JWT_SECRET` | `<random>` | `openssl rand -base64 32` |
| `TRANSFER_TOKEN_SALT` | `<random>` | `openssl rand -base64 16` |
| `JWT_SECRET` | `<random>` | `openssl rand -base64 32` |
| `ENCRYPTION_KEY` | `<random>` | `openssl rand -base64 16` |
| `FRONTEND_URL` | `https://akashborkar.com` | Your Vercel production domain (CORS allowlist) |

> **Why `NODE_OPTIONS=--max-old-space-size=400`**
>
> Render's Free tier provides **512 MB of RAM**. Node's V8 engine defaults to using up to ~1.5 GB of heap, which means it won't trigger garbage collection early enough and the process gets OOM-killed mid-build. Setting `--max-old-space-size=400` caps the old-generation heap at 400 MB, forcing V8 to GC more aggressively and stay within the 512 MB hard limit. Without this flag, `npm run build` (the Strapi admin webpack bundle) reliably crashes on the free tier.

### 1.3 Trigger the First Deploy

Click **Deploy** (or push to your connected branch). The first deploy takes 3–5 minutes because Render builds the Strapi admin panel (webpack). Subsequent deploys are faster (incremental).

Watch the build log for:
```
✔ Building build context
✔ Creating admin
info: Strapi started successfully
```

If you see an OOM error in the log, confirm `NODE_OPTIONS` is set correctly.

### 1.4 Generate the Production API Token

Once Strapi is live:

1. Open `https://<your-service>.onrender.com/admin`
2. Create your admin account
3. Go to **Settings → API Tokens → Create new API token**
4. Name: `nextjs-read`, Type: **Read-only**, Duration: **Unlimited**
5. Copy the token — **you will only see it once**
6. Save it; you will add it to Vercel in the next phase

---

## Phase 2 — Deploy the Frontend to Vercel

### 2.1 Create the Project

1. Go to **Vercel Dashboard → Add New → Project**
2. Import your GitHub repository
3. Set **Root Directory** to `profile`
4. Framework preset: **Next.js** (auto-detected)
5. Leave build and output settings as defaults

### 2.2 Set Environment Variables

In **Project Settings → Environment Variables**, add:

| Variable | Value | Notes |
|---|---|---|
| `STRAPI_API_URL` | `https://<your-service>.onrender.com` | No trailing slash; from Render service URL |
| `STRAPI_API_TOKEN` | `<token from 1.4>` | The read-only token you generated above |
| `REVALIDATION_SECRET_TOKEN` | `<random>` | `openssl rand -base64 32` — must match Strapi webhook header |
| `RESEND_API_KEY` | `re_...` | From [Resend dashboard](https://resend.com) |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | `G-XXXXXXXXXX` | Google Analytics 4 measurement ID |
| `NEXT_PUBLIC_STRAPI_HOST` | `<your-service>.onrender.com` | Hostname only — used by `next/image` remote patterns |
| `NEXT_PUBLIC_SITE_URL` | `https://akashborkar.com` | Your production domain — used by sitemap + OG tags |

> **`NEXT_PUBLIC_STRAPI_HOST` note**: This is only needed if Strapi serves images directly from its `/uploads/` path. Once Cloudinary is configured (which it is), all media URLs point to `res.cloudinary.com` and this variable becomes a safety net, not the primary path. Still set it.

### 2.3 Deploy

Click **Deploy**. The build runs `npm run build` inside `profile/`. During the build, `generateStaticParams` in each dynamic route calls your Render Strapi API. The **cold-start retry utility** (`lib/utils/fetchStrapiData.ts`) handles any initial wake-up delay with exponential backoff (up to ~45 s).

Watch for:
```
✓ Generating static pages
✓ Collecting build traces
Route (app)   Size   First Load JS
```

---

## Phase 3 — Wire the SSG Webhook Loop

This is the key automation: publishing content in Strapi → triggers a Vercel rebuild → live site updates.

### 3.1 Generate a Vercel Deploy Hook

1. In Vercel: **Project Settings → Git → Deploy Hooks**
2. Click **Create Hook**
3. Hook name: `strapi-publish`, Branch: `main`
4. Click **Create** and **copy the hook URL** — it looks like:
   ```
   https://api.vercel.com/v1/integrations/deploy/prj_xxx/yyy
   ```

### 3.2 Configure the Webhook in Strapi

1. Open your deployed Strapi admin: `https://<your-service>.onrender.com/admin`
2. Go to **Settings → Webhooks → Add new webhook**
3. Fill in:

| Field | Value |
|---|---|
| **Name** | `Vercel Rebuild` |
| **URL** | The Deploy Hook URL from step 3.1 |
| **Headers** | *(leave empty — Vercel Deploy Hooks use no auth header)* |

4. Under **Events**, enable **only**:
   - ✅ `entry.publish`
   - ✅ `entry.unpublish`
   - Leave all others unchecked (create/update/delete do not affect published content)

5. Click **Save**

### 3.3 On-Demand ISR (existing — no change needed)

The project also has a **fine-grained revalidation webhook** at `/api/revalidate` (already deployed on Vercel). This handles instant cache invalidation without a full rebuild. For most content updates, configure Strapi's webhook to call both endpoints:

| Webhook | When to use | Effect |
|---|---|---|
| Vercel Deploy Hook | `entry.publish` / `entry.unpublish` | Full SSG rebuild — new pages appear |
| `/api/revalidate` with `Authorization: Bearer <REVALIDATION_SECRET_TOKEN>` | All entry events | Invalidates Next.js cache tags instantly without rebuild |

---

## Phase 4 — Post-Deployment Smoke Test

Run through this checklist after both services are live:

- [ ] `https://<render-service>.onrender.com/api/about-me?populate=*` returns JSON (not 401/403)
- [ ] `https://akashborkar.com` — all sections load content from Strapi
- [ ] `https://akashborkar.com/about` — full narrative renders
- [ ] `https://akashborkar.com/contact` — form submits; check inbox
- [ ] An internal blog post renders all block types (text, code, callout)
- [ ] An external blog post redirects correctly
- [ ] A case study renders challenge, solution, and linked skills
- [ ] `https://akashborkar.com/sitemap.xml` returns a valid sitemap
- [ ] `https://akashborkar.com/robots.txt` returns correct content
- [ ] Publish a new test entry in Strapi → Vercel build triggers → new content live within ~2 min
- [ ] Expired certifications do not appear on the frontend

---

## Troubleshooting Reference

| Symptom | Likely cause | Fix |
|---|---|---|
| Render build crashes with OOM | `NODE_OPTIONS` not set | Add `NODE_OPTIONS=--max-old-space-size=400` |
| Render build crashes with OOM even with flag | Free tier memory exhausted during `npm install` | Add `NPM_FLAGS=--prefer-offline` or use Render's paid tier |
| Strapi starts but DB tables missing | `DATABASE_CLIENT` not set to `postgres` | Confirm env var is exactly `postgres` |
| Neon connection refused | Wrong connection string variant | Use the **pooler** URL (contains `-pooler.` in hostname), not unpooled |
| Images not loading on frontend | `NEXT_PUBLIC_STRAPI_HOST` missing | Add the Render hostname (no `https://` prefix) to Vercel env vars |
| Vercel build fails: "Cannot fetch Strapi" | Render cold start exceeded retry window | Increase `maxRetries` in `fetchStrapiData` calls, or upgrade Render tier |
| CORS errors in browser | `FRONTEND_URL` not set or wrong | Set to your exact Vercel production URL in Render env vars |
| Revalidate webhook returns 401 | Token mismatch | Ensure `REVALIDATION_SECRET_TOKEN` matches in both Vercel and Strapi webhook header |
