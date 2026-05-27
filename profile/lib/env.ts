if (typeof window !== 'undefined') {
  throw new Error(
    'lib/env.ts must not be imported from client-side code. ' +
    'Use NEXT_PUBLIC_ prefixed variables for client-side access.'
  )
}

export const env = {
  strapiUrl: process.env.STRAPI_API_URL!,
  strapiToken: process.env.STRAPI_API_TOKEN!,
  revalidationToken: process.env.REVALIDATION_SECRET_TOKEN!,
  gaId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!,
} as const
