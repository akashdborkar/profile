import { env } from './env'

export async function strapiRequest<T>(
  path: string,
  options: { tags?: string[]; revalidate?: number | false } = {}
): Promise<T> {
  const { tags = [], revalidate } = options

  const res = await fetch(`${env.strapiUrl}${path}`, {
    headers: {
      Authorization: `Bearer ${env.strapiToken}`,
    },
    next: {
      tags,
      ...(revalidate !== undefined && { revalidate }),
    },
  })

  if (!res.ok) {
    throw new Error(
      `Strapi request failed: ${res.status} ${res.statusText} — ${env.strapiUrl}${path}`
    )
  }

  return res.json()
}
