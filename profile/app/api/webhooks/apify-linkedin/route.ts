import { NextRequest, NextResponse } from 'next/server'
import { fetchDatasetItems, transformLinkedInOutput } from '@/lib/apify'

interface ApifyWebhookPayload {
  eventType: string
  resource: {
    id: string
    status: string
    defaultDatasetId: string
  }
}

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (!secret || secret !== process.env.APIFY_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let payload: ApifyWebhookPayload
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Apify requires a 2xx response or it will retry — always return 200 after validation
  if (payload.resource.status !== 'SUCCEEDED') {
    console.error(`[apify-webhook] Run ${payload.resource.id} ended with status: ${payload.resource.status}`)
    return NextResponse.json({ skipped: true, status: payload.resource.status })
  }

  const apifyToken = process.env.APIFY_TOKEN
  if (!apifyToken) {
    return NextResponse.json({ error: 'APIFY_TOKEN not configured' }, { status: 500 })
  }

  let items: unknown[]
  try {
    items = await fetchDatasetItems(payload.resource.defaultDatasetId, apifyToken)
  } catch (err) {
    console.error('[apify-webhook] Failed to fetch dataset:', err)
    return NextResponse.json({ error: 'Dataset fetch failed' }, { status: 502 })
  }

  const syncPayload = transformLinkedInOutput(items)
  console.log(`[apify-webhook] Transformed: ${syncPayload.certifications.length} certs, ${syncPayload.featuredPosts.length} posts`)

  const strapiRes = await fetch(`${process.env.STRAPI_API_URL}/api/sync-linkedin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Sync-Token': process.env.RENDER_SYNC_TOKEN ?? '',
    },
    body: JSON.stringify(syncPayload),
  })

  if (!strapiRes.ok) {
    const text = await strapiRes.text()
    console.error(`[apify-webhook] Strapi sync failed: ${strapiRes.status} — ${text}`)
    return NextResponse.json({ error: 'Strapi sync failed', status: strapiRes.status }, { status: 502 })
  }

  const result = await strapiRes.json()
  return NextResponse.json({ success: true, ...result })
}
