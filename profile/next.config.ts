import type { NextConfig } from "next";

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Local Strapi dev server
      { protocol: 'http', hostname: 'localhost', port: '1337', pathname: '/uploads/**' },
      // Production Strapi (Railway/Render — set NEXT_PUBLIC_STRAPI_HOST env var)
      ...(process.env.NEXT_PUBLIC_STRAPI_HOST
        ? [{ protocol: 'https' as const, hostname: process.env.NEXT_PUBLIC_STRAPI_HOST, pathname: '/uploads/**' }]
        : []),
      // Cloudinary media (used by Strapi cloud storage provider)
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
    ],
  },
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  },
};

export default nextConfig;
