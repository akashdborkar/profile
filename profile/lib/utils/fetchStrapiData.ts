// next: { tags, revalidate } is a Next.js extension to RequestInit not in the standard lib types.
type NextFetchInit = Omit<RequestInit, 'next'> & {
  next?: { tags?: string[]; revalidate?: number | false }
}

export interface FetchStrapiOptions {
  /** Next.js on-demand revalidation tags */
  tags?: string[]
  /** Next.js cache revalidation interval in seconds; false = no-store */
  revalidate?: number | false
  /** Total retry attempts after the first failure (default: 4) */
  maxRetries?: number
  /** Base delay in ms before the first retry; doubles each attempt (default: 3000) */
  initialDelayMs?: number
  /** Per-request abort timeout in ms (default: 10000) */
  timeoutMs?: number
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

/**
 * Resilient build-time fetch for Strapi with exponential backoff.
 * Designed for Vercel SSG builds hitting a Render free-tier backend that
 * may need up to ~60 s to cold-start.
 *
 * Delays:  attempt 1→2: initialDelayMs
 *          attempt 2→3: initialDelayMs × 2
 *          attempt n→n+1: initialDelayMs × 2^(n-1)
 */
export async function fetchStrapiData<T>(
  path: string,
  options: FetchStrapiOptions = {}
): Promise<T> {
  const {
    tags = [],
    revalidate,
    maxRetries = 4,
    initialDelayMs = 3_000,
    timeoutMs = 10_000,
  } = options

  const url = `${process.env.STRAPI_API_URL}${path}`
  const token = process.env.STRAPI_API_TOKEN
  const totalAttempts = maxRetries + 1

  let lastError: Error | null = null

  for (let attempt = 0; attempt < totalAttempts; attempt++) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const init: NextFetchInit = {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
        next: {
          tags,
          ...(revalidate !== undefined && { revalidate }),
        },
      }

      const res = await fetch(url, init as RequestInit)
      clearTimeout(timeoutId)

      if (!res.ok) {
        throw new Error(`${res.status} ${res.statusText}`)
      }

      return res.json() as Promise<T>
    } catch (err) {
      clearTimeout(timeoutId)
      lastError = err instanceof Error ? err : new Error(String(err))

      const remaining = totalAttempts - attempt - 1
      if (remaining > 0) {
        const delay = initialDelayMs * 2 ** attempt
        console.warn(
          `[fetchStrapiData] Attempt ${attempt + 1}/${totalAttempts} failed (${lastError.message}). ` +
            `Retrying in ${delay}ms… (${remaining} attempt${remaining === 1 ? '' : 's'} left)`
        )
        await sleep(delay)
      }
    }
  }

  throw new Error(
    `[fetchStrapiData] All ${totalAttempts} attempts failed for ${url}. ` +
      `Last error: ${lastError?.message}`
  )
}
