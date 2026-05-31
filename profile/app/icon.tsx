import { ImageResponse } from 'next/og'
import { fetchAboutMe } from '@/lib/api'
import { env } from '@/lib/env'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default async function Icon() {
  let imageUrl: string | null = null

  try {
    const aboutMe = await fetchAboutMe()
    const rawUrl = aboutMe?.profileImage?.url ?? null
    if (rawUrl) {
      imageUrl = rawUrl.startsWith('http')
        ? (rawUrl.includes('res.cloudinary.com')
            ? rawUrl.replace('/upload/', '/upload/g_face,c_thumb,w_64,h_64,f_auto,q_auto/')
            : rawUrl)
        : `${env.strapiUrl}${rawUrl}`
    }
  } catch {
    // use initials fallback
  }

  return new ImageResponse(
    imageUrl ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        width={32}
        height={32}
        style={{ objectFit: 'cover', borderRadius: '50%' }}
        alt=""
      />
    ) : (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: '#3b82f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: 13,
          fontWeight: 700,
          fontFamily: 'sans-serif',
        }}
      >
        AB
      </div>
    ),
    { ...size },
  )
}
