import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'

const MODEL_TO_TAG_MAP: Record<string, string[]> = {
  'about-me':                ['about-me'],
  'featured-curation':       ['featured-curations'],
  'skills-matrix':           ['skills-matrix'],
  project:                   ['projects'],
  blog:                      ['blogs'],
  gallery:                   ['gallery'],
  certification:             ['certifications'],
  'engagement-and-activity': ['engagements'],
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.REVALIDATION_SECRET_TOKEN}`) {
    return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 })
  }

  let body: { model?: string; slug?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 })
  }

  const { model, slug } = body
  if (!model || !MODEL_TO_TAG_MAP[model]) {
    return NextResponse.json({ message: 'Unknown or missing model type' }, { status: 400 })
  }

  const tags = MODEL_TO_TAG_MAP[model]
  tags.forEach((tag) => revalidateTag(tag, 'default'))

  if (slug) {
    revalidateTag(slug, 'default')
  }

  return NextResponse.json({ revalidated: true, tags, now: Date.now() })
}
