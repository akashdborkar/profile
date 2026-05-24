import { NextRequest, NextResponse } from 'next/server'
import { triggerLinkedInActorRun } from '@/lib/apify'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('Authorization')
  const expectedToken = process.env.CRON_SECRET

  if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const apifyToken = process.env.APIFY_TOKEN
  const actorId = process.env.APIFY_ACTOR_ID
  const profileUrl = process.env.LINKEDIN_PROFILE_URL
  const webhookSecret = process.env.APIFY_WEBHOOK_SECRET
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

  if (!apifyToken || !actorId || !profileUrl || !webhookSecret || !siteUrl) {
    return NextResponse.json({ error: 'Missing Apify configuration env vars' }, { status: 500 })
  }

  try {
    const webhookUrl = `${siteUrl}/api/webhooks/apify-linkedin?secret=${webhookSecret}`
    const { runId } = await triggerLinkedInActorRun({ apifyToken, actorId, profileUrl, webhookUrl })
    return NextResponse.json({ triggered: true, runId })
  } catch (err) {
    return NextResponse.json(
      { triggered: false, error: err instanceof Error ? err.message : 'Apify trigger failed' },
      { status: 502 }
    )
  }
}
