import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('Authorization')
  const expectedToken = process.env.CRON_SECRET_TOKEN

  if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const strapiRes = await fetch(`${process.env.STRAPI_API_URL}/api/sync-linkedin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Sync-Token': process.env.RENDER_SYNC_TOKEN ?? '',
      },
    })

    if (strapiRes.ok) {
      return NextResponse.json({ triggered: true })
    }

    return NextResponse.json(
      { triggered: false, status: strapiRes.status },
      { status: 502 }
    )
  } catch {
    return NextResponse.json({ triggered: false, error: 'Network error' }, { status: 502 })
  }
}
